# 中高生研究プログラムポータル

中高生向けの研究プログラムを集約し、参加者のレビューを閲覧・投稿できるポータルです。ログインなしで閲覧でき、レビュー投稿はログイン後に行えます。管理者はプログラムの追加・編集・削除が可能です。

## 主な機能

- 閲覧: ログイン不要でプログラム一覧・詳細を閲覧
- フィルタ: 分野、対象者、形式で絞り込み
- レビュー: ログイン後にレビュー投稿・閲覧
- 共有: 各プログラム詳細から X/Instagram/TikTok/LINE で共有
- 下書き保存: 非ログインでもデバイスIDで下書き保持（将来拡張）
- お気に入り: ユーザー/デバイスでお気に入り登録（将来拡張）
- 管理画面: 管理者のみプログラムとレビューの管理

## 技術スタック

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06b6d4?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Hosting-black?logo=vercel)

- **フロント**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **認証/DB**: Supabase (PostgreSQL, Auth, RLS)
- **ホスティング**: Vercel

## セットアップ

1. 依存関係のインストール

```bash
npm install
```

2. 環境変数の設定（`.env.local`）

```
NEXT_PUBLIC_SUPABASE_URL=xxxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
```

3. 開発サーバー起動

```bash
npm run dev
```

## データベース初期化（Supabase）

Supabase の SQL Editor にて `scripts/init-database.sql` の内容を実行してください。

- `profiles` テーブル（`is_admin` で管理者判定）
- `programs/reviews/comments/favorites/drafts` テーブル
- RLS とポリシー（管理者のみ CRUD、一般は適切な範囲でアクセス）

管理者設定:

```sql
UPDATE profiles SET is_admin = true WHERE email = 'あなたのメールアドレス';
```

## CSVインポート

プログラムの初期データを CSV から投入できます。

```bash
npm run seed
```

## 開発用コマンド

```bash
npm run dev         # 開発サーバー
npm run build       # 本番ビルド
npm run start       # 本番起動
npm run lint        # Lint
npm run format      # Prettier で整形
npm run format:check# 整形チェック
```

## デプロイ（GitHub → Vercel）

1. GitHub に push

```bash
git init
git add -A
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-account>/<repo>
git push -u origin main
```

2. Vercel でプロジェクトをインポート

- 環境変数（Preview/Production 両方）: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Build: `next build`

3. Supabase Auth のリダイレクト URL を登録

- 例: `https://your-app.vercel.app`

## 注意点

- `.env.local` はリポジトリに含めない（Vercel の環境変数を使用）
- `service_role` キーはクライアントに置かない（必要になったらサーバー専用環境変数で API Route から使用）
- RLS が有効なことを前提に運用（管理者権限は `profiles.is_admin=true`）

## ディレクトリ構成（抜粋）

```
src/
  app/
    admin/        # 管理画面
    auth/         # 認証ページ
    program/[id]/ # プログラム詳細
    page.tsx      # トップページ
    layout.tsx    # 共通レイアウト（フッター）
  components/
    Header.tsx
    Footer.tsx
    ProgramCard.tsx
    ReviewSection.tsx
    ReviewForm.tsx
    ShareButtons.tsx
  hooks/
    useAuth.ts
  lib/
    supabase.ts
scripts/
  init-database.sql
  seed-programs.js
```

## ライセンス

MIT
