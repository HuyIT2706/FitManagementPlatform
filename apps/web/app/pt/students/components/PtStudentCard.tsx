/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { Edit3, Activity } from 'lucide-react';

export interface StudentListItem {
  id: string;
  name: string;
  pkg: string;
  remaining: number;
  total: number;
  avatar: string;
}

interface PtStudentCardProps {
  student: StudentListItem;
}

export default function PtStudentCard({ student }: PtStudentCardProps) {
  return (
    <div className="bento-card rounded-2xl p-5 border border-outline-variant/30 space-y-4 relative group hover:border-primary/50 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0">
            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">
              {student.name}
            </h4>
            <span className="text-xs text-on-surface-variant font-medium">{student.pkg}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-base font-bold text-primary block">
            {student.remaining}/{student.total}
          </span>
          <span className="text-xs text-on-surface-variant">Buổi còn lại</span>
        </div>
      </div>

      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
        <Link
          href={`/pt/students/${student.id}`}
          className="flex-1 bg-primary/10 text-primary hover:bg-primary/20 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-primary/20"
        >
          <Edit3 size={15} />
          Giao bài tập & Thực đơn
        </Link>

        <Link
          href={`/pt/students/${student.id}`}
          className="px-4 py-2 bg-surface-bright/40 text-on-surface hover:bg-surface-bright rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/10"
        >
          <Activity size={15} />
          InBody
        </Link>
      </div>
    </div>
  );
}
