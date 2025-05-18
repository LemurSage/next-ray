'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/lib/redux/hooks';

export default function RenderingStatus() {
  const renderingPass = useAppSelector((state) => state.renderingPass);
  const elapsedTime = useAppSelector((state) => state.elapsedTime);
  const numSamples = useAppSelector((state) => state.numSamples);
  const etaTime = useAppSelector((state) => state.etaTime);
  const avgTime = useAppSelector((state) => state.avgTime);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-center">Rendering Pass</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {renderingPass} / {numSamples}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-center">Elapsed Time</CardTitle>
        </CardHeader>
        <CardContent className="text-center">{elapsedTime}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-center">Remaining Time</CardTitle>
        </CardHeader>
        <CardContent className="text-center">{etaTime}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-center">Avg. Duration Per Pass</CardTitle>
        </CardHeader>
        <CardContent className="text-center">{avgTime}</CardContent>
      </Card>
    </div>
  );
}
