"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

interface ParallaxPhotoProps {
  src: string;
  alt: string;
  caption?: string;
  subcaption?: string;
  height?: string;
  overlay?: "dark" | "gradient" | "none";
  priority?: boolean;
}

export function ParallaxPhoto({
  src,
  alt,
  caption,
  subcaption,
  height = "70vh",
  overlay = "dark",
  priority = false,
}: ParallaxPhotoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Image moves slower than scroll = parallax effect
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.4, 1, 1, 0.4]);

  // Caption slides up on scroll
  const captionY = useTransform(scrollYProgress, [0.2, 0.5], [60, 0]);
  const captionOpacity = useTransform(scrollYProgress, [0.2, 0.45], [0, 1]);

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ height }}
    >
      {/* Parallax image */}
      <motion.div
        className="absolute inset-0"
        style={{ y, scale: 1.2 }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority={priority}
        />
      </motion.div>

      {/* Overlay */}
      {overlay === "dark" && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      {overlay === "gradient" && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      )}

      {/* Fade edges */}
      <motion.div className="absolute inset-0" style={{ opacity }}>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" style={{ opacity: 0.6 }} />
      </motion.div>

      {/* Caption */}
      {caption && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center z-10 px-6"
            style={{ y: captionY, opacity: captionOpacity }}
          >
            <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-[-0.03em] leading-tight">
              {caption}
            </h3>
            {subcaption && (
              <p className="mt-3 text-sm md:text-base text-white/60 font-mono tracking-wider uppercase">
                {subcaption}
              </p>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
