'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getOrCreateDeviceId } from '@/lib/deviceId';

interface ReviewFormProps {
  programId: string;
  onReviewAdded: () => void;
}

export default function ReviewForm({ programId, onReviewAdded }: ReviewFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      setError('ログインが必要です');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('タイトルと内容を入力してください');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error: insertError } = await supabase.from('reviews').insert({
        program_id: programId,
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        rating,
      });

      if (insertError) {
        throw insertError;
      }

      setTitle('');
      setContent('');
      setRating(5);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onReviewAdded();
    } catch (err) {
      const error = err as Error;
      setError(`エラー: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded p-6 mb-8">
      <h3 className="font-semibold text-gray-900 mb-4">レビューを投稿</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
          レビューを投稿しました！
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2">評価</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition-colors ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
          placeholder="レビューのタイトル"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2">内容</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
          placeholder="感想を詳しく教えてください"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 disabled:bg-gray-400"
      >
        {submitting ? '投稿中...' : '投稿'}
      </button>
    </form>
  );
}
