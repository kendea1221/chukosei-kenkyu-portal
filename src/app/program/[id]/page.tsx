'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import Header from '@/components/Header';

// 動的インポートでレビューセクションとシェアボタンを遅延読み込み
const ReviewSection = dynamic(() => import('@/components/ReviewSection'), {
  loading: () => <div className="min-h-[200px] skeleton rounded"></div>,
  ssr: false,
});

const ShareButtons = dynamic(() => import('@/components/ShareButtons'), {
  ssr: false,
});

type Program = Database['public']['Tables']['programs']['Row'];

export default function ProgramDetail() {
  const params = useParams();
  const programId = params.id as string;

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgram();
  }, [programId]);

  async function loadProgram() {
    setLoading(true);
    try {
      // 環境変数の確認
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Supabaseの環境変数が設定されていません');
        setProgram(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .single();

      if (error) {
        console.error('Failed to load program:', error);
        setProgram(null);
      } else {
        setProgram(data);
      }
    } catch (error) {
      console.error('Error loading program:', error);
      setProgram(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center min-h-[400px] flex flex-col items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </main>
    );
  }

  if (!program) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center min-h-[400px] flex flex-col items-center justify-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">プログラムが見つかりません</h1>
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            ← ホームに戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm mb-6 inline-block">
          ← ホームに戻る
        </Link>

        <div className="max-w-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{program.title}</h1>
            <p className="text-gray-600 text-sm">{program.category}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200">
            {program.format && (
              <div>
                <p className="text-gray-600 text-xs mb-1">形式</p>
                <p className="font-medium text-sm text-gray-900">{program.format}</p>
              </div>
            )}
            {program.application_period && (
              <div>
                <p className="text-gray-600 text-xs mb-1">応募期間</p>
                <p className="font-medium text-sm text-gray-900">{program.application_period}</p>
              </div>
            )}
            {program.location && (
              <div>
                <p className="text-gray-600 text-xs mb-1">開催地</p>
                <p className="font-medium text-sm text-gray-900">{program.location}</p>
              </div>
            )}
            {program.cost && (
              <div>
                <p className="text-gray-600 text-xs mb-1">費用</p>
                <p className="font-medium text-sm text-gray-900">{program.cost}</p>
              </div>
            )}
          </div>

          {program.target_audience && program.target_audience.length > 0 && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <p className="text-gray-600 text-sm mb-2">対象者</p>
              <div className="flex flex-wrap gap-2">
                {program.target_audience.map((audience) => (
                  <span
                    key={audience}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                  >
                    {audience}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">概要</h2>
            <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
              {program.description}
            </p>
          </div>

          {program.application_process && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">応募方法</h3>
              <p className="text-gray-700 text-sm">{program.application_process}</p>
            </div>
          )}

          {program.official_url && (
            <div className="mb-8">
              <a
                href={program.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors inline-block"
              >
                公式サイト →
              </a>
            </div>
          )}

          {/* Share section */}
          <div className="mb-10 pb-8 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">シェア</h3>
            <ShareButtons title={program.title} />
          </div>
        </div>

        <ReviewSection programId={programId} />
      </div>
    </main>
  );
}
