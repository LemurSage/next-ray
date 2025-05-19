'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { appActions, LoadingSpinner } from '@/lib/redux/appSlice';
import { useAppDispatch } from '@/lib/redux/hooks';
import { FileUp, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

export default function FileUpload() {
  const dispatch = useAppDispatch();
  const [objFile, setObjFile] = useState<File | null>(null);
  const [mtlFile, setMtlFile] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [blobUrls, setBlobUrls] = useState<{ objUrl: string; mtlUrl: string } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter for .obj and .mtl files
    const objFiles = acceptedFiles.filter((file) => file.name.toLowerCase().endsWith('.obj'));
    const mtlFiles = acceptedFiles.filter((file) => file.name.toLowerCase().endsWith('.mtl'));

    if (objFiles.length > 0) {
      setObjFile(objFiles[0]);
    }

    if (mtlFiles.length > 0) {
      setMtlFile(mtlFiles[0]);
    }

    // Show toast for feedback
    if (objFiles.length > 0 || mtlFiles.length > 0) {
      toast.success('Files added', {
        description: `Added ${objFiles.length > 0 ? objFiles[0].name : ''} ${
          mtlFiles.length > 0 ? mtlFiles[0].name : ''
        }`.trim(),
      });
    } else {
      toast.error('Invalid files', {
        description: 'Please upload .obj and .mtl files only',
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/obj': ['.obj'],
      'model/mtl': ['.mtl'],
    },
    multiple: true,
  });

  const validateObjFile = async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;

        // Check if there are any face statements with less than 3 vertices
        const lines = content.split('\n');
        let isValid = true;
        let lineNumber = 0;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('f ')) {
            const parts = line.split(' ').filter((p) => p && p !== 'f');
            if (parts.length < 3) {
              isValid = false;
              lineNumber = i + 1;
              break;
            }
          }
        }

        if (isValid) {
          resolve(true);
        } else {
          reject(`Invalid OBJ file: Face at line ${lineNumber} has less than 3 vertices`);
        }
      };
      reader.onerror = () => reject('Failed to read the file');
      reader.readAsText(file);
    });
  };

  const handleLoadModel = async () => {
    if (!objFile) {
      toast.error('Missing OBJ file', {
        description: 'Please upload an OBJ file',
      });
      return;
    }

    try {
      // Validate files before loading
      await validateObjFile(objFile);

      // Show loading spinner
      dispatch(appActions.setLoadingSpinner(LoadingSpinner.show));

      // Create object URLs for the files
      const objUrl = URL.createObjectURL(objFile);
      const mtlUrl = mtlFile ? URL.createObjectURL(mtlFile) : '';

      // Save URLs for cleanup
      setBlobUrls({ objUrl, mtlUrl });

      console.log('Created URLs:', objUrl, mtlUrl);

      // Create a custom event to notify Canvas component to load the new model
      const customEvent = new CustomEvent('loadCustomModel', {
        detail: { objUrl, mtlUrl },
      });

      console.log('Dispatching custom event:', customEvent);
      window.dispatchEvent(customEvent);

      toast.success('Loading model', {
        description: 'Please wait while the model is being loaded...',
      });
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Invalid 3D model', {
        description: error instanceof Error ? error.message : String(error),
      });
      dispatch(appActions.setLoadingSpinner(LoadingSpinner.fail));
    }
  };

  useEffect(() => {
    return () => {
      if (blobUrls) {
        URL.revokeObjectURL(blobUrls.objUrl);
        if (blobUrls.mtlUrl) URL.revokeObjectURL(blobUrls.mtlUrl);
      }
    };
  }, [blobUrls]);

  const clearFiles = () => {
    setObjFile(null);
    setMtlFile(null);
    toast.info('Files cleared', {
      description: 'All selected files have been cleared.',
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Upload 3D Model</CardTitle>
        <CardDescription>Drag and drop your .obj and .mtl files here</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <FileUp className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
          {isDragActive ? (
            <p>Drop the files here...</p>
          ) : (
            <p>Drag and drop .obj and .mtl files here, or click to select files</p>
          )}
        </div>

        {(objFile || mtlFile) && (
          <div className="space-y-2">
            <h3 className="font-medium">Selected Files:</h3>
            <div className="space-y-1">
              {objFile && (
                <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                  <span>{objFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setObjFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {mtlFile && (
                <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                  <span>{mtlFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMtlFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={clearFiles} disabled={!objFile}>
            Clear
          </Button>
          <Button onClick={handleLoadModel} disabled={!objFile}>
            Load Model
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
