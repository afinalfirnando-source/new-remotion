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

const SPHERE_COUNT = 18;
const SPHERE_SIZE_MIN = 420;
const SPHERE_SIZE_MAX = 860;

interface Sphere {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
}

const SPHERES: Sphere[] = Array.from({ length: SPHERE_COUNT }, (_, i) => {
  const r = mulberry32(1000 + i);
  const speeds = [1, 2, 3, 4, 5, 6];
  return {
    id: i,
    x: r() * 100,
    y: r() * 100,
    size: SPHERE_SIZE_MIN + r() * (SPHERE_SIZE_MAX - SPHERE_SIZE_MIN),
    speed: speeds[i % speeds.length],
    phase: r() * TAU,
  };
});

const SPECULARS = Array.from({ length: 8 }, (_, i) => {
  const r = mulberry32(2000 + i);
  const speeds = [1, 2, 3, 4, 5, 6, 7, 8];
  return {
    id: i,
    angle: r() * TAU,
    dist: 18 + r() * 22,
    size: 2 + r() * 6,
    speed: speeds[i % speeds.length],
    phase: r() * TAU,
  };
});

const GRAIN = Array.from({ length: 180 }, (_, i) => {
  const r = mulberry32(3000 + i);
  return { x: r() * 100, y: r() * 100 };
});

const Background: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: "#050505" }} />
);

const BaseChrome: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const t = frame / totalFrames;
  const r1 = t * 360;
  const r2 = -t * 180;
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 1600,
        height: 1600,
        marginLeft: -800,
        marginTop: -800,
        borderRadius: "50%",
        background: `conic-gradient(from ${r1}deg at 50% 50%, #e8e8e8 0%, #2a2a2a 20%, #c0c0c0 40%, #1a1a1a 60%, #e8e8e8 80%, #f5e6d3 100%)`,
        mixBlendMode: "screen",
        opacity: 0.9,
      }}
    />
  );
};

const ChromeSphere: React.FC<{
  sphere: Sphere;
  frame: number;
  totalFrames: number;
}> = ({ sphere, frame, totalFrames }) => {
  const t = frame / totalFrames;
  const rotation = sphere.phase + t * 360 * sphere.speed;
  const pulse = 0.92 + 0.08 * Math.sin(t * TAU * 2 + sphere.phase);
  const size = sphere.size * pulse;

  return (
    <div
      style={{
        position: "absolute",
        left: `${sphere.x}%`,
        top: `${sphere.y}%`,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: "50%",
        background: `conic-gradient(from ${rotation}deg at 50% 50%, #e8e8e8 0%, #2a2a2a 18%, #c0c0c0 36%, #1a1a1a 54%, #e8e8e8 72%, #f5e6d3 90%, #e8e8e8 100%)`,
        mixBlendMode: "screen",
        opacity: 0.95,
        willChange: "transform",
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

const FilmGrain: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  return (
    <div style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.3, pointerEvents: "none" }}>
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
              opacity: 0.12,
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
        "radial-gradient(ellipse at center, transparent 20%, rgba(5,5,5,0.65) 70%, rgba(5,5,5,0.98) 100%)",
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

        {SPHERES.map((sphere) => (
          <ChromeSphere
            key={sphere.id}
            sphere={sphere}
            frame={frame}
            totalFrames={durationInFrames}
          />
        ))}
      </div>

      <SpecularHighlights frame={frame} totalFrames={durationInFrames} />
      <Vignette />
      <FilmGrain frame={frame} totalFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
