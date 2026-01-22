'use client';

import { useMemo } from 'react';

interface ShareButtonsProps {
  title?: string;
  url?: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const currentUrl = useMemo(() => {
    if (url) return url;
    if (typeof window !== 'undefined') return window.location.href;
    return '';
  }, [url]);

  const text = title || '気になるプログラム';

  function shareToX() {
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }

  function shareToLINE() {
    const shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentUrl)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }

  async function shareGeneric(appName: 'Instagram' | 'TikTok') {
    try {
      if (navigator.share) {
        await navigator.share({ title: text, text, url: currentUrl });
        return;
      }
      await navigator.clipboard.writeText(currentUrl);
      alert(`リンクをコピーしました。${appName}で共有してください。`);
    } catch (e) {
      alert('共有に失敗しました。リンクを手動でコピーしてください。');
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={shareToX}
        className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
      >
        X
      </button>
      <button
        type="button"
        onClick={() => shareGeneric('Instagram')}
        className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
      >
        Instagram
      </button>
      <button
        type="button"
        onClick={() => shareGeneric('TikTok')}
        className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
      >
        TikTok
      </button>
      <button
        type="button"
        onClick={shareToLINE}
        className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
      >
        LINE
      </button>
    </div>
  );
}
