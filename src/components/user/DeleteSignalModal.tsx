import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TradingSignal } from '../../types/signal';

interface DeleteSignalModalProps {
  signal: TradingSignal;
  onClose: () => void;
  onConfirm: (
    signal: TradingSignal,
    lastTakeProfit?: number,
    hitStopLoss?: boolean,
    comments?: string,
    tradingViewUrl?: string,
    reward?: string,
    notifyTelegram?: boolean
  ) => void;
}

export const DeleteSignalModal: React.FC<DeleteSignalModalProps> = ({
  signal,
  onClose,
  onConfirm,
}) => {
  const currentTakeProfit = signal.status?.startsWith('take-profit-')
    ? parseInt(signal.status.split('-')[2])
    : undefined;

  const [lastTakeProfit, setLastTakeProfit] = useState<number | undefined>(currentTakeProfit);
  const [hitStopLoss, setHitStopLoss] = useState(false);
  const [comments, setComments] = useState('');
  const [tradingViewUrl, setTradingViewUrl] = useState('');
  const [reward, setReward] = useState('');
  const [notifyTelegram, setNotifyTelegram] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(
      signal,
      lastTakeProfit,
      hitStopLoss,
      comments,
      tradingViewUrl,
      reward,
      notifyTelegram
    );
  };

  const isPendingSignal = signal.status === 'pending';

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
        className="bg-white rounded-lg shadow-xl w-full max-w-lg"
      >
        <div className="max-h-[85vh] overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 px-4 py-3 sm:px-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Delete Signal</h2>
              <Button variant="secondary" onClick={onClose} className="p-2">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <form id="deleteForm" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {!isPendingSignal && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="takeProfit"
                        checked={!hitStopLoss}
                        onChange={() => setHitStopLoss(false)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="takeProfit" className="text-sm text-gray-700">
                        Take Profit Hit
                      </label>
                    </div>
                    
                    {!hitStopLoss && (
                      <div className="ml-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Take Profit Hit
                        </label>
                        <select
                          value={lastTakeProfit || ''}
                          onChange={(e) => setLastTakeProfit(Number(e.target.value))}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Take Profit</option>
                          {Array.from({ length: signal.takeProfits.length }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              Take Profit {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="stopLoss"
                        checked={hitStopLoss}
                        onChange={() => setHitStopLoss(true)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="stopLoss" className="text-sm text-gray-700">
                        Stop Loss Hit
                      </label>
                    </div>
                  </div>

                  <Input
                    label="Reward"
                    type="text"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    placeholder="e.g., 2R or 5%"
                  />
                </>
              )}

              <Input
                label="TradingView URL"
                type="text"
                value={tradingViewUrl}
                onChange={(e) => setTradingViewUrl(e.target.value)}
                placeholder="Enter TradingView chart URL"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any additional comments..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notifyTelegram"
                  checked={notifyTelegram}
                  onChange={(e) => setNotifyTelegram(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifyTelegram" className="text-sm text-gray-700">
                  Send notification to Telegram
                </label>
              </div>
            </form>
          </div>

          <div className="sticky bottom-0 bg-white border-t px-4 py-3 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" form="deleteForm" className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
                Delete Signal
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};