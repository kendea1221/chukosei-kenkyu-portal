'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import Header from '@/components/Header';

type Program = Database['public']['Tables']['programs']['Row'];

export default function AdminEditPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params.id as string;
  const { user, isAdmin, loading } = useAuth();

  const [formData, setFormData] = useState<Program | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  const targetAudienceOptions = [
    '中学1年生',
    '中学2年生',
    '中学3年生',
    '高校1年生',
    '高校2年生',
    '高校3年生',
    '大学1年生',
    '大学2年生',
  ];

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    } else if (user && isAdmin && programId) {
      loadProgram();
    }
  }, [user, isAdmin, loading, router, programId]);

  async function loadProgram() {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .single();

      if (error) {
        throw error;
      }
      setFormData(data);
    } catch (err) {
      console.error('Error loading program:', err);
      setError('プログラムの読み込みに失敗しました');
    } finally {
      setLoadingData(false);
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleAudienceChange = (audience: string) => {
    if (formData) {
      setFormData({
        ...formData,
        target_audience: (formData.target_audience || []).includes(audience)
          ? (formData.target_audience || []).filter((a) => a !== audience)
          : [...(formData.target_audience || []), audience],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setError('');
    setSubmitting(true);

    try {
      const { error: updateError } = await supabase
        .from('programs')
        .update(formData)
        .eq('id', programId);

      if (updateError) {
        throw updateError;
      }

      router.push('/admin');
    } catch (err) {
      const error = err as Error;
      setError(`エラー: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingData) {
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

  if (!formData) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">プログラムが見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link href="/admin" className="text-gray-600 hover:text-gray-900 text-sm mb-6 inline-block">
          ← 戻る
        </Link>

        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">プログラムを編集</h1>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">タイトル *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">説明 *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">分野</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">形式</label>
                <input
                  type="text"
                  name="format"
                  value={formData.format || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-3">対象者</label>
              <div className="grid grid-cols-2 gap-2">
                {targetAudienceOptions.map((audience) => (
                  <label key={audience} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(formData.target_audience || []).includes(audience)}
                      onChange={() => handleAudienceChange(audience)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{audience}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">応募期間</label>
                <input
                  type="text"
                  name="application_period"
                  value={formData.application_period || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">開催地</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">費用</label>
              <input
                type="text"
                name="cost"
                value={formData.cost || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">応募方法</label>
              <textarea
                name="application_process"
                value={formData.application_process || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">公式サイトURL</label>
              <input
                type="url"
                name="official_url"
                value={formData.official_url || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:bg-gray-400"
              >
                {submitting ? '更新中...' : '更新'}
              </button>
              <Link
                href="/admin"
                className="px-6 py-2 border border-gray-300 text-gray-900 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
