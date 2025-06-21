import { useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';

export default function Home() {
  const { isAuthenticated, user, login, logout } = useAuth();

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    console.log('Authentication status:', isAuthenticated);
  }, [isAuthenticated]);

  return (
    <>
      <Head>
        <title>Greeting View</title>
        <meta name="description" content="Greeting View Application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <main className="flex min-h-screen flex-col items-center justify-center p-6">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-center mb-8">
              Welcome to Greeting View
            </h1>
            
            <div className="text-center mb-8">
              {isAuthenticated ? (
                <div>
                  <p className="text-xl mb-4">
                    Hello, <span className="font-semibold">{user?.name || user?.preferred_username || 'User'}</span>!
                  </p>
                  <p className="mb-6">You are successfully logged in.</p>
                  <button
                    onClick={() => logout()}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div>
                  <p className="mb-6">Please login to access the application.</p>
                  <button
                    onClick={() => login()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
} 