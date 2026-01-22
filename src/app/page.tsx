'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import ProgramCard from '@/components/ProgramCard';
import Header from '@/components/Header';

type Program = Database['public']['Tables']['programs']['Row'];

export default function Home() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  // フィルター状態
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedAudience, setSelectedAudience] = useState<Set<string>>(new Set());
  const [selectedFormat, setSelectedFormat] = useState<Set<string>>(new Set());

  // ユニークな値を取得
  const categories = useMemo(
    () => [...new Set(programs.map((p) => p.category))].sort(),
    [programs]
  );

  const audiences = useMemo(
    () => [...new Set(programs.flatMap((p) => p.target_audience || []))].sort(),
    [programs]
  );

  const formats = useMemo(
    () =>
      ([...new Set(programs.map((p) => p.format).filter(Boolean))] as string[]).sort(),
    [programs]
  );

  useEffect(() => {
    loadPrograms();
  }, []);

  async function loadPrograms() {
    setLoading(true);
    try {
      // 環境変数の確認
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Supabaseの環境変数が設定されていません');
        setPrograms([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load programs:', error);
        setPrograms([]);
      } else {
        setPrograms(data || []);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }

  // フィルタリング済みプログラムを計算
  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const categoryMatch =
        selectedCategories.size === 0 || selectedCategories.has(program.category);

      const audienceMatch =
        selectedAudience.size === 0 ||
        (program.target_audience &&
          program.target_audience.some((aud) => selectedAudience.has(aud)));

      const formatMatch = selectedFormat.size === 0 || selectedFormat.has(program.format || '');

      return categoryMatch && audienceMatch && formatMatch;
    });
  }, [programs, selectedCategories, selectedAudience, selectedFormat]);

  const toggleCategory = (category: string) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setSelectedCategories(newSet);
  };

  const toggleAudience = (audience: string) => {
    const newSet = new Set(selectedAudience);
    if (newSet.has(audience)) {
      newSet.delete(audience);
    } else {
      newSet.add(audience);
    }
    setSelectedAudience(newSet);
  };

  const toggleFormat = (format: string) => {
    const newSet = new Set(selectedFormat);
    if (newSet.has(format)) {
      newSet.delete(format);
    } else {
      newSet.add(format);
    }
    setSelectedFormat(newSet);
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedAudience(new Set());
    setSelectedFormat(new Set());
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">研究プログラム</h1>
          <p className="text-gray-600">参加した先輩たちのレビューから、プログラムを探す</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー フィルター */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded p-6 sticky top-20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-900">フィルター</h2>
                {(selectedCategories.size > 0 ||
                  selectedAudience.size > 0 ||
                  selectedFormat.size > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-600 hover:text-gray-900 underline"
                  >
                    リセット
                  </button>
                )}
              </div>

              {/* カテゴリー */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">分野</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.has(category)}
                        onChange={() => toggleCategory(category)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 対象者 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">対象者</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {audiences.map((audience) => (
                    <label key={audience} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAudience.has(audience)}
                        onChange={() => toggleAudience(audience)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{audience}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 形式 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">形式</h3>
                <div className="space-y-2">
                  {formats.map((format) => (
                    <label key={format} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFormat.has(format)}
                        onChange={() => toggleFormat(format)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{format}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-4 text-gray-600">読み込み中...</p>
              </div>
            ) : filteredPrograms.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                該当するプログラムが見つかりません
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-6">
                  {filteredPrograms.length}件のプログラム
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPrograms.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
