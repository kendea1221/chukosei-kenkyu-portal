'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, displayName, isAdmin, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold text-gray-900">
          中高生研究ポータル
        </Link>

        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{displayName}</span>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded"
                >
                  管理画面
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="text-sm px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded"
              >
                ログイン
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-800"
              >
                登録
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
