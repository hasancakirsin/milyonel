'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check if user is logged in by checking session
    // For now, we'll check if session cookie exists (simplified)
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setUserName(data.user.name);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary-600">MilyonEl</div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/kampanyalar"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Kampanyalar
            </Link>
            <Link
              href="/#nasil-calisir"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Nasıl Çalışır?
            </Link>
            <Link
              href="/isletmelere-ozel"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              İşletmelere Özel
            </Link>
            <Link
              href="/sss"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              SSS
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/panel"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  Merhaba, {userName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-primary-600 transition"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/giris"
                  className="px-4 py-2 text-sm text-gray-700 hover:text-primary-600 transition"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/kayit"
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
