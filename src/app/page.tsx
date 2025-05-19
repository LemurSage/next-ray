'use client';
import Canvas from '@/components/Canvas';
import FileUpload from '@/components/FileUpload';
import Forms from '@/components/Forms';
import { Progress } from '@/components/Progress';
import StoreProvider from '@/components/StoreProvider';
import { defaultCanvasVars } from '@/lib/types/CanvasVars';
import { Toaster } from 'sonner';

export default function Home() {
  return (
    <StoreProvider>
      <main className="w-fit mx-auto py-20" style={{ width: `${defaultCanvasVars.canvasWd}px` }}>
        <FileUpload />
        <Canvas />
        <Progress />
        <Toaster richColors closeButton />
        <Forms />
      </main>
    </StoreProvider>
  );
}
