import { TradingSignal } from '../../types/signal';

export const getActiveSignals = (signals: TradingSignal[]) => 
  signals.filter(signal => 
    signal.status === 'active' || 
    signal.status.startsWith('take-profit-') || 
    signal.status.startsWith('entry-')
  );

export const getPendingSignals = (signals: TradingSignal[]) => 
  signals.filter(signal => signal.status === 'pending');

export const getClosedSignals = (signals: TradingSignal[]) => 
  signals.filter(signal => 
    signal.status === 'completed' || 
    signal.status === 'partial profits' ||
    signal.status === 'stopped' ||
    signal.status.startsWith('stop-loss-')
  ).sort((a, b) => b.createdAt - a.createdAt);