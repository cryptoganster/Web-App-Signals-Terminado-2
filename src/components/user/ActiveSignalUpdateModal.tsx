import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ActiveSignalUpdateModalProps {
  onClose: () => void;
  onConfirm: (
    updateType: 'takeProfit' | 'stopLoss' | 'completed' | 'entry',
    targetIndex?: number,
    comments?: string,
    tradingViewUrl?: string,
    reward?: string,
    notifyTelegram?: boolean
  ) => void;
  takeProfitCount: number;
  stopLossCount: number;
  entryCount: number;
}

export const ActiveSignalUpdateModal: React.FC<ActiveSignalUpdateModalProps> = ({
  onClose,
  onConfirm,
  takeProfitCount,
  stopLossCount,
  entryCount
}) => {
  const [updateType, setUpdateType] = useState<'takeProfit' | 'stopLoss' | 'completed' | 'entry'>('takeProfit');
  const [targetIndex, setTargetIndex] = useState<number>(1);
  const [comments, setComments] = useState('');
  const [tradingViewUrl, setTradingViewUrl] = useState('');
  const [reward, setReward] = useState('');
  const [notifyTelegram, setNotifyTelegram] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(
      updateType,
      updateType !== 'completed' ? targetIndex : undefined,
      comments,
      tradingViewUrl,
      reward,
      notifyTelegram
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
        className="bg-white rounded-lg shadow-xl w-full max-w-lg"
      >
        <div className="max-h-[85vh] overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 px-4 py-3 sm:px-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Update Signal Status</h2>
              <Button variant="secondary" onClick={onClose} className="p-2">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <form id="updateForm" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Type
                </label>
                <select
                  value={updateType}
                  onChange={(e) => setUpdateType(e.target.value as 'takeProfit' | 'stopLoss' | 'completed' | 'entry')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {entryCount > 1 && <option value="entry">Entry Hit</option>}
                  <option value="takeProfit">Take Profit Hit</option>
                  <option value="stopLoss">Stop Loss Hit</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {updateType !== 'completed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Level
                  </label>
                  <select
                    value={targetIndex}
                    onChange={(e) => setTargetIndex(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from(
                      { length: updateType === 'takeProfit' 
                          ? takeProfitCount 
                          : updateType === 'stopLoss'
                            ? stopLossCount
                            : entryCount 
                      }, 
                      (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {updateType === 'takeProfit' 
                            ? `Take Profit ${i + 1}` 
                            : updateType === 'stopLoss'
                              ? `Stop Loss ${i + 1}`
                              : `Entry ${i + 1}`}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              <Input
                label="TradingView URL"
                type="text"
                value={tradingViewUrl}
                onChange={(e) => setTradingViewUrl(e.target.value)}
                placeholder="Enter TradingView chart URL"
              />

              <Input
                label="Reward"
                type="text"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder="e.g., 2R or 5%"
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
              <Button type="submit" form="updateForm" className="w-full sm:w-auto">
                Update Status
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};