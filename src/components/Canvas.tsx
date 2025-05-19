'use client';

import { useCallback, useEffect, useRef } from 'react';
import Vector1x4 from '@/lib/math/Vector1x4';
import { appActions, LoadingSpinner } from '@/lib/redux/appSlice';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import CanvasShader from '@/lib/scene/CanvasShader';
import ColorTextures from '@/lib/scene/ColorTextures';
import RandomTexture from '@/lib/scene/RandomTexture';
import SampleShader from '@/lib/scene/SampleShader';
import Scene from '@/lib/scene/Scene';
import { type CanvasVars, defaultCanvasVars } from '@/lib/types/CanvasVars';
import { toast } from 'sonner';

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180.0;
}

function GPU_MeetsRequirements(GL: WebGL2RenderingContext) {
  if (!GL.getExtension('EXT_color_buffer_float')) {
    console.log('EXT_color_buffer_float not supported');
    return false;
  }

  const MAX_ARRAY_TEXTURE_LAYERS = GL.getParameter(GL.MAX_ARRAY_TEXTURE_LAYERS);
  const MAX_TEXTURE_IMAGE_UNITS = GL.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS);
  const MAX_RENDERBUFFER_SIZE = GL.getParameter(GL.MAX_RENDERBUFFER_SIZE);
  const MAX_TEXTURE_SIZE = GL.getParameter(GL.MAX_TEXTURE_SIZE);

  console.log(`MAX_ARRAY_TEXTURE_LAYERS = ${MAX_ARRAY_TEXTURE_LAYERS}`);
  console.log(`MAX_TEXTURE_IMAGE_UNITS = ${MAX_TEXTURE_IMAGE_UNITS}`);
  console.log(`MAX_RENDERBUFFER_SIZE = ${MAX_RENDERBUFFER_SIZE}`);
  console.log(`MAX_TEXTURE_SIZE = ${MAX_TEXTURE_SIZE}`);

  if (
    MAX_ARRAY_TEXTURE_LAYERS < 2048 ||
    MAX_TEXTURE_IMAGE_UNITS < 16 ||
    MAX_RENDERBUFFER_SIZE < 16384 ||
    MAX_TEXTURE_SIZE < 16384
  ) {
    return false;
  }

  return true;
}

