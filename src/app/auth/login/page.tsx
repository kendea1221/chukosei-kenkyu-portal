'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';

export default function LoginPage() {
  const router = useRouter();
  const { user, signIn, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 既にログイン中の場合はリダイレクト
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message || 'ログインに失敗しました');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('予期しないエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">ログイン</h1>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:bg-gray-400"
            >
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            アカウントをお持ちでない方は{' '}
            <a href="/auth/signup" className="text-gray-900 hover:underline font-medium">
              登録
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
