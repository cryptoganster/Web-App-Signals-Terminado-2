import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, RefreshCw, Trash2, Eye } from 'lucide-react';
import { TradingSignal } from '../../types/signal';
import { Button } from '../ui/Button';

interface SignalListProps {
  signals: TradingSignal[];
  onUpdateStatus?: (signal: TradingSignal) => void;
  onDelete?: (id: string) => void;
  onEdit?: (signal: TradingSignal) => void;
  onView?: (signal: TradingSignal) => void;
}

const CountBubble: React.FC<{ count: number }> = ({ count }) => {
  if (count <= 1) return null;
  return (
    <span className="inline-flex items-center justify-center bg-amber-100 text-amber-800 text-xs font-medium rounded-full h-4 min-w-[16px] px-1 ml-1">
      {count}
    </span>
  );
};

const formatStatus = (status: string) => {
  if (status.startsWith('take-profit-')) {
    const number = status.split('-').pop();
    return `Take Profit ${number}`;
  }
  if (status.startsWith('stop-loss-')) {
    const number = status.split('-').pop();
    return `Stop Loss ${number}`;
  }
  if (status.startsWith('entry-')) {
    const number = status.split('-').pop();
    return `Entry ${number}`;
  }
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusColor = (status: string) => {
  if (status.startsWith('take-profit-')) {
    return 'bg-green-100 text-green-800';
  }
  if (status === 'active') {
    return 'bg-blue-100 text-blue-800';
  }
  return 'bg-amber-100 text-amber-800';
};

export const SignalList: React.FC<SignalListProps> = ({ 
  signals,
  onUpdateStatus,
  onDelete,
  onEdit,
  onView
}) => {
  if (signals.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm sm:text-base">
        No signals available
      </div>
    );
  }

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

  return (
    <div className="overflow-x-auto">
      {/* Desktop Table */}
      <table className="w-full hidden sm:table">
        <thead className="bg-gray-50">
          <tr>
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
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onView?.(signal)}
            >
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {signal.pair}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(signal.position)}`}>
                  {signal.position}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  {signal.entries[0]?.price}
                  <CountBubble count={signal.entries.length} />
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">
                <div className="flex items-center">
                  {signal.stopLosses[signal.stopLosses.length - 1]?.price}
                  <CountBubble count={signal.stopLosses.length} />
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">
                <div className="flex items-center">
                  {signal.takeProfits[signal.takeProfits.length - 1]?.price}
                  <CountBubble count={signal.takeProfits.length} />
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(signal.status)}`}>
                  {formatStatus(signal.status)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="secondary"
                    className="p-2 hover:text-blue-600"
                    title="View Details"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView?.(signal);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    className="p-2 hover:text-blue-600"
                    title="Edit Signal"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(signal);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    className="p-2 hover:text-blue-600"
                    title="Update Status"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus?.(signal);
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    className="p-2 hover:text-red-600"
                    title="Delete Signal"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(signal.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* Mobile List */}
      <div className="sm:hidden space-y-3">
        {signals.map((signal) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border rounded-lg shadow-sm"
            onClick={() => onView?.(signal)}
          >
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">{signal.pair}</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(signal.position)}`}>
                    {signal.position}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(signal.status)}`}>
                    {formatStatus(signal.status)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Entry</span>
                  <div className="flex items-center">
                    <p className="font-medium">{signal.entries[0]?.price}</p>
                    <CountBubble count={signal.entries.length} />
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Stop Loss</span>
                  <div className="flex items-center">
                    <p className="font-medium text-red-600">
                      {signal.stopLosses[signal.stopLosses.length - 1]?.price}
                    </p>
                    <CountBubble count={signal.stopLosses.length} />
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Take Profit</span>
                  <div className="flex items-center">
                    <p className="font-medium text-green-600">
                      {signal.takeProfits[signal.takeProfits.length - 1]?.price}
                    </p>
                    <CountBubble count={signal.takeProfits.length} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <Button
                  variant="secondary"
                  className="p-2 hover:text-blue-600"
                  title="View Details"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView?.(signal);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  className="p-2 hover:text-blue-600"
                  title="Edit Signal"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(signal);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  className="p-2 hover:text-blue-600"
                  title="Update Status"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus?.(signal);
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  className="p-2 hover:text-red-600"
                  title="Delete Signal"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(signal.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};