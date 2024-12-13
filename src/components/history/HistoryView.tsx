import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoryList } from './HistoryList';
import { SignalDetailsModal } from '../user/SignalDetailsModal';
import { NewSignalModal } from '../user/NewSignalModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { useSignalStore } from '../../store/signalStore';
import { TradingSignal, NewSignalFormData } from '../../types/signal';

export const HistoryView: React.FC = () => {
  const [viewingSignal, setViewingSignal] = useState<TradingSignal | null>(null);
  const [editingSignal, setEditingSignal] = useState<TradingSignal | null>(null);
  const [deletingSignal, setDeletingSignal] = useState<TradingSignal | null>(null);
  
  const { getClosedSignals, editSignal, removeSignal } = useSignalStore();
  const closedSignals = getClosedSignals();

  const handleSignalSubmit = async (formData: NewSignalFormData, editingId?: string) => {
    if (editingId) {
      // Force notifyTelegram to false for history edits
      const historyFormData = {
        ...formData,
        notifyTelegram: false
      };
      await editSignal(editingId, historyFormData);
      setEditingSignal(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingSignal) {
      removeSignal(deletingSignal.id);
      setDeletingSignal(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Signal History</h2>
          <HistoryList 
            signals={closedSignals}
            onView={setViewingSignal}
            onEdit={setEditingSignal}
            onDelete={setDeletingSignal}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {viewingSignal && (
          <SignalDetailsModal
            signal={viewingSignal}
            onClose={() => setViewingSignal(null)}
          />
        )}
        {editingSignal && (
          <NewSignalModal
            onClose={() => setEditingSignal(null)}
            editingSignal={editingSignal}
            onSubmit={handleSignalSubmit}
            hideNotifyTelegram={true}
          />
        )}
        {deletingSignal && (
          <DeleteConfirmationModal
            onClose={() => setDeletingSignal(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
};