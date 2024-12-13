import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { TradingSignal } from '../../types/signal';

interface SignalDetailsModalProps {
  signal: TradingSignal;
  onClose: () => void;
}

export const SignalDetailsModal: React.FC<SignalDetailsModalProps> = ({ signal, onClose }) => {
  const getPositionColor = (position: string) => {
    switch (position) {
      case 'Long':
        return 'bg-green-100 text-green-800';
      case 'Short':
        return 'bg-red-100 text-red-800';
      case 'Spot':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-blue-100 text-blue-800'
      : 'bg-amber-100 text-amber-800';
  };

  const renderSection = (title: string, items?: string[]) => {
    if (!items?.length) return null;
    
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900">{title}:</h3>
        {items.map((item, index) => (
          <div key={index} className="flex items-start space-x-2 text-sm">
            <span className="text-gray-500">•</span>
            <span className="text-gray-900">{item}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
      >
        <div className="px-4 py-3 sm:px-6 border-b flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">{signal.pair}</h2>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(signal.position)}`}>
              {signal.position}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(signal.status)}`}>
              {signal.status}
            </span>
          </div>
          <Button variant="secondary" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="space-y-6">
            {renderSection('Entry', signal.entries.map(e => e.price))}
            {renderSection('Stop Loss', signal.stopLosses.map(sl => sl.price))}
            {renderSection('Take Profit', signal.takeProfits.map(tp => tp.price))}
            
            {signal.riskReward && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900">Risk Reward:</h3>
                <div className="flex items-start space-x-2 text-sm">
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-900">{signal.riskReward}</span>
                </div>
              </div>
            )}

            {signal.tradingViewUrl && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900">TradingView Chart:</h3>
                <a 
                  href={signal.tradingViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 break-all text-sm"
                >
                  {signal.tradingViewUrl}
                </a>
              </div>
            )}

            {signal.comments && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900">Comments:</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{signal.comments}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};