#!/usr/bin/env node

/**
 * Supabaseにプログラムデータを投入するスクリプト
 *
 * CSVファイルから研究プログラムをインポート
 *
 * 使用方法:
 * npm run seed
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

// 環境変数を読み込む
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'エラー: NEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYを設定してください'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// CSVファイルを読み込む
const csvPath = path.join(__dirname, '../研究プログラムまとめ - シート1.csv');

async function seedPrograms() {
  try {
    console.log('CSVファイルから研究プログラムを読み込み中...');

    // CSVファイルを読み込む
    if (!fs.existsSync(csvPath)) {
      console.error(`エラー: CSVファイルが見つかりません: ${csvPath}`);
      process.exit(1);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    console.log(`✓ ${records.length}件のプログラムを読み込みました\n`);

    // データを変換
    const programs = records.map((record) => {
      // target_audience を JSON配列として解析
      let targetAudience = [];
      try {
        // JSONフォーマット: {"中学2年生","中学3年生",...}
        const jsonStr = record.target_audience.replace(/"/g, '"').replace(/"/g, '"');
        targetAudience = JSON.parse(jsonStr);
      } catch (e) {
        // パースに失敗した場合、そのまま使用
        targetAudience = [record.target_audience];
      }

      return {
        title: record.title,
        description: record.description || '',
        category: record.category,
        target_audience: targetAudience,
        application_period: record.application_period,
        location: record.location,
        cost: record.cost,
        application_process: record.application_process,
        official_url: record.official_url,
        format: record.format,
      };
    });

    // Supabaseに投入
    console.log('Supabaseに投入中...');

    // バッチで処理（一度に全部は避ける）
    const batchSize = 10;
    for (let i = 0; i < programs.length; i += batchSize) {
      const batch = programs.slice(i, i + batchSize);
      const { data, error } = await supabase.from('programs').insert(batch).select();

      if (error) {
        console.error(`エラー (${i}-${i + batchSize}):`, error.message);
        process.exit(1);
      }

      console.log(
        `✓ ${data.length}個のプログラムを投入しました (${i + data.length}/${programs.length})`
      );
    }

    console.log('\n✅ すべてのプログラムを投入完了しました！');
  } catch (error) {
    console.error('予期しないエラー:', error);
    process.exit(1);
  }
}

seedPrograms();
