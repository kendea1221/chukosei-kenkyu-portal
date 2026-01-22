'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';

type Review = Database['public']['Tables']['reviews']['Row'];

interface ReviewSectionProps {
  programId: string;
}

export default function ReviewSection({ programId }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();

    // リアルタイム更新をリッスン
    const subscription = supabase
      .channel(`program-${programId}-reviews`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `program_id=eq.${programId}`,
        },
        () => {
          loadReviews();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [programId]);

  async function loadReviews() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('program_id', programId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load reviews:', error);
      } else {
        setReviews(data || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">レビュー</h2>

      {user ? (
        <ReviewForm programId={programId} onReviewAdded={loadReviews} />
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded p-6 mb-8">
          <p className="text-gray-700 text-sm mb-4">レビューを投稿するにはログインが必要です。</p>
          <div className="flex gap-3">
            <a
              href="/auth/login"
              className="text-sm px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
            >
              ログイン
            </a>
            <a
              href="/auth/signup"
              className="text-sm px-4 py-2 border border-gray-900 text-gray-900 rounded hover:bg-gray-50 transition-colors"
            >
              会員登録
            </a>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-3 text-sm text-gray-600">読み込み中...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center text-gray-600 py-8 text-sm">レビューがまだありません</div>
      ) : (
        <ReviewList reviews={reviews} />
      )}
    </div>
  );
}
