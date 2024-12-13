import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Menu, X, Plus, History, BarChart2, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { UserProfile } from '../user/UserProfile';
import { useAuthStore } from '../../store/authStore';

interface NavigationProps {
  onAddNewSignal?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onAddNewSignal }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/', label: 'Trading Signals', icon: BarChart2 },
    { path: '/history', label: 'History', icon: History },
  ];

  return (
    <>
      <nav className="bg-white shadow-md relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold hidden sm:block">Crypto Shooters</span>
              <span className="ml-2 text-xl font-semibold sm:hidden">Crypto</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
              {location.pathname === '/' && onAddNewSignal && (
                <Button
                  onClick={onAddNewSignal}
                  className="flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Signal
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => setShowProfile(true)}
                className="flex items-center text-sm"
              >
                <User className="w-4 h-4 mr-2" />
                {user?.username}
              </Button>
              <Button
                variant="secondary"
                onClick={logout}
                className="flex items-center text-sm"
              >
                <X className="w-4 h-4 mr-2" />
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
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        isActive(item.path)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Link>
                  );
                })}
                {location.pathname === '/' && onAddNewSignal && (
                  <Button
                    onClick={() => {
                      onAddNewSignal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-center text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Signal
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowProfile(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-center text-sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  {user?.username}
                </Button>
                <Button
                  variant="secondary"
                  onClick={logout}
                  className="w-full justify-center text-sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      </AnimatePresence>
    </>
  );
};