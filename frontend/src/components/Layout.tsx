import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">Greeting View</div>
          <div>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span>
                  Hello, {user?.name || user?.preferred_username || 'User'}
                </span>
                <button
                  onClick={() => logout()}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => login()}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-1 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {children}

      <footer className="bg-gray-800 text-white p-4 mt-auto">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Greeting View. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 