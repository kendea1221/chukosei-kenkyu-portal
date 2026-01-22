'use client';

import { useState } from 'react';
import type { Database } from '@/lib/supabase';

type Review = Database['public']['Tables']['reviews']['Row'];

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}

function ReviewItem({ review }: { review: Review }) {
  const [showComments, setShowComments] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="border border-gray-200 rounded p-5 mb-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm">{review.title}</h4>
          <p className="text-xs text-gray-500 mt-1">{formatDate(review.created_at)}</p>
        </div>
        <div className="text-lg flex-shrink-0">
          {'★'.repeat(review.rating)}
          {'☆'.repeat(5 - review.rating)}
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap">{review.content}</p>

      <div className="flex gap-4 text-xs">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-gray-600 hover:text-gray-900"
        >
          💬 コメント ({0})
        </button>
        <button className="text-gray-600 hover:text-gray-900">
          👍 参考 ({review.helpful_count})
        </button>
      </div>
    </div>
  );
}
