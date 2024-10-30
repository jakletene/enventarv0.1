import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  BarChart2, 
  FileText,
  Settings,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/sales', label: 'Sales', icon: TrendingUp },
    { path: '/order', label: 'Order', icon: ShoppingCart },
    { path: '/report', label: 'Report', icon: BarChart2 },
    { path: '/document', label: 'Document', icon: FileText },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/admin', label: 'Admin', icon: Settings });
  }

  return (
    <nav className="bg-secondary-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-accent-green font-bold text-xl">inventar</span>
            </Link>
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === item.path
                      ? 'bg-secondary-700 text-white'
                      : 'text-secondary-300 hover:bg-secondary-700'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {pathname === item.path && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 bg-accent-green"
                      layoutId="navbar-indicator"
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-secondary-300 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}