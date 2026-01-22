'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

export default function VerifyEmailPage() {
  const router = useRouter();

  useEffect(() => {
    // 少し待ってから確認ページに遷移
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-6">✓</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">登録完了</h1>
          <p className="text-gray-700 text-sm mb-4">メールアドレスの確認メールをお送りしました。</p>
          <p className="text-gray-600 text-sm mb-6">5秒後に自動的にホーム画面へ移動します。</p>
          <Link
            href="/"
            className="inline-block text-sm px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
