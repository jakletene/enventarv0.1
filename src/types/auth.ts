export interface User {
  id: string;
  username: string;
  role: 'admin' | 'supplier' | 'warehouse';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}