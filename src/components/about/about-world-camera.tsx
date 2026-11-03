"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { CatmullRomCurve3, MathUtils, Vector3 } from "three";

/** Each quarter of scroll reaches one stop. World objects share these coordinates. */
export const WORLD_CAMERA_STOPS = [
  { progress: 0, position: [0, 2, 12], lookAt: [0, 1.8, 0] },
  { progress: .25, position: [0, 1.3, -22], lookAt: [0, .2, -30] },
  { progress: .5, position: [13, .5, -36], lookAt: [9, 1, -48] },
  { progress: .75, position: [-9, .5, -62], lookAt: [-4, 1, -73] },
  { progress: 1, position: [0, .5, -90], lookAt: [0, .7, -108] },
] as const;

type WorldCameraProps = {
  progress: MotionValue<number>;
  /** Pointer coordinates normalized to -1…1. Positive y means down the screen. */
  pointer: MutableRefObject<{ x: number; y: number }>;
  reduced: boolean;
  paused?: boolean;
  /** Actual damped route position, for captions and other world UI. */
  renderedProgress?: MotionValue<number>;
};

export function WorldCamera({ progress, pointer, reduced, paused = false, renderedProgress }: WorldCameraProps) {
  const curves = useMemo(() => ({
    position: new CatmullRomCurve3(WORLD_CAMERA_STOPS.map(stop => new Vector3(...stop.position)), false, "centripetal"),
    target: new CatmullRomCurve3(WORLD_CAMERA_STOPS.map(stop => new Vector3(...stop.lookAt)), false, "centripetal"),
  }), []);
  const targetPositionRef = useRef(new Vector3());
  const targetLookRef = useRef(new Vector3());
  const smoothedProgress = useRef(0);
  const smoothedPointer = useRef({ x: 0, y: 0 });
  const initialized = useRef(false);

  useFrame(({ camera }, rawDelta) => {
    if (document.hidden || paused) return;
    const targetPosition = targetPositionRef.current;
    const targetLook = targetLookRef.current;
    const raw = progress.get();
    const t = MathUtils.clamp(Number.isFinite(raw) ? raw : 0, 0, 1);
    const blend = reduced || !initialized.current ? 1 : 1 - Math.exp(-7 * Math.min(rawDelta, .06));
    const requestedT = reduced ? Math.round(t * 4) / 4 : t;
    smoothedProgress.current = MathUtils.lerp(smoothedProgress.current, requestedT, blend);
    const routeT = smoothedProgress.current;
    curves.position.getPoint(routeT, targetPosition);
    curves.target.getPoint(routeT, targetLook);

    // Small physical head movement; larger look offset makes the world respond visibly.
    if (!reduced) {
      const px = MathUtils.clamp(pointer.current.x, -1, 1);
      const py = MathUtils.clamp(pointer.current.y, -1, 1);
      smoothedPointer.current.x = MathUtils.lerp(smoothedPointer.current.x, px, blend);
      smoothedPointer.current.y = MathUtils.lerp(smoothedPointer.current.y, py, blend);
      targetPosition.x += smoothedPointer.current.x * .4;
      targetPosition.y -= smoothedPointer.current.y * .25;
      targetLook.x += smoothedPointer.current.x * 1.8;
      targetLook.y -= smoothedPointer.current.y * 1.3;
    }

    camera.position.copy(targetPosition);
    camera.lookAt(targetLook);
    renderedProgress?.set(routeT);
    initialized.current = true;
  });

  return null;
}
