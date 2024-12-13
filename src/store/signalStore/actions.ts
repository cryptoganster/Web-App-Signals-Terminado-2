import { TradingSignal, NewSignalFormData, SignalStatus } from '../../types/signal';
import { SignalService } from '../../services/signalService';
import { TelegramService } from '../../services/telegramService';
import { TELEGRAM_CONFIG } from '../../config/telegram';
import { useAuthStore } from '../authStore';
import { getActiveSignals, getPendingSignals } from './selectors';

const telegramService = new TelegramService(
  TELEGRAM_CONFIG.BOT_TOKEN,
  TELEGRAM_CONFIG.CHAT_ID,
  TELEGRAM_CONFIG.TOPIC_ID,
  TELEGRAM_CONFIG.ACTIVATION_TOPIC_ID,
  TELEGRAM_CONFIG.SIGNAL_LIST_TOPIC_ID
);

export const createActions = (set: Function, get: Function) => ({
  removeSignal: async (id: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    try {
      const signal = get().signals.find(s => s.id === id);
      if (!signal) return;

      // Handle different deletion scenarios
      if (signal.status === 'pending') {
        // For pending signals: send cancel notification first
        await telegramService.sendCancelNotification(signal, currentUser);
        
        // Then delete from DB
        await SignalService.deleteSignal(id);
        
        // Finally update local state
        set(state => ({
          signals: state.signals.filter(s => s.id !== id)
        }));
      } else if (signal.status === 'active' || signal.status.startsWith('take-profit-')) {
        // For active signals: determine appropriate status
        const hasTakeProfitHits = signal.status.startsWith('take-profit-');
        const newStatus = hasTakeProfitHits ? 'partial-profits' : 'stopped';
        
        // Update status in DB first
        await SignalService.updateSignalStatus(id, newStatus);
        
        // Then update local state
        set(state => ({
          signals: state.signals.map(s => 
            s.id === id ? { ...s, status: newStatus } : s
          )
        }));
      } else if (signal.status === 'completed' || signal.status === 'partial-profits' || signal.status === 'stopped') {
        // For history signals: delete from DB and local state
        await SignalService.deleteSignal(id);
        
        set(state => ({
          signals: state.signals.filter(s => s.id !== id)
        }));
      }

      // After all state updates, get current signals and send updated list
      const updatedSignals = get().signals;
      const activeSignals = getActiveSignals(updatedSignals);
      const pendingSignals = getPendingSignals(updatedSignals);

      // Always send updated signal list to Telegram after any deletion
      await telegramService.sendSignalListNotification(activeSignals, pendingSignals);
    } catch (error) {
      console.error('Error removing signal:', error);
      throw error;
    }
  }
});