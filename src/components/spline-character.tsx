"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { Application } from "@splinetool/runtime";
import { PikachuAvatar } from "./pikachu-avatar";

const SPLINE_SCENE_URL = "https://prod.spline.design/V62uY8ufxBxptyGF/scene.splinecode";

type CharacterProps = { state: "idle" | "talking"; size?: number; compact?: boolean };
export function SplineCharacter({ state, size = 56 }: CharacterProps) {
  const reduced = useReducedMotion();
  if (reduced) return <PikachuAvatar size="100%" active={false}/>;
  return <LiveSplineCharacter key={size} state={state} size={size}/>;
}
function LiveSplineCharacter({ state, size = 56 }: CharacterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!canvasRef.current) return;
    let cancelled = false, expired = false;
    const canvas = canvasRef.current;
    let app: Application | null = null;
    let observer: MutationObserver | undefined;
    let settle: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => { expired = true; app?.dispose(); appRef.current = null; }, 12000);
    const loseContext = () => {
      if (expired || cancelled) return;
      // A GPU reset must restore the visible SVG, not leave an empty launcher.
      expired = true;
      clearTimeout(timeout);
      clearInterval(settle);
      observer?.disconnect();
      appRef.current = null;
      try { app?.dispose(); } catch { /* Context is already unavailable. */ }
      if (!cancelled) setLoaded(false);
    };
    canvas.addEventListener("webglcontextlost", loseContext);
    const visibility = () => {
      if (!appRef.current) return;
      if (document.hidden) appRef.current.stop(); else appRef.current.play();
    };
    async function load() {
      try {
        const { Application } = await import("@splinetool/runtime");
        if (cancelled || expired || !canvasRef.current) return;
        app = new Application(canvasRef.current);
        await app.load(SPLINE_SCENE_URL);
        if (cancelled || expired) { app.dispose(); return; }
        clearTimeout(timeout);
        const frame = () => {
          const canvas = canvasRef.current;
          if (!canvas || !app) return;
          if (canvas.style.width !== "100%") canvas.style.width = "100%";
          if (canvas.style.height !== "100%") canvas.style.height = "100%";
        };
        const configure = () => {
          if (!app) return;
          app.setSize(Math.round(size * 1.38), Math.round(size * 1.38));
          frame();
          for (const name of ["PKB", "Ellipse", "Cylinder", "Torus", "Boolean 2"]) {
            const object = app.findObjectByName(name);
            if (object) object.visible = false;
          }
          app.setZoom(.62);
        };
        observer = new MutationObserver(frame);
        observer.observe(canvasRef.current!, { attributes: true, attributeFilter: ["style"] });
        configure();
        let frames = 0;
        settle = setInterval(() => { configure(); if (++frames >= 6) clearInterval(settle); }, 500);
        appRef.current = app;
        visibility();
        setLoaded(true);
      } catch { clearTimeout(timeout); app?.dispose(); }
    }
    void load();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      clearInterval(settle);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", loseContext);
      appRef.current = null;
      app?.dispose();
    };
  }, [size]);

  useEffect(() => {
    if (!loaded || state !== "talking") return;
    const react = () => {
      if (document.hidden) return;
      try { appRef.current?.emitEvent("mouseHover", "hit box"); } catch { /* Different scene versions may omit the interaction. */ }
    };
    react();
    const interval = setInterval(react, 1500);
    return () => clearInterval(interval);
  }, [state, loaded]);

  return <div style={{ width: "100%", height: "100%", position: "relative", flexShrink: 0, overflow: "hidden" }} aria-hidden="true">
    {(!loaded) && <div className="pika-character-fallback"><PikachuAvatar size="100%" active={state === "talking"}/></div>}
    <canvas ref={canvasRef} width={512} height={512} style={{ width: "100%", height: "100%", position: "absolute", inset: 0, opacity: loaded ? 1 : 0, pointerEvents: "none", transform: "translate(13%, 9%) scale(1.38)", transformOrigin: "50% 0%", transition: "opacity 200ms ease" }}/>
  </div>;
}
