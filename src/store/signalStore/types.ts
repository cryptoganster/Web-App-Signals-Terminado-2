import { TradingSignal, NewSignalFormData, SignalStatus } from '../../types/signal';

export interface SignalState {
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