/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { Award, Activity } from 'lucide-react';
import type { PTStudentSummary } from '@repo/types';
import type { PtStudentRosterQuickProps } from '../../../../interface';

import { getAvatarUrl } from '../../../../utils/avatar';

const PtStudentRosterQuick = ({ students }: PtStudentRosterQuickProps) => {
  const studentList = students || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-headline-md font-bold text-xl text-on-surface">Danh sách học viên</h3>
        <Link href="/pt/students" className="text-xs text-primary font-bold hover:underline">
          Xem tất cả
        </Link>
      </div>

      <div className="space-y-3">
        {studentList.map((student: PTStudentSummary) => {
          const avatar = getAvatarUrl(student.avatarUrl);

          return (
            <div
              key={student.id}
              className="bento-card rounded-2xl p-4 border border-outline-variant/30 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 shrink-0">
                    <img src={avatar} alt={student.fullName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">{student.fullName}</h4>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {student.packageName}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-primary block">
                    {student.remainingSessions}/{student.totalSessions}
                  </span>
                  <span className="text-[10px] text-on-surface-variant">Buổi còn lại</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex justify-around">
                <button
                  type="button"
                  className="text-primary text-xs font-semibold flex items-center gap-1.5 hover:underline cursor-pointer"
                >
                  <Award size={14} className="shrink-0" />
                  Before/After
                </button>
                <button
                  type="button"
                  className="text-primary text-xs font-semibold flex items-center gap-1.5 hover:underline cursor-pointer"
                >
                  <Activity size={14} className="shrink-0" />
                  InBody
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PtStudentRosterQuick;
