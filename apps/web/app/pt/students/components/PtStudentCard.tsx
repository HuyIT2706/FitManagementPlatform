/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { Edit3, Activity } from 'lucide-react';
import { getAvatarUrl } from '../../../../utils/avatar';

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

const PtStudentCard = ({ student }: PtStudentCardProps) => {
  const avatar = getAvatarUrl(student.avatar);

  return (
    <div className="bento-card rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-outline-variant/30 space-y-3.5 sm:space-y-4 relative group hover:border-primary/50 transition-all">
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-white/10 shrink-0">
            <img src={avatar} alt={student.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-on-surface text-sm sm:text-base group-hover:text-primary transition-colors truncate">
              {student.name}
            </h4>
            <span className="text-xs text-on-surface-variant font-medium truncate block">{student.pkg}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-sm sm:text-base font-bold text-primary block">
            {student.remaining}/{student.total}
          </span>
          <span className="text-[10px] sm:text-xs text-on-surface-variant">Buổi còn lại</span>
        </div>
      </div>

      <div className="pt-2.5 sm:pt-3 border-t border-white/5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
        <Link
          href={`/pt/students/${student.id}`}
          className="flex-1 min-w-[150px] bg-primary/10 text-primary hover:bg-primary/20 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-primary/20 text-center"
        >
          <Edit3 size={15} />
          Giao bài tập & Thực đơn
        </Link>

        <Link
          href={`/pt/students/${student.id}`}
          className="px-3.5 sm:px-4 py-2 bg-surface-bright/40 text-on-surface hover:bg-surface-bright rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-white/10 shrink-0"
        >
          <Activity size={15} />
          InBody
        </Link>
      </div>
    </div>
  );
};

export default PtStudentCard;
