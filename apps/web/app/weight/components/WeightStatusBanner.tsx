'use client';

import React from 'react';
import type { WeightStatusBannerProps } from '../../../interface';

export const WeightStatusBanner: React.FC<WeightStatusBannerProps> = ({
  statusMessage,
}) => {
  return (
    <div className="text-center py-1">
      <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-white/95">
        {statusMessage}
      </p>
    </div>
  );
};

export default WeightStatusBanner;
