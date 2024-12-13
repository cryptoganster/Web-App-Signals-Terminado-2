import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { TradingSignal } from '../../types/signal';
import { Button } from '../ui/Button';
import { getStatusText, getStatusColor } from '../../utils/signalStatus';

interface HistoryListProps {
  signals: TradingSignal[];
  onView?: (signal: TradingSignal) => void;
  onEdit?: (signal: TradingSignal) => void;
  onDelete?: (signal: TradingSignal) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ 
  signals = [],
  onView,
  onEdit,
  onDelete
}) => {
  if (signals.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No signals in history
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pair
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entry
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stop Loss
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Take Profit
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Risk/Reward
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {signals.map((signal) => (
            <motion.tr
              key={signal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {new Date(signal.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {signal.pair}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(signal.position)}`}>
                  {signal.position}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {signal.entries[0]?.price}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">
                {signal.stopLosses[0]?.price}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">
                {signal.takeProfits[0]?.price}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {signal.riskReward}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(signal.status)}`}>
                  {getStatusText(signal.status)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="secondary"
                    className="p-2 hover:text-blue-600"
                    title="View Details"
                    onClick={() => onView?.(signal)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    className="p-2 hover:text-blue-600"
                    title="Edit Signal"
                    onClick={() => onEdit?.(signal)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    className="p-2 hover:text-red-600"
                    title="Delete Signal"
                    onClick={() => onDelete?.(signal)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

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