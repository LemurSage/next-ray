'use client';

import { Progress as ProgressUI } from '@/components/ui/progress';
import { useAppSelector } from '@/lib/redux/hooks';

export function Progress() {
  const renderingPass = useAppSelector((state) => state.renderingPass);
  const numSamples = useAppSelector((state) => state.numSamples);
  const proportion = renderingPass / numSamples; // 0.0 - 1.0
  const percentage = Math.floor(proportion * 100 + 0.5);

  return (
    <section className="flex flex-col gap-1 mt-1 mb-4">
      <div className="flex items-center">
        <ProgressUI value={percentage} className="h-2 w-[97%]" />
        <span className="ml-2 text-right font-semibold text-sm">{percentage}%</span>
      </div>
    </section>
  );
}
