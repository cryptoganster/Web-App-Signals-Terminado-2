import React, { useState } from 'react';
import { Users, LogOut, UserPlus, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { Button } from '../ui/Button';
import { UserList } from './UserList';
import { AddUserForm } from './AddUserForm';
import { NewUser, EditUser } from '../../types/auth';

export const AdminDashboard: React.FC = () => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logout = useAuthStore(state => state.logout);
  const { users, addUser, removeUser, editUser } = useUserStore();

  const handleAddUser = (newUser: NewUser) => {
    addUser(newUser);
    setShowAddUser(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold hidden sm:block">Admin Dashboard</span>
              <span className="ml-2 text-xl font-semibold sm:hidden">Admin</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              <Button
                onClick={() => setShowAddUser(true)}
                className="flex items-center text-sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
              <Button
                variant="secondary"
                onClick={logout}
                className="flex items-center text-sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden bg-white border-t border-gray-200"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Button
                  onClick={() => {
                    setShowAddUser(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-center text-sm mb-2"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
                <Button
                  variant="secondary"
                  onClick={logout}
                  className="w-full justify-center text-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">User Management</h2>
              </div>
              
              {showAddUser ? (
                <AddUserForm onAddUser={handleAddUser} onClose={() => setShowAddUser(false)} />
              ) : (
                <UserList 
                  users={users} 
                  onDeleteUser={removeUser}
                  onEditUser={editUser}
                />
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};