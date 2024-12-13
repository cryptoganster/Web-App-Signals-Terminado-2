import { create } from 'zustand';
import { SignalState } from './types';
import { createActions } from './actions';
import { getActiveSignals, getPendingSignals, getClosedSignals } from './selectors';
import { SignalService } from '../../services/signalService';

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

  ...createActions(set, get),
  
  getActiveSignals: () => getActiveSignals(get().signals),
  getPendingSignals: () => getPendingSignals(get().signals),
  getClosedSignals: () => getClosedSignals(get().signals)
}));