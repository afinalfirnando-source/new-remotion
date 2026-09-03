import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

const TAU = Math.PI * 2;
const DURATION = 960;

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

interface Blob {
  id: number;
  cx: number;
  cy: number;
  r: number;
  speed: number;
  phase: number;
  orbitSpeed: number;
  orbitRadius: number;
}

const BLOBS: Blob[] = Array.from({ length: 5 }, (_, i) => {
  const r = mulberry32(1000 + i);
  const speeds = [1, 2, 3, 4, 5];
  return {
    id: i,
    cx: 50,
    cy: 50,
    r: 140 + r() * 120,
    speed: speeds[i % speeds.length],
    phase: r() * TAU,
    orbitSpeed: speeds[(i + 2) % speeds.length],
    orbitRadius: 8 + r() * 15,
  };
});

const SPECULARS = Array.from({ length: 6 }, (_, i) => {
  const r = mulberry32(2000 + i);
  const speeds = [1, 2, 3, 4, 5, 6];
  return {
    id: i,
    angle: r() * TAU,
    dist: 20 + r() * 25,
    size: 3 + r() * 8,
    speed: speeds[i % speeds.length],
    phase: r() * TAU,
  };
});

const GRAIN = Array.from({ length: 200 }, (_, i) => {
  const r = mulberry32(3000 + i);
  return { x: r() * 100, y: r() * 100 };
});

const Background: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: "#050505" }} />
);

const BaseChrome: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const t = frame / totalFrames;
  const r1 = t * 360;
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 1000,
        height: 1000,
        marginLeft: -500,
        marginTop: -500,
        borderRadius: "50%",
        background: `conic-gradient(from ${r1}deg at 50% 50%, #e8e8e8 0%, #2a2a2a 20%, #c0c0c0 40%, #1a1a1a 60%, #e8e8e8 80%, #f5e6d3 100%)`,
        mixBlendMode: "screen",
        opacity: 0.95,
      }}
    />
  );
};

const SpecularHighlights: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const t = frame / totalFrames;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {SPECULARS.map((sp) => {
        const angle = sp.angle + t * TAU * sp.speed;
        const dist = sp.dist * 0.25;
        const x = 50 + Math.cos(angle) * dist;
        const y = 50 + Math.sin(angle) * dist;
        const pulse = 0.5 + 0.5 * Math.sin(t * TAU * sp.speed + sp.phase);
        return (
          <div
            key={sp.id}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: sp.size,
              height: sp.size,
              marginLeft: -sp.size / 2,
              marginTop: -sp.size / 2,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              opacity: pulse,
              boxShadow: `0 0 ${sp.size * 3}px #ffffff, 0 0 ${sp.size * 6}px #f5e6d3`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </div>
  );
};

const MorphBlob: React.FC<{
  blob: Blob;
  frame: number;
  totalFrames: number;
  width: number;
  height: number;
}> = ({ blob, frame, totalFrames, width, height }) => {
  const t = frame / totalFrames;
  const angle = blob.phase + t * TAU * blob.orbitSpeed;
  const orbitX = Math.cos(angle) * blob.orbitRadius;
  const orbitY = Math.sin(angle) * blob.orbitRadius * 0.7;
  const x = blob.cx + orbitX;
  const y = blob.cy + orbitY;

  const shape = getShape(t, blob.id);
  const r = blob.r * shape.scale;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: r * 2,
        height: r * 2,
        marginLeft: -r,
        marginTop: -r,
        borderRadius: shape.borderRadius,
        background: `radial-gradient(circle at ${35 + shape.lightX}% ${35 + shape.lightY}%, #f5e6d3 0%, #e8b4b8 20%, #e8e8e8 50%, #2a2a2a 100%)`,
        opacity: shape.opacity,
        mixBlendMode: "screen",
        filter: `blur(${shape.blur}px)`,
        willChange: "transform, border-radius, opacity",
      }}
    />
  );
};

const getShape = (t: number, seed: number) => {
  const cycle = (t * 4 + seed * 0.13) % 1;
  const morphT = cycle < 0.5 ? cycle * 2 : 2 - cycle * 2;
  const s = Math.sin(morphT * TAU);
  const s2 = Math.sin(morphT * TAU * 2 + seed);

  const br = [
    `${30 + s * 25}%`,
    `${30 + s2 * 25}%`,
    `${55 + s * 20}%`,
    `${55 + s2 * 20}%`,
  ].join(" ");

  return {
    scale: 0.75 + Math.abs(s) * 0.5,
    borderRadius: br,
    blur: 0,
    opacity: 0.85 + Math.abs(s) * 0.15,
    lightX: s * 10,
    lightY: s2 * 10,
  };
};

const FilmGrain: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  return (
    <div style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.35, pointerEvents: "none" }}>
      {GRAIN.map((g, i) => {
        const f = Math.sin((frame / totalFrames) * TAU * 5 + i * 1.3);
        const on = f > 0.2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${g.x}%`,
              top: `${g.y}%`,
              width: 1,
              height: 1,
              backgroundColor: on ? "#ffffff" : "#000000",
              opacity: 0.14,
            }}
          />
        );
      })}
    </div>
  );
};

const Vignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse at center, transparent 25%, rgba(5,5,5,0.6) 72%, rgba(5,5,5,0.98) 100%)",
      pointerEvents: "none",
    }}
  />
);

export const LiquidChrome: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const t = frame / durationInFrames;
  const globalRotation = t * 360;

  return (
    <AbsoluteFill style={{ backgroundColor: "#050505", overflow: "hidden" }}>
      <Background />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotate(${globalRotation}deg)`,
          transformOrigin: "center center",
        }}
      >
        <BaseChrome frame={frame} totalFrames={durationInFrames} />

        {BLOBS.map((blob) => (
          <MorphBlob
            key={blob.id}
            blob={blob}
            frame={frame}
            totalFrames={durationInFrames}
            width={100}
            height={100}
          />
        ))}
      </div>

      <SpecularHighlights frame={frame} totalFrames={durationInFrames} />
      <Vignette />
      <FilmGrain frame={frame} totalFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
