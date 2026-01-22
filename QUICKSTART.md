## クイックスタートガイド

このプロジェクトをセットアップするための簡単な手順です。

### Step 1: 必要なソフトウェアをインストール

- Node.js 18以上
- npm または yarn

### Step 2: このリポジトリをクローン

```bash
git clone <repository-url>
cd chukosei-kenkyu
```

### Step 3: 依存パッケージをインストール

```bash
npm install
npm install dotenv
```

### Step 4: Supabaseプロジェクトを作成

1. [Supabase](https://supabase.com) にサインアップ
2. 新しいプロジェクトを作成
3. プロジェクトが作成されるまで待機

### Step 5: テーブルを作成

Supabase ダッシュボードの SQL エディタを開き、[README.md](./README.md) の「Supabaseのテーブル作成」に記載されているSQLをコピーして実行します。

### Step 6: 環境変数を設定

`.env.local` ファイルを編集：

```bash
# Supabase ダッシュボード > Project Settings > API から以下の値をコピー
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Step 7: テストデータを追加（オプション）

スクリプトでサンプルプログラムを自動挿入できます：

```bash
npm run seed
```

または Supabase ダッシュボードの「Table Editor」から `programs` テーブルに手動でプログラムを追加できます。

### Step 8: ローカルで実行

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます

### Step 9: Vercelにデプロイ

1. このリポジトリをGitHubにプッシュ
2. [Vercel](https://vercel.com) で「New Project」をクリック
3. GitHubリポジトリを選択
4. Environment Variables に以下を追加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. デプロイボタンをクリック

## トラブルシューティング

### "Supabaseの環境変数が設定されていません"エラーが出る

- `.env.local` ファイルが存在し、正しい値が入っているか確認してください
- `npm run dev` を再起動してください

### テーブルが見つからないエラー

- Supabase ダッシュボードでテーブルが作成されたか確認してください
- SQL エディタで上記のSQLコマンドを実行してください

```json
{
  "title": "テスト研究プログラム",
  "description": "このはテストプログラムです。",
  "category": "物理",
  "duration": "3ヶ月",
  "difficulty": "beginner"
}
```

## トラブルシューティング

### 「Cannot find module '@supabase/supabase-js'」エラー

```bash
npm install @supabase/supabase-js
```

### 環境変数が読み込まれない

- `.env.local` ファイルが存在することを確認
- ファイルを保存後、開発サーバーを再起動（Ctrl+C → `npm run dev`）

### Supabaseに接続できない

- SUPABASE_URLとANON_KEYが正しいか確認
- Supabase ダッシュボードで API キーを確認

## 本番環境へのデプロイ

### Vercelへのデプロイ

1. GitHubにプッシュ

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Vercel で以下をセットアップ：
   - GitHub リポジトリを接続
   - 環境変数を追加（Step 6と同じ）
   - デプロイボタンをクリック

## 詳細なセットアップについて

より詳しい情報は [SETUP.md](./SETUP.md) をご覧ください。
