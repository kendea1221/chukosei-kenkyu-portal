import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parse/sync';

// Supabaseクライアントを初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// CSVファイルを読み込んでプログラムデータに変換
async function seedPrograms() {
  try {
    // CSVファイルを読み込み
    const csvPath = path.join(process.cwd(), '研究プログラムまとめ - シート1.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    // CSVを解析
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // プログラムデータを変換
    const programs = records.map((record: any) => {
      // target_audienceをパースする
      let targetAudience = [];
      try {
        // JSONっぽい形式をパース
        const audienceStr = record.target_audience.replace(/^{/, '[').replace(/}$/, ']');
        targetAudience = JSON.parse(audienceStr);
      } catch {
        targetAudience = [record.target_audience];
      }

      return {
        title: record.title,
        description: record.description,
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

    console.log(`Importing ${programs.length} programs...`);

    // Supabaseに挿入
    const { error } = await supabase.from('programs').insert(programs);

    if (error) {
      console.error('Error inserting programs:', error);
      process.exit(1);
    }

    console.log('✓ Programs seeded successfully!');
  } catch (error) {
    console.error('Error seeding programs:', error);
    process.exit(1);
  }
}

seedPrograms();
