"use client";

import { useEffect, useRef } from "react";

export function NatureScene({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let time = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = canvas!.offsetWidth * dpr;
      canvas!.height = canvas!.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas!.offsetWidth;
    const h = () => canvas!.offsetHeight;

    // Colors
    const isDark = () => document.documentElement.classList.contains("dark") ||
      getComputedStyle(document.documentElement).getPropertyValue("--background").trim().startsWith("#0");

    // Birds
    const birds = Array.from({ length: 8 }, () => ({
      x: Math.random() * 1400,
      y: 40 + Math.random() * 120,
      speed: 0.3 + Math.random() * 0.5,
      wingPhase: Math.random() * Math.PI * 2,
      wingSpeed: 3 + Math.random() * 2,
      size: 3 + Math.random() * 4,
    }));

    // Cloud puffs
    const clouds = Array.from({ length: 5 }, () => ({
      x: Math.random() * 1600,
      y: 30 + Math.random() * 80,
      w: 80 + Math.random() * 120,
      h: 25 + Math.random() * 20,
      speed: 0.1 + Math.random() * 0.15,
      opacity: 0.15 + Math.random() * 0.2,
    }));

    // River particles (sparkles on water)
    const sparkles = Array.from({ length: 30 }, () => ({
      x: Math.random(),
      phase: Math.random() * Math.PI * 2,
      speed: 1 + Math.random() * 2,
      size: 1 + Math.random() * 2,
    }));

    function drawSky(dark: boolean) {
      const grad = ctx.createLinearGradient(0, 0, 0, h() * 0.6);
      if (dark) {
        grad.addColorStop(0, "#0a1628");
        grad.addColorStop(0.5, "#152238");
        grad.addColorStop(1, "#1a3050");
      } else {
        grad.addColorStop(0, "#87CEEB");
        grad.addColorStop(0.4, "#B0E0E6");
        grad.addColorStop(1, "#E0F4FF");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w(), h() * 0.65);
    }

    function drawStars(dark: boolean) {
      if (!dark) return;
      for (let i = 0; i < 60; i++) {
        const sx = (i * 137.5) % w();
        const sy = (i * 73.3) % (h() * 0.4);
        const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time * 0.5 + i));
        ctx.beginPath();
        ctx.arc(sx, sy, 0.5 + Math.random() * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${twinkle * 0.6})`;
        ctx.fill();
      }
    }

    function drawMountainLayer(baseY: number, peaks: number[], color: string, sway: number) {
      ctx.beginPath();
      ctx.moveTo(-10, h());
      const segW = (w() + 20) / (peaks.length - 1);
      for (let i = 0; i < peaks.length; i++) {
        const px = -10 + i * segW;
        const py = baseY - peaks[i] + Math.sin(time * 0.2 + i * 0.8) * sway;
        if (i === 0) ctx.lineTo(px, py);
        else {
          const cpx = px - segW / 2;
          ctx.quadraticCurveTo(cpx, baseY - peaks[i] * 1.15 + Math.sin(time * 0.15 + i) * sway, px, py);
        }
      }
      ctx.lineTo(w() + 10, h());
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    function drawMountains(dark: boolean) {
      const base = h() * 0.55;
      // Far mountains
      drawMountainLayer(base + 20, [60, 140, 100, 180, 120, 160, 80, 130, 90],
        dark ? "#0f2440" : "#a8c8e0", 1.5);
      // Mid mountains
      drawMountainLayer(base + 40, [40, 100, 160, 80, 130, 70, 110, 50],
        dark ? "#162d4a" : "#7ba8c4", 1);
      // Near mountains with snow caps
      const nearPeaks = [30, 80, 190, 60, 150, 100, 170, 40, 90];
      drawMountainLayer(base + 50, nearPeaks,
        dark ? "#1e3a5c" : "#5a8aa8", 0.5);

      // Snow caps on tallest peaks
      const segW = (w() + 20) / (nearPeaks.length - 1);
      ctx.fillStyle = dark ? "rgba(200,220,240,0.3)" : "rgba(255,255,255,0.7)";
      nearPeaks.forEach((peak, i) => {
        if (peak > 130) {
          const px = -10 + i * segW;
          const py = base + 50 - peak + Math.sin(time * 0.2 + i * 0.8) * 0.5;
          ctx.beginPath();
          ctx.moveTo(px - 15, py + 20);
          ctx.lineTo(px, py);
          ctx.lineTo(px + 15, py + 20);
          ctx.closePath();
          ctx.fill();
        }
      });
    }

    function drawTreeLine(dark: boolean) {
      const baseY = h() * 0.62;
      ctx.fillStyle = dark ? "#0d2a1a" : "#2d6a4f";
      for (let i = 0; i < 40; i++) {
        const tx = (i / 40) * w() + Math.sin(i * 3) * 20;
        const th = 15 + Math.sin(i * 2.5) * 8;
        const sway = Math.sin(time * 0.8 + i * 0.5) * 1.5;
        // Simple triangle tree
        ctx.beginPath();
        ctx.moveTo(tx + sway, baseY - th);
        ctx.lineTo(tx - 5, baseY);
        ctx.lineTo(tx + 5, baseY);
        ctx.closePath();
        ctx.fill();
      }
    }

    function drawRiver(dark: boolean) {
      const riverY = h() * 0.68;
      const riverH = h() * 0.12;

      // River body
      const grad = ctx.createLinearGradient(0, riverY, 0, riverY + riverH);
      if (dark) {
        grad.addColorStop(0, "#0a2540");
        grad.addColorStop(0.5, "#0d3055");
        grad.addColorStop(1, "#0a2540");
      } else {
        grad.addColorStop(0, "#4a90b8");
        grad.addColorStop(0.5, "#5ba8d4");
        grad.addColorStop(1, "#4a90b8");
      }

      // Wavy river shape
      ctx.beginPath();
      ctx.moveTo(-10, riverY);
      for (let x = 0; x <= w(); x += 4) {
        const wave = Math.sin(x * 0.008 + time * 0.8) * 4 + Math.sin(x * 0.02 + time * 1.2) * 2;
        ctx.lineTo(x, riverY + wave);
      }
      // Bottom edge
      for (let x = w(); x >= 0; x -= 4) {
        const wave = Math.sin(x * 0.01 + time * 0.6) * 3;
        ctx.lineTo(x, riverY + riverH + wave);
      }
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Flowing ripples
      ctx.strokeStyle = dark ? "rgba(100,180,255,0.15)" : "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const ry = riverY + 5 + (i / 8) * (riverH - 10);
        ctx.beginPath();
        for (let x = 0; x <= w(); x += 3) {
          const wave = Math.sin(x * 0.015 + time * 1.5 + i * 1.2) * 2;
          if (x === 0) ctx.moveTo(x, ry + wave);
          else ctx.lineTo(x, ry + wave);
        }
        ctx.stroke();
      }

      // Water sparkles
      sparkles.forEach((s) => {
        const sx = ((s.x * w() + time * 20 * s.speed) % (w() + 40)) - 20;
        const sy = riverY + 5 + Math.sin(s.phase + time) * 3 + (riverH * 0.5);
        const alpha = 0.3 + 0.5 * Math.abs(Math.sin(time * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fillStyle = dark ? `rgba(140,200,255,${alpha * 0.4})` : `rgba(255,255,255,${alpha * 0.6})`;
        ctx.fill();
      });
    }

    function drawGround(dark: boolean) {
      const groundY = h() * 0.78;
      const grad = ctx.createLinearGradient(0, groundY, 0, h());
      if (dark) {
        grad.addColorStop(0, "#0d2a1a");
        grad.addColorStop(1, "#091a10");
      } else {
        grad.addColorStop(0, "#4a8c5c");
        grad.addColorStop(1, "#3a7a4c");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, groundY, w(), h() - groundY);

      // Grass tufts
      ctx.strokeStyle = dark ? "#1a4a2a" : "#5aa06c";
      ctx.lineWidth = 1;
      for (let i = 0; i < 60; i++) {
        const gx = (i / 60) * w() + Math.sin(i * 7) * 15;
        const gy = groundY + Math.random() * (h() - groundY) * 0.3;
        const sway = Math.sin(time * 1.2 + i * 0.8) * 3;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.quadraticCurveTo(gx + sway, gy - 8, gx + sway * 1.5, gy - 12);
        ctx.stroke();
      }
    }

    function drawClouds(dark: boolean) {
      clouds.forEach((c) => {
        c.x += c.speed;
        if (c.x > w() + c.w) c.x = -c.w * 2;

        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
        ctx.ellipse(c.x - c.w * 0.25, c.y + 5, c.w * 0.3, c.h * 0.4, 0, 0, Math.PI * 2);
        ctx.ellipse(c.x + c.w * 0.25, c.y + 3, c.w * 0.35, c.h * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = dark
          ? `rgba(30,50,80,${c.opacity})`
          : `rgba(255,255,255,${c.opacity + 0.3})`;
        ctx.fill();
      });
    }

    function drawBirds(dark: boolean) {
      birds.forEach((b) => {
        b.x += b.speed;
        b.wingPhase += b.wingSpeed * 0.016;
        if (b.x > w() + 50) { b.x = -50; b.y = 40 + Math.random() * 120; }

        const wing = Math.sin(b.wingPhase) * b.size * 1.2;
        const bobY = b.y + Math.sin(time * 0.5 + b.wingPhase) * 3;

        ctx.strokeStyle = dark ? "rgba(180,200,220,0.6)" : "rgba(40,40,40,0.7)";
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";

        // Left wing
        ctx.beginPath();
        ctx.moveTo(b.x, bobY);
        ctx.quadraticCurveTo(b.x - b.size, bobY - wing, b.x - b.size * 2, bobY - wing * 0.5);
        ctx.stroke();

        // Right wing
        ctx.beginPath();
        ctx.moveTo(b.x, bobY);
        ctx.quadraticCurveTo(b.x + b.size, bobY - wing, b.x + b.size * 2, bobY - wing * 0.5);
        ctx.stroke();
      });
    }

    function draw() {
      time += 0.016;
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w(), h());

      const dark = isDark();

      drawSky(dark);
      drawStars(dark);
      drawClouds(dark);
      drawBirds(dark);
      drawMountains(dark);
      drawTreeLine(dark);
      drawRiver(dark);
      drawGround(dark);

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: "none" }}
    />
  );
}
