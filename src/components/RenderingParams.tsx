'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { appActions, ShadingMethod } from '@/lib/redux/appSlice';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';

const minSamples = 1;
const maxSamples = 10000;
const minBounces = 1;
const maxBounces = 16;
const minCameraFov = 10;
const maxCameraFov = 120;

export default function RenderingParams(): JSX.Element {
  const dispatch = useAppDispatch();
  const cameraFov = useAppSelector((state) => state.cameraFov);
  const numSamples = useAppSelector((state) => state.numSamples);
  const numBounces = useAppSelector((state) => state.numBounces);
  const shadingMethod = useAppSelector((state) => state.shadingMethod);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-base font-bold">Camera Field of View</Label>
            <span className="font-bold">{cameraFov}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{minCameraFov}</span>
            <Slider
              value={[cameraFov]}
              min={minCameraFov}
              max={maxCameraFov}
              step={1}
              onValueChange={(value) => dispatch(appActions.setCameraFov(value[0]))}
              className="flex-1"
            />
            <span className="text-sm">{maxCameraFov}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-base font-bold"># of Samples Per Pixel</Label>
            <span className="font-bold">{numSamples}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{minSamples}</span>
            <Slider
              value={[numSamples]}
              min={minSamples}
              max={maxSamples}
              step={1}
              onValueChange={(value) => dispatch(appActions.setNumSamples(value[0]))}
              className="flex-1"
            />
            <span className="text-sm">{maxSamples}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-base font-bold"># of Ray Bounces</Label>
            <span className="font-bold">{numBounces}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{minBounces}</span>
            <Slider
              value={[numBounces]}
              min={minBounces}
              max={maxBounces}
              step={1}
              onValueChange={(value) => dispatch(appActions.setNumBounces(value[0]))}
              className="flex-1"
            />
            <span className="text-sm">{maxBounces}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Separator className="my-4" />
        <Label className="text-base font-bold">Shading Method</Label>
        <RadioGroup
          value={shadingMethod.toString()}
          onValueChange={(value) => dispatch(appActions.setShadingMethod(Number.parseInt(value)))}
          className="flex gap-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={ShadingMethod.flat.toString()} id="flat" />
            <Label htmlFor="flat">Flat</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={ShadingMethod.phong.toString()} id="phong" />
            <Label htmlFor="phong">Phong</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
