import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { NewSignalFormData, SignalType, PositionType, TradingSignal } from '../../types/signal';
import { validateSignalType, validatePosition, validatePriceLevels, validateLeverage } from '../../utils/signalValidation';

interface NewSignalModalProps {
  onClose: () => void;
  editingSignal?: TradingSignal | null;
  onSubmit: (formData: NewSignalFormData, editingId?: string) => Promise<void>;
  hideNotifyTelegram?: boolean;
}

export const NewSignalModal: React.FC<NewSignalModalProps> = ({ 
  onClose, 
  editingSignal, 
  onSubmit,
  hideNotifyTelegram = false
}) => {
  const [formData, setFormData] = useState<NewSignalFormData>({
    pair: '',
    type: 'Limit',
    position: 'Spot',
    entries: [{ price: '', id: crypto.randomUUID() }],
    stopLosses: [{ price: '', id: crypto.randomUUID() }],
    takeProfits: [{ price: '', id: crypto.randomUUID() }],
    comments: '',
    tradingViewUrl: '',
    riskReward: '',
    notifyTelegram: !hideNotifyTelegram
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingSignal) {
      setFormData({
        ...editingSignal,
        comments: '',
        tradingViewUrl: '',
        riskReward: '',
        notifyTelegram: !hideNotifyTelegram
      });
    }
  }, [editingSignal, hideNotifyTelegram]);

  const handlePriceLevelChange = (
    type: 'entries' | 'stopLosses' | 'takeProfits',
    id: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].map((level) =>
        level.id === id ? { ...level, price: value } : level
      ),
    }));
  };

  const addPriceLevel = (type: 'entries' | 'stopLosses' | 'takeProfits') => {
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], { price: '', id: crypto.randomUUID() }],
    }));
  };

  const removePriceLevel = (type: 'entries' | 'stopLosses' | 'takeProfits', id: string) => {
    if (formData[type].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [type]: prev[type].filter((level) => level.id !== id),
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.pair.trim()) {
      setError('Trading pair is required');
      return false;
    }

    if (!validateSignalType(formData.type)) {
      setError('Invalid signal type');
      return false;
    }

    if (!validatePosition(formData.position)) {
      setError('Invalid position type');
      return false;
    }

    if (formData.leverage && !validateLeverage(formData.leverage as string)) {
      setError('Invalid leverage value');
      return false;
    }

    if (!validatePriceLevels(formData.entries)) {
      setError('All entry prices are required');
      return false;
    }

    if (!validatePriceLevels(formData.stopLosses)) {
      setError('All stop loss prices are required');
      return false;
    }

    if (!validatePriceLevels(formData.takeProfits)) {
      setError('All take profit prices are required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData, editingSignal?.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit signal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPriceLevels = (
    type: 'entries' | 'stopLosses' | 'takeProfits',
    label: string
  ) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <Button
          type="button"
          variant="secondary"
          onClick={() => addPriceLevel(type)}
          className="p-1"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {formData[type].map((level, index) => (
        <div key={level.id} className="flex space-x-2">
          <Input
            label=""
            type="text"
            value={level.price}
            onChange={(e) => handlePriceLevelChange(type, level.id, e.target.value)}
            placeholder={`${label} ${index + 1}`}
          />
          {formData[type].length > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => removePriceLevel(type, level.id)}
              className="p-2 mt-1"
            >
              <Minus className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8"
      >
        <div className="sticky top-0 bg-white z-10 px-4 py-3 sm:px-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {editingSignal ? 'Edit Signal' : 'New Trading Signal'}
            </h2>
            <Button variant="secondary" onClick={onClose} className="p-2">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <Input
              label="Trading Pair"
              type="text"
              value={formData.pair}
              onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
              placeholder="e.g., BTC/USDT"
              disabled={!!editingSignal}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as SignalType })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!editingSignal}
                >
                  <option value="Limit">Limit</option>
                  <option value="Market">Market</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as PositionType })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!editingSignal}
                >
                  <option value="Spot">Spot</option>
                  <option value="Long">Long</option>
                  <option value="Short">Short</option>
                </select>
              </div>
            </div>

            {(formData.position === 'Long' || formData.position === 'Short') && (
              <Input
                label="Leverage"
                type="text"
                value={formData.leverage || ''}
                onChange={(e) => setFormData({ ...formData, leverage: e.target.value })}
                placeholder="e.g., 10"
                disabled={!!editingSignal}
              />
            )}

            {renderPriceLevels('entries', 'Entry')}
            {renderPriceLevels('stopLosses', 'Stop Loss')}
            {renderPriceLevels('takeProfits', 'Take Profit')}

            <Input
              label="TradingView URL"
              type="text"
              value={formData.tradingViewUrl || ''}
              onChange={(e) => setFormData({ ...formData, tradingViewUrl: e.target.value })}
              placeholder="Enter TradingView chart URL"
            />

            <Input
              label="Risk/Reward Ratio"
              type="text"
              value={formData.riskReward || ''}
              onChange={(e) => setFormData({ ...formData, riskReward: e.target.value })}
              placeholder="e.g., 1:3"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments
              </label>
              <textarea
                value={formData.comments || ''}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Add any additional comments..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
            </div>

            {!hideNotifyTelegram && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notifyTelegram"
                  checked={formData.notifyTelegram}
                  onChange={(e) => setFormData({ ...formData, notifyTelegram: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifyTelegram" className="text-sm text-gray-700">
                  Send notification to Telegram
                </label>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm bg-red-50 p-2 rounded"
              >
                {error}
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full sm:w-auto"
              >
                {editingSignal ? 'Save Changes' : 'Send New Signal'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};