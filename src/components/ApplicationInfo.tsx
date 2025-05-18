'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function ApplicationInfo() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <p>NO LICENSE AT ALL. FREE TO STEAL</p>
            <p>
              <a href="https://github.com/LemurSage/next-ray" className="text-primary hover:underline">
                Project @ GitHub
              </a>
            </p>
            <p>
              Copyright &copy; 2025&nbsp;
              <a href="mailto:zainjee37405@gmail.com" className="text-primary hover:underline">
                Muhammad Zain Jee
              </a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-2">
            <p>
              <span className="font-bold">* Rotate</span> Left click + drag.
            </p>
            <p>
              <span className="font-bold">* Translate</span> Right click + drag. Or ctrl + left click + drag.
            </p>
            <p>
              <span className="font-bold">* Dolly In/Out</span> Left + right click + drag. Or shift + left click + drag.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
