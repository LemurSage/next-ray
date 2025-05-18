'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import ApplicationInfo from './ApplicationInfo';
import RenderingParams from './RenderingParams';
import RenderingStatus from './RenderingStatus';

export default function Forms() {
  const [activeTab, setActiveTab] = useState('rendering-params');

  return (
    <div className="mt-4 border rounded-lg">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b px-4 py-2">
          <TabsList className="bg-transparent w-full justify-start gap-4">
            <TabsTrigger value="rendering-params" className="data-[state=active]:bg-muted">
              Rendering Parameters
            </TabsTrigger>
            <TabsTrigger value="rendering-status" className="data-[state=active]:bg-muted">
              Rendering Status
            </TabsTrigger>
            <TabsTrigger value="application-info" className="data-[state=active]:bg-muted">
              Application Info
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="rendering-params" className="mt-0">
          <RenderingParams />
        </TabsContent>
        <TabsContent value="rendering-status" className="mt-0">
          <RenderingStatus />
        </TabsContent>
        <TabsContent value="application-info" className="mt-0">
          <ApplicationInfo />
        </TabsContent>
      </Tabs>
    </div>
  );
}
