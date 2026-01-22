'use client';

import Link from 'next/link';
import type { Database } from '@/lib/supabase';

type Program = Database['public']['Tables']['programs']['Row'];

interface ProgramCardProps {
  program: Program;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Link href={`/program/${program.id}`}>
      <div className="bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors p-4 cursor-pointer h-full">
        <div className="mb-3">
          <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">{program.title}</h3>
        </div>

        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{program.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
            {program.category}
          </span>
          {program.format && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {program.format}
            </span>
          )}
        </div>

        {program.application_period && (
          <p className="text-xs text-gray-500">応募: {program.application_period}</p>
        )}
      </div>
    </Link>
  );
}
