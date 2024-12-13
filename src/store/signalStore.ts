import { create } from 'zustand';
import { TradingSignal, NewSignalFormData, SignalStatus } from '../types/signal';
import { useAuthStore } from './authStore';
import { SignalService } from '../services/signalService';
import { TelegramService } from '../services/telegramService';
import { TELEGRAM_CONFIG } from '../config/telegram';

const telegramService = new TelegramService(
  TELEGRAM_CONFIG.BOT_TOKEN,
  TELEGRAM_CONFIG.CHAT_ID,
  TELEGRAM_CONFIG.TOPIC_ID,
  TELEGRAM_CONFIG.ACTIVATION_TOPIC_ID,
  TELEGRAM_CONFIG.SIGNAL_LIST_TOPIC_ID
);

interface SignalState {
  signals: TradingSignal[];
  initialize: () => Promise<void>;
  cleanup: () => void;
  addSignal: (signal: NewSignalFormData) => Promise<void>;
  editSignal: (id: string, updatedSignal: NewSignalFormData) => Promise<void>;
  removeSignal: (id: string) => Promise<void>;
  updateSignalStatus: (
    id: string, 
    status: SignalStatus,
    activationType?: 'manual' | 'automatic',
    manualPrice?: string,
    comments?: string,
    tradingViewUrl?: string,
    notifyTelegram?: boolean,
    reward?: string,
    updateType?: 'takeProfit' | 'stopLoss' | 'completed' | 'entry',
    targetIndex?: number
  ) => Promise<void>;
  getActiveSignals: () => TradingSignal[];
  getPendingSignals: () => TradingSignal[];
  getClosedSignals: () => TradingSignal[];
}

export const useSignalStore = create<SignalState>((set, get) => ({
  signals: [],

  initialize: async () => {
    try {
      const signals = await SignalService.getSignals();
      set({ signals });
    } catch (error) {
      console.error('Error initializing signals:', error);
    }
  },

  cleanup: () => {
    set({ signals: [] });
  },

  addSignal: async (signalData: NewSignalFormData) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    try {
      const signal = await SignalService.createSignal(signalData, currentUser);
      
      if (signalData.notifyTelegram) {
        const result = await telegramService.sendSignalNotification(signal, currentUser);
        if (result.success && result.messageId) {
          await SignalService.updateSignalTelegramId(signal.id, result.messageId);
          signal.telegramMessageId = result.messageId;
        }
      }

      set(state => ({ signals: [signal, ...state.signals] }));
      
      // Update signal list in Telegram
      const activeSignals = get().getActiveSignals();
      const pendingSignals = get().getPendingSignals();
      if (activeSignals.length > 0 || pendingSignals.length > 0) {
        await telegramService.sendSignalListNotification(activeSignals, pendingSignals);
      }
    } catch (error) {
      console.error('Error adding signal:', error);
    }
  },

  editSignal: async (id: string, updatedSignal: NewSignalFormData) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    try {
      const { signal, changes } = await SignalService.updateSignal(id, updatedSignal);
      
      if (updatedSignal.notifyTelegram) {
        const result = await telegramService.sendSignalModification(
          signal,
          currentUser,
          changes,
          signal.lastModificationId || signal.telegramMessageId
        );
        if (result.success && result.messageId) {
          await SignalService.updateSignalLastModificationId(id, result.messageId);
          signal.lastModificationId = result.messageId;
        }
      }

      set(state => ({
        signals: state.signals.map(s => s.id === id ? signal : s)
      }));

      // Update signal list in Telegram
      const activeSignals = get().getActiveSignals();
      const pendingSignals = get().getPendingSignals();
      if (activeSignals.length > 0 || pendingSignals.length > 0) {
        await telegramService.sendSignalListNotification(activeSignals, pendingSignals);
      }
    } catch (error) {
      console.error('Error updating signal:', error);
    }
  },

  removeSignal: async (id: string) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    try {
      const signal = get().signals.find(s => s.id === id);
      if (!signal) return;

      // If it's a pending signal, send cancel notification before removing
      if (signal.status === 'pending') {
        await telegramService.sendCancelNotification(signal, currentUser);
      }

      await SignalService.deleteSignal(id);
      
      set(state => ({
        signals: state.signals.filter(s => s.id !== id)
      }));

      // Update signal list in Telegram
      const activeSignals = get().getActiveSignals();
      const pendingSignals = get().getPendingSignals();
      if (activeSignals.length > 0 || pendingSignals.length > 0) {
        await telegramService.sendSignalListNotification(activeSignals, pendingSignals);
      }
    } catch (error) {
      console.error('Error removing signal:', error);
    }
  },

  updateSignalStatus: async (
    id: string,
    status: SignalStatus,
    activationType?: 'manual' | 'automatic',
    manualPrice?: string,
    comments?: string,
    tradingViewUrl?: string,
    notifyTelegram?: boolean,
    reward?: string,
    updateType?: 'takeProfit' | 'stopLoss' | 'completed' | 'entry',
    targetIndex?: number
  ) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    try {
      const signal = await SignalService.updateSignalStatus(
        id,
        status,
        comments,
        tradingViewUrl,
        reward
      );

      if (notifyTelegram) {
        let result;
        if (status === 'active' && activationType) {
          result = await telegramService.sendActivationNotification(
            signal,
            currentUser,
            activationType,
            activationType === 'manual' ? manualPrice! : signal.entries[0].price
          );
        } else if (updateType) {
          result = await telegramService.sendHitNotification(
            signal,
            currentUser,
            updateType,
            targetIndex
          );
        }

        if (result?.success && result.messageId) {
          await SignalService.updateSignalLastModificationId(id, result.messageId);
          signal.lastModificationId = result.messageId;
        }
      }

      set(state => ({
        signals: state.signals.map(s => s.id === id ? signal : s)
      }));

      // Update signal list in Telegram
      const activeSignals = get().getActiveSignals();
      const pendingSignals = get().getPendingSignals();
      if (activeSignals.length > 0 || pendingSignals.length > 0) {
        await telegramService.sendSignalListNotification(activeSignals, pendingSignals);
      }
    } catch (error) {
      console.error('Error updating signal status:', error);
    }
  },

  getActiveSignals: () => {
    return get().signals.filter(signal => 
      signal.status === 'active' || 
      signal.status.startsWith('take-profit-') || 
      signal.status.startsWith('entry-')
    );
  },

  getPendingSignals: () => {
    return get().signals.filter(signal => 
      signal.status === 'pending'
    );
  },

  getClosedSignals: () => {
    return get().signals.filter(signal => 
      signal.status === 'completed' || 
      signal.status === 'partial-profits' ||
      signal.status === 'stopped' ||
      signal.status.startsWith('stop-loss-')
    ).sort((a, b) => b.createdAt - a.createdAt);
  }
}));