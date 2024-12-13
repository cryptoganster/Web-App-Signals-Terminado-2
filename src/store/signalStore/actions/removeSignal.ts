import { TradingSignal } from '../../../types/signal';
import { SignalService } from '../../../services/signalService';
import { TelegramService } from '../../../services/telegramService';
import { TELEGRAM_CONFIG } from '../../../config/telegram';
import { useAuthStore } from '../../authStore';
import { getActiveSignals, getPendingSignals } from '../selectors';

const telegramService = new TelegramService(
  TELEGRAM_CONFIG.BOT_TOKEN,
  TELEGRAM_CONFIG.CHAT_ID,
  TELEGRAM_CONFIG.TOPIC_ID,
  TELEGRAM_CONFIG.ACTIVATION_TOPIC_ID,
  TELEGRAM_CONFIG.SIGNAL_LIST_TOPIC_ID
);

export const createRemoveSignalAction = (set: Function, get: Function) => async (id: string) => {
  const currentUser = useAuthStore.getState().user;
  if (!currentUser) return;

  try {
    const signal = get().signals.find(s => s.id === id);
    if (!signal) return;

    // For pending signals
    if (signal.status === 'pending') {
      // Send cancel notification first
      await telegramService.sendCancelNotification(signal, currentUser);
      
      // Then delete from database
      await SignalService.deleteSignal(id);
      
      // Update local state
      set(state => ({
        signals: state.signals.filter(s => s.id !== id)
      }));
    } 
    // For active signals or signals with take profit hits
    else if (signal.status === 'active' || signal.status.startsWith('take-profit-')) {
      const hasTakeProfitHits = signal.status.startsWith('take-profit-');
      const newStatus = hasTakeProfitHits ? 'partial profits' : 'stopped';
      
      // Update status in database first
      const updatedSignal = await SignalService.updateSignalStatus(
        id,
        newStatus,
        undefined,
        undefined,
        'Signal moved to history'
      );
      
      // Update local state
      set(state => ({
        signals: state.signals.map(s => 
          s.id === id ? updatedSignal : s
        )
      }));
    } 
    // For signals in history
    else if (signal.status === 'completed' || signal.status === 'partial profits' || signal.status === 'stopped') {
      // Delete completely
      await SignalService.deleteSignal(id);
      
      // Update local state
      set(state => ({
        signals: state.signals.filter(s => s.id !== id)
      }));
    }

    // After all updates, send updated signal list to Telegram
    const updatedSignals = get().signals;
    const activeSignals = getActiveSignals(updatedSignals);
    const pendingSignals = getPendingSignals(updatedSignals);
    
    if (activeSignals.length > 0 || pendingSignals.length > 0) {
      await telegramService.sendSignalListNotification(activeSignals, pendingSignals);
    }
  } catch (error) {
    console.error('Error removing signal:', error);
    throw error;
  }
};