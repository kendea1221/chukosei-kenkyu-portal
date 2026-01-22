'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import Header from '@/components/Header';

type Program = Database['public']['Tables']['programs']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];

type ReviewWithProgram = Review & {
  programs: { title: string } | null;
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<'programs' | 'reviews'>('programs');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [reviews, setReviews] = useState<ReviewWithProgram[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    console.log('Admin check:', { loading, hasUser: !!user, isAdmin });
    if (!loading && (!user || !isAdmin)) {
      console.log('Redirecting: loading=', loading, 'user=', !!user, 'isAdmin=', isAdmin);
      router.push('/');
    } else if (user && isAdmin) {
      loadPrograms();
      loadReviews();
    }
  }, [user, isAdmin, loading, router]);

  async function loadPrograms() {
    setLoadingPrograms(true);
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load programs:', error);
      } else {
        setPrograms(data || []);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoadingPrograms(false);
    }
  }

  async function loadReviews() {
    setLoadingReviews(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, programs(title)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load reviews:', error);
      } else {
        setReviews(data || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  }

  async function deleteProgram(id: string) {
    if (!confirm('このプログラムを削除しますか？関連するレビューも削除されます。')) return;

    try {
      const { error } = await supabase.from('programs').delete().eq('id', id);

      if (error) {
        console.error('Failed to delete program:', error);
        alert('削除に失敗しました');
      } else {
        setPrograms(programs.filter((p) => p.id !== id));
        alert('削除しました');
      }
    } catch (error) {
      console.error('Error deleting program:', error);
      alert('削除に失敗しました');
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('このレビューを削除しますか？')) return;

    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);

      if (error) {
        console.error('Failed to delete review:', error);
        alert('削除に失敗しました');
      } else {
        setReviews(reviews.filter((r) => r.id !== id));
        alert('削除しました');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('削除に失敗しました');
    }
  }

  if (loading) {
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

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">管理画面</h1>
          {activeTab === 'programs' && (
            <Link
              href="/admin/add"
              className="text-sm px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-800"
            >
              プログラムを追加
            </Link>
          )}
        </div>

        {/* タブ */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('programs')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'programs'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            プログラム ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'reviews'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            レビュー ({reviews.length})
          </button>
        </div>

        {/* プログラム一覧 */}
        {activeTab === 'programs' && (
          <>
            {loadingPrograms ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-3 text-sm text-gray-600">読み込み中...</p>
              </div>
            ) : programs.length === 0 ? (
              <div className="text-center py-12 text-gray-600 text-sm">プログラムがありません</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">タイトル</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">分野</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">形式</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">対象</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map((program) => (
                      <tr key={program.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Link href={`/program/${program.id}`} className="hover:underline">
                            {program.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{program.category}</td>
                        <td className="py-3 px-4 text-gray-600">{program.format}</td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {program.target_audience.slice(0, 2).join(', ')}
                          {program.target_audience.length > 2 && '...'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/edit/${program.id}`}
                              className="text-gray-600 hover:text-gray-900 text-xs underline"
                            >
                              編集
                            </Link>
                            <button
                              onClick={() => deleteProgram(program.id)}
                              className="text-red-600 hover:text-red-700 text-xs"
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* レビュー一覧 */}
        {activeTab === 'reviews' && (
          <>
            {loadingReviews ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-3 text-sm text-gray-600">読み込み中...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 text-gray-600 text-sm">レビューがありません</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">プログラム</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">レビュー</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">評価</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">投稿日</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review) => (
                      <tr key={review.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">
                          {review.programs?.title || '不明'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-md">
                            <p className="font-medium">{review.title}</p>
                            <p className="text-xs text-gray-500 truncate">{review.content}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span>{review.rating}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {new Date(review.created_at).toLocaleDateString('ja-JP')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/reviews/edit/${review.id}`}
                              className="text-gray-600 hover:text-gray-900 text-xs underline"
                            >
                              編集
                            </Link>
                            <button
                              onClick={() => deleteReview(review.id)}
                              className="text-red-600 hover:text-red-700 text-xs"
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
