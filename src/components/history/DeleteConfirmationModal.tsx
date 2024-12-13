import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface DeleteConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  onClose,
  onConfirm,
}) => {
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
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="px-4 py-3 sm:px-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
          <Button variant="secondary" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 sm:p-6">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this signal? This action cannot be undone.
          </p>
        </div>

        <div className="px-4 py-3 sm:px-6 border-t bg-gray-50 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            Delete Signal
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};