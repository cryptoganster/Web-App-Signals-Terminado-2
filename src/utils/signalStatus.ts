import { SignalStatus } from '../types/signal';

export const getStatusText = (status: SignalStatus): string => {
  switch (status) {
    case 'partial-profits':
      return 'Partial Profits';
    case 'stopped':
      return 'Stopped';
    case 'completed':
      return 'Completed';
    default:
      if (status.startsWith('take-profit-')) {
        const number = status.split('-')[2];
        return `Take Profit ${number}`;
      }
      if (status.startsWith('stop-loss-')) {
        return 'Stopped';
      }
      if (status.startsWith('entry-')) {
        const number = status.split('-')[2];
        return `Entry ${number}`;
      }
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export const getStatusColor = (status: SignalStatus): string => {
  switch (status) {
    case 'partial-profits':
      return 'bg-green-100 text-green-800';
    case 'stopped':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    default:
      if (status.startsWith('take-profit-')) {
        return 'bg-green-100 text-green-800';
      }
      if (status.startsWith('stop-loss-')) {
        return 'bg-red-100 text-red-800';
      }
      if (status.startsWith('entry-')) {
        return 'bg-blue-100 text-blue-800';
      }
      return 'bg-gray-100 text-gray-800';
  }
};