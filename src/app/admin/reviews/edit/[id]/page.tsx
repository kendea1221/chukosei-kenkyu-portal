'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

export default function EditReviewPage() {
  const router = useRouter();
  const params = useParams();
  const reviewId = params.id as string;
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [programTitle, setProgramTitle] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    } else if (user && isAdmin) {
      loadReview();
    }
  }, [user, isAdmin, authLoading, router]);

  async function loadReview() {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, programs(title)')
        .eq('id', reviewId)
        .single();

      if (error) {
        console.error('Failed to load review:', error);
        setError('レビューの読み込みに失敗しました');
      } else if (data) {
        setTitle(data.title);
        setContent(data.content);
        setRating(data.rating);
        setProgramTitle(data.programs?.title || '');
      }
    } catch (err) {
      console.error('Error loading review:', err);
      setError('レビューの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('タイトルと内容を入力してください');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          title: title.trim(),
          content: content.trim(),
          rating,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) {
        console.error('Failed to update review:', error);
        setError('更新に失敗しました');
      } else {
        router.push('/admin');
      }
    } catch (err) {
      console.error('Error updating review:', err);
      setError('更新に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">アクセス権がありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← 戻る
          </button>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">レビュー編集</h1>
        {programTitle && <p className="text-sm text-gray-600 mb-6">プログラム: {programTitle}</p>}

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">タイトル *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">評価 *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl focus:outline-none"
                >
                  <span className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">内容 *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {submitting ? '更新中...' : '更新'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
