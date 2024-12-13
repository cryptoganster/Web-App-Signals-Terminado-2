import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface UpdateStatusModalProps {
  onClose: () => void;
  onConfirm: (
    activationType: 'manual' | 'automatic',
    manualPrice?: string,
    comments?: string,
    tradingViewUrl?: string,
    notifyTelegram?: boolean
  ) => void;
  defaultEntry: string;
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ 
  onClose, 
  onConfirm,
  defaultEntry 
}) => {
  const [activationType, setActivationType] = useState<'manual' | 'automatic'>('automatic');
  const [manualPrice, setManualPrice] = useState('');
  const [comments, setComments] = useState('');
  const [tradingViewUrl, setTradingViewUrl] = useState('');
  const [notifyTelegram, setNotifyTelegram] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(
      activationType,
      activationType === 'manual' ? manualPrice : defaultEntry,
      comments,
      tradingViewUrl,
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
              <h2 className="text-xl font-bold">Activate Signal</h2>
              <Button variant="secondary" onClick={onClose} className="p-2">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <form id="activationForm" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activation Type
                </label>
                <select
                  value={activationType}
                  onChange={(e) => setActivationType(e.target.value as 'manual' | 'automatic')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="automatic">Automatic (Use Entry 1)</option>
                  <option value="manual">Manual Price</option>
                </select>
              </div>

              {activationType === 'manual' && (
                <Input
                  label="Manual Price"
                  type="text"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  placeholder="Enter activation price"
                />
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
              <Button type="submit" form="activationForm" className="w-full sm:w-auto">
                Activate Signal
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};