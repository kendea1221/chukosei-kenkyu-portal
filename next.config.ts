import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // モダンブラウザターゲット（レガシーJavaScript削減）
  compiler: {
    // 不要なコンソール除去（本番環境）
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // CSS最適化
  experimental: {
    optimizeCss: true,
    // プリフェッチ最適化
    optimisticClientCache: true,
  },

  // 圧縮設定
  compress: true,

  // 画像最適化
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // パフォーマンス最適化
  poweredByHeader: false,

  // React最適化
  reactStrictMode: true,

  // SWC最適化（高速トランスパイル）
  swcMinify: true,

  // 本番ソースマップ（デバッグ用、サイズ削減のためfalse推奨）
  productionBrowserSourceMaps: false,

  // HTTPヘッダー最適化
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
