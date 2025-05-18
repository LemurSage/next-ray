'use client';
import Canvas from '@/components/Canvas';
import Forms from '@/components/Forms';
import { Progress } from '@/components/Progress';
import StoreProvider from '@/components/StoreProvider';
import { defaultCanvasVars } from '@/lib/types/CanvasVars';

export default function Home() {
  return (
    <StoreProvider>
      <main className="w-fit mx-auto py-20" style={{ width: `${defaultCanvasVars.canvasWd}px` }}>
        <Canvas />
        <Progress />
        <Forms />
      </main>
    </StoreProvider>
  );
}