export default function Canvas() {
  const dispatch = useAppDispatch();
  const cameraFov = useAppSelector((state) => state.cameraFov);
  const numSamples = useAppSelector((state) => state.numSamples);
  const numBounces = useAppSelector((state) => state.numBounces);
  const shadingMethod = useAppSelector((state) => state.shadingMethod);
  const loadingSpinner = useAppSelector((state) => state.loadingSpinner);
  const cvRef = useRef<CanvasVars>({ ...defaultCanvasVars });
  const cv = cvRef.current;

  useEffect(() => {
    cv.renderingPass = 0;
    cv.restartRenderTimestamp = Date.now();

    cv.cameraFov = cameraFov;
    cv.numSamples = numSamples;
    cv.numBounces = numBounces;
    cv.shadingMethod = shadingMethod;

    dispatch(appActions.setRenderingPass(0));
    dispatch(appActions.setElapsedTime('00:00:00'));
    dispatch(appActions.setEtaTime('??:??:??'));
    dispatch(appActions.setAvgTime('????'));
  }, [cv, cameraFov, numSamples, numBounces, shadingMethod, dispatch]);

  // Add this useEffect to listen for the custom event

  useEffect(() => {
    const handleLoadCustomModel = async (event: Event) => {
      // Use proper type casting and validation
      const customEvent = event as CustomEvent<{ objUrl: string; mtlUrl: string }>;

      // Log to debug
      console.log('Custom model event received:', customEvent);

      if (!customEvent.detail || !customEvent.detail.objUrl) {
        console.error('Invalid event data', customEvent);
        toast.error('Missing model data', {
          description: 'The model information is incomplete or invalid.',
        });
        return;
      }

      const { objUrl, mtlUrl } = customEvent.detail;
      console.log('Loading model from:', objUrl, mtlUrl);

      try {
        if (!cv.GL) {
          throw new Error('WebGL context is not initialized');
        }

        dispatch(appActions.setLoadingSpinner(LoadingSpinner.show));

        // Create and initialize scene with the uploaded files
        cv.scene = new Scene(cv.GL, objUrl, mtlUrl);
        console.log('Scene created, initializing...');
        await cv.scene.init();
        console.log('Scene initialized successfully');

        // Reset rendering
        cv.renderingPass = 0;
        cv.restartRenderTimestamp = Date.now();

        dispatch(appActions.setRenderingPass(0));
        dispatch(appActions.setElapsedTime('00:00:00'));
        dispatch(appActions.setEtaTime('??:??:??'));
        dispatch(appActions.setAvgTime('????'));
        dispatch(appActions.setLoadingSpinner(LoadingSpinner.hide));

        toast.success('Custom model loaded successfully');
      } catch (error) {
        console.error('Error loading model:', error);
        dispatch(appActions.setLoadingSpinner(LoadingSpinner.fail));
        toast.error('Failed to load 3D model', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    // Add event listener with proper typing
    window.addEventListener('loadCustomModel', handleLoadCustomModel);

    return () => {
      window.removeEventListener('loadCustomModel', handleLoadCustomModel);
    };
  }, [cv, dispatch]);

  const canvasCb = useCallback(
    (htmlCanvasElement: HTMLCanvasElement) => {
      function render() {
        if (cv.renderingPass < cv.numSamples) {
          if (cv.renderingPass === 0 || (!cv.lButtonDown && !cv.rButtonDown)) {
            ++cv.renderingPass; // always render pass 0 even if left or right mouse buttton is down

            if (cv.sampleShader && cv.canvasShader) {
              cv.sampleShader.draw(cv);
              cv.canvasShader.draw(cv);
            }

            const elapsed = Date.now() - cv.restartRenderTimestamp;
            const average = elapsed / cv.renderingPass;
            const eta = (cv.numSamples - cv.renderingPass) * average;

            dispatch(appActions.setRenderingPass(cv.renderingPass));
            dispatch(appActions.setElapsedTime(new Date(elapsed).toISOString().slice(11, 19)));
            dispatch(appActions.setEtaTime(new Date(eta).toISOString().slice(11, 19)));
            dispatch(appActions.setAvgTime(`${average.toFixed(0)}ms`));
          }
        }
        requestAnimationFrame(render);
      }

      function renderReset() {
        cv.renderingPass = 0;
        cv.restartRenderTimestamp = Date.now();

        dispatch(appActions.setRenderingPass(0));
        dispatch(appActions.setElapsedTime('00:00:00'));
        dispatch(appActions.setEtaTime('??:??:??'));
        dispatch(appActions.setAvgTime('????'));
      }

      function onMouseMove(event: MouseEvent) {
        if (cv.scene?.cameraNode && cv.scene?.parentNode) {
          const x = event.clientX;
          const y = event.clientY;

          if ((cv.lButtonDownOnCanvas && cv.rButtonDownOnCanvas) || (cv.lButtonDownOnCanvas && event.shiftKey)) {
            // dolly
            if (y !== cv.y && cv.scene.cameraNode) {
              cv.scene.cameraNode.translate(new Vector1x4(0, (cv.y - y) * cv.TXYZ_SCALAR, 0));
              renderReset();
            }
          } else if ((cv.lButtonDownOnCanvas && event.ctrlKey) || cv.rButtonDownOnCanvas) {
            // move
            if (x !== cv.x || y !== cv.y) {
              const dx = (cv.x - x) * cv.TXYZ_SCALAR;
              const dz = (y - cv.y) * cv.TXYZ_SCALAR;
              const dv = cv.scene.cameraNode.mapPos(new Vector1x4(dx, 0, dz, 0), cv.scene.parentNode);
              cv.scene.parentNode.translate(dv); // move parent in camera space
              renderReset();
            }
          } else if (cv.lButtonDownOnCanvas) {
            // rotate
            if (x !== cv.x || y !== cv.y) {
              cv.scene.parentNode.rotateZ(degreesToRadians(cv.x - x) * cv.RXYZ_SCALAR); // yaw camera target around it's own z-axis
              cv.scene.cameraNode.rotateX(degreesToRadians(cv.y - y) * cv.RXYZ_SCALAR, cv.scene.parentNode); // pitch around camera's parent x-axis
              renderReset();
            }
          }
          cv.x = x;
          cv.y = y;
        }
      }

      function onMouseDown(event: MouseEvent) {
        const rect = htmlCanvasElement.getBoundingClientRect();
        cv.x = event.clientX;
        cv.y = event.clientY;

        switch (event.button) {
          case 0:
            cv.lButtonDown = true;
            cv.lButtonDownOnCanvas = cv.x > rect.left && cv.x < rect.right && cv.y > rect.top && cv.y < rect.bottom;
            break;
          case 2:
            cv.rButtonDown = true;
            cv.rButtonDownOnCanvas = cv.x > rect.left && cv.x < rect.right && cv.y > rect.top && cv.y < rect.bottom;
            break;
          default:
            break;
        }
      }

      function onMouseUp(event: MouseEvent) {
        switch (event.button) {
          case 0:
            cv.lButtonDown = false;
            cv.lButtonDownOnCanvas = false;
            break;
          case 2:
            cv.rButtonDown = false;
            cv.rButtonDownOnCanvas = false;
            break;
          default:
            break;
        }
      }

      if (!cv.GL) {
        cv.GL = htmlCanvasElement.getContext('webgl2', {
          depth: false,
          alpha: false,
        });

        if (cv.GL && GPU_MeetsRequirements(cv.GL)) {
          window.oncontextmenu = (e: MouseEvent) => e.preventDefault();
          window.onmousemove = onMouseMove;
          window.onmousedown = onMouseDown;
          window.onmouseup = onMouseUp;

          cv.colorTextures = new ColorTextures(cv.GL, cv.canvasWd, cv.canvasHt);
          cv.randomTexture = new RandomTexture(cv.GL, cv.canvasWd, cv.canvasHt);
          cv.sampleShader = new SampleShader(cv.GL);
          cv.canvasShader = new CanvasShader();

          Promise.all([
            cv.sampleShader.init(cv.GL, '/sample-vs.glsl', '/sample-fs.glsl'),
            cv.canvasShader.init(cv.GL, '/canvas-vs.glsl', '/canvas-fs.glsl'),
          ])
            .then(() => {
              dispatch(appActions.setLoadingSpinner(LoadingSpinner.show));
              cv.scene = new Scene(cv.GL, '/suzanne.obj', '/suzanne.mtl');
              return cv.scene.init();
            })
            .then(() => {
              dispatch(appActions.setLoadingSpinner(LoadingSpinner.hide));

              // Check if we loaded a custom model
              const isCustomModel =
                typeof window !== 'undefined' &&
                (localStorage.getItem('customObjUrl') || localStorage.getItem('customMtlUrl'));

              if (isCustomModel) {
                toast.success('Custom model loaded', {
                  description: 'Your 3D model has been loaded successfully.',
                });
              } else {
                toast.success('Model loaded', {
                  description: 'The default 3D model has been loaded successfully.',
                });
              }

              requestAnimationFrame(render);
            })
            .catch((error) => {
              console.error('Error initializing scene:', error);
              dispatch(appActions.setLoadingSpinner(LoadingSpinner.fail));
              toast.error('Error', {
                description: 'Failed to load the model. Please try again.',
              });
            });
        } else {
          toast.error('WebGL Error', {
            description: 'Your browser or GPU does not support the required WebGL 2 features.',
          });
        }
      }
    },
    [cv, dispatch],
  );

  return (
    <>
      {loadingSpinner === LoadingSpinner.show && <div className="spinner" />}
      <canvas ref={canvasCb} width={cv.canvasWd} height={cv.canvasHt} className="rounded-md shadow-md">
        Please use a GPU and browser that supports WebGL 2
      </canvas>
    </>
  );
}
