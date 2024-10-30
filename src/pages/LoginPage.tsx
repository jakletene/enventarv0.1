import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Database, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-secondary-800 p-8 rounded-lg shadow-xl"
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-secondary-700 p-3 rounded-lg">
              <Database className="w-8 h-8 text-accent-green" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-secondary-400">
            Sign in to access your inventory dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-secondary-700 placeholder-secondary-500 text-white bg-secondary-700 rounded-t-md focus:outline-none focus:ring-accent-green focus:border-accent-green focus:z-10 sm:text-sm"
                placeholder="Username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-secondary-700 placeholder-secondary-500 text-white bg-secondary-700 rounded-b-md focus:outline-none focus:ring-accent-green focus:border-accent-green focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-green hover:bg-accent-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-green"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <ShieldCheck className="h-5 w-5 text-accent-green group-hover:text-white" />
              </span>
              Sign in
            </button>
          </div>

          <div className="text-center text-sm text-secondary-400">
            <p>Demo Credentials:</p>
            <p>Username: admin, supplier, or warehouse</p>
            <p>Password: 123</p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}