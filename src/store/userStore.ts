import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, NewUser, EditUser } from '../types/auth';

interface UserState {
  users: User[];
  addUser: (newUser: NewUser) => void;
  removeUser: (userId: string) => void;
  editUser: (userId: string, updatedUser: EditUser) => void;
  getUsers: () => User[];
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],
      
      addUser: (newUser: NewUser) => {
        const user: User = {
          ...newUser,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          users: [...state.users, user],
        }));
      },

      removeUser: (userId: string) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== userId),
        }));
      },

      editUser: (userId: string, updatedUser: EditUser) => {
        set((state) => ({
          users: state.users.map((user) => 
            user.id === userId
              ? { 
                  ...user, 
                  ...updatedUser,
                  password: updatedUser.password || user.password 
                }
              : user
          ),
        }));
      },

      getUsers: () => get().users,
    }),
    {
      name: 'users-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0 to version 1
          return {
            ...persistedState,
            users: persistedState.users?.map((user: User) => ({
              ...user,
              id: user.id || crypto.randomUUID()
            })) || []
          };
        }
        return persistedState;
      },
    }
  )
);