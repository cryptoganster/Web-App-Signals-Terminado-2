import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignalList } from './SignalList';
import { NewSignalModal } from './NewSignalModal';
import { UpdateStatusModal } from './UpdateStatusModal';
import { DeleteSignalModal } from './DeleteSignalModal';
import { SignalDetailsModal } from './SignalDetailsModal';
import { ActiveSignalUpdateModal } from './ActiveSignalUpdateModal';
import { useSignalStore } from '../../store/signalStore';
import { TradingSignal, NewSignalFormData } from '../../types/signal';

interface UserDashboardProps {
  showNewSignal: boolean;
  onNewSignalClose: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ showNewSignal, onNewSignalClose }) => {
  const [editingSignal, setEditingSignal] = useState<TradingSignal | null>(null);
  const [updatingSignal, setUpdatingSignal] = useState<TradingSignal | null>(null);
  const [viewingSignal, setViewingSignal] = useState<TradingSignal | null>(null);
  const [deletingSignal, setDeletingSignal] = useState<TradingSignal | null>(null);
  
  const { 
    getActiveSignals, 
    getPendingSignals, 
    addSignal, 
    editSignal,
    removeSignal,
    updateSignalStatus
  } = useSignalStore();

  const activeSignals = getActiveSignals();
  const pendingSignals = getPendingSignals();

  const handleSignalSubmit = async (formData: NewSignalFormData, editingId?: string) => {
    if (editingId) {
      await editSignal(editingId, formData);
      setEditingSignal(null);
    } else {
      await addSignal(formData);
      onNewSignalClose();
    }
  };

  const handleStatusConfirm = async (
    activationType: 'manual' | 'automatic',
    manualPrice?: string,
    comments?: string,
    tradingViewUrl?: string,
    notifyTelegram?: boolean
  ) => {
    if (!updatingSignal) return;

    await updateSignalStatus(
      updatingSignal.id,
      'active',
      activationType,
      manualPrice,
      comments,
      tradingViewUrl,
      notifyTelegram
    );
    setUpdatingSignal(null);
  };

  const handleActiveStatusConfirm = async (
    updateType: 'takeProfit' | 'stopLoss' | 'completed' | 'entry',
    targetIndex?: number,
    comments?: string,
    tradingViewUrl?: string,
    reward?: string,
    notifyTelegram?: boolean
  ) => {
    if (!updatingSignal) return;

    let status = updateType === 'completed' ? 'completed' :
                 updateType === 'takeProfit' ? `take-profit-${targetIndex}` :
                 updateType === 'stopLoss' ? `stop-loss-${targetIndex}` :
                 `entry-${targetIndex}`;

    await updateSignalStatus(
      updatingSignal.id,
      status,
      undefined,
      undefined,
      comments,
      tradingViewUrl,
      notifyTelegram,
      reward,
      updateType,
      targetIndex
    );
    setUpdatingSignal(null);
  };

  const handleDeleteConfirm = async (
    signal: TradingSignal,
    lastTakeProfit?: number,
    hitStopLoss?: boolean,
    comments?: string,
    tradingViewUrl?: string,
    reward?: string,
    notifyTelegram?: boolean
  ) => {
    if (signal.status === 'active' || signal.status.startsWith('take-profit-')) {
      const status = hitStopLoss ? 'stop-loss-1' :
                    lastTakeProfit ? `take-profit-${lastTakeProfit}` :
                    signal.status;

      await updateSignalStatus(
        signal.id,
        status,
        undefined,
        undefined,
        comments,
        tradingViewUrl,
        notifyTelegram,
        reward,
        hitStopLoss ? 'stopLoss' : 'takeProfit',
        hitStopLoss ? 1 : lastTakeProfit
      );
    }
    
    removeSignal(signal.id);
    setDeletingSignal(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Active Signals</h2>
            <SignalList 
              signals={activeSignals}
              onUpdateStatus={setUpdatingSignal}
              onDelete={(id) => setDeletingSignal(activeSignals.find(s => s.id === id) || null)}
              onEdit={setEditingSignal}
              onView={setViewingSignal}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Pending Signals</h2>
            <SignalList 
              signals={pendingSignals}
              onUpdateStatus={setUpdatingSignal}
              onDelete={(id) => setDeletingSignal(pendingSignals.find(s => s.id === id) || null)}
              onEdit={setEditingSignal}
              onView={setViewingSignal}
            />
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {(showNewSignal || editingSignal) && (
          <NewSignalModal 
            onClose={() => {
              onNewSignalClose();
              setEditingSignal(null);
            }}
            editingSignal={editingSignal}
            onSubmit={handleSignalSubmit}
          />
        )}
        {updatingSignal && updatingSignal.status === 'pending' && (
          <UpdateStatusModal
            onClose={() => setUpdatingSignal(null)}
            onConfirm={handleStatusConfirm}
            defaultEntry={updatingSignal.entries[0].price}
          />
        )}
        {updatingSignal && updatingSignal.status !== 'pending' && (
          <ActiveSignalUpdateModal
            onClose={() => setUpdatingSignal(null)}
            onConfirm={handleActiveStatusConfirm}
            takeProfitCount={updatingSignal.takeProfits.length}
            stopLossCount={updatingSignal.stopLosses.length}
            entryCount={updatingSignal.entries.length}
          />
        )}
        {viewingSignal && (
          <SignalDetailsModal
            signal={viewingSignal}
            onClose={() => setViewingSignal(null)}
          />
        )}
        {deletingSignal && (
          <DeleteSignalModal
            signal={deletingSignal}
            onClose={() => setDeletingSignal(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
};