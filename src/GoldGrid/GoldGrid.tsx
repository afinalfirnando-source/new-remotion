import React from "react";
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

const GRID_COLS = 6;
const GRID_ROWS = 4;

interface Sphere {
  id: number;
  col: number;
  row: number;
  speed: number;
  phase: number;
  orbitRadius: number;
}

const SPHERES: Sphere[] = (() => {
  const spheres: Sphere[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const r = mulberry32(1000 + row * GRID_COLS + col);
      const speeds = [1, 2, 3, 4, 5, 6];
      spheres.push({
        id: row * GRID_COLS + col,
        col,
        row,
        speed: speeds[(col + row) % speeds.length],
        phase: r() * TAU,
        orbitRadius: 2 + r() * 4,
      });
    }
  }
  return spheres;
})();

const SPECULARS = Array.from({ length: 8 }, (_, i) => {
  const r = mulberry32(2000 + i);
  const speeds = [1, 2, 3, 4, 5, 6, 7, 8];
  return {
    id: i,
    angle: r() * TAU,
    dist: 20 + r() * 20,
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
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.25) 0%, rgba(218,165,32,0.15) 40%, transparent 70%)",
        mixBlendMode: "screen",
      }}
    />
  </>
);

const BaseGold: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.35) 0%, rgba(184,134,11,0.2) 35%, rgba(139,105,20,0.1) 60%, transparent 80%)",
      mixBlendMode: "screen",
    }}
  />
);

const GoldSphere: React.FC<{
  sphere: Sphere;
  frame: number;
  totalFrames: number;
  width: number;
  height: number;
  size: number;
}> = ({ sphere, frame, totalFrames, width, height, size }) => {
  const t = frame / totalFrames;
  const rotation = sphere.phase + t * 360 * sphere.speed;
  const pulse = 0.95 + 0.05 * Math.sin(t * TAU * 2 + sphere.phase);
  const s = size * pulse;

  const cellW = width / GRID_COLS;
  const cellH = height / GRID_ROWS;
  const cx = (sphere.col + 0.5) * cellW;
  const cy = (sphere.row + 0.5) * cellH;
  const driftX = Math.sin(t * TAU * 1 + sphere.phase) * sphere.orbitRadius;
  const driftY = Math.cos(t * TAU * 1 + sphere.phase) * sphere.orbitRadius * 0.7;

  return (
    <div
      style={{
        position: "absolute",
        left: cx + driftX - s / 2,
        top: cy + driftY - s / 2,
        width: s,
        height: s,
        borderRadius: "50%",
        background: `conic-gradient(from ${rotation}deg at 50% 50%, #FFD700 0%, #B8860B 20%, #DAA520 40%, #8B6914 60%, #FFD700 80%, #F0E68D 100%)`,
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
              boxShadow: `0 0 ${sp.size * 3}px #ffffff, 0 0 ${sp.size * 6}px #F0E68D`,
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
        "radial-gradient(ellipse at center, transparent 20%, rgba(15,52,96,0.5) 72%, rgba(10,20,40,0.95) 100%)",
      pointerEvents: "none",
    }}
  />
);

export const GoldGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const t = frame / durationInFrames;
  const globalRotation = t * 360;
  const cellW = width / GRID_COLS;
  const cellH = height / GRID_ROWS;
  const size = Math.max(cellW, cellH) * 1.55;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f3460", overflow: "hidden" }}>
      <Background />
      <BaseGold />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotate(${globalRotation}deg)`,
          transformOrigin: "center center",
        }}
      >
        {SPHERES.map((sphere) => (
          <GoldSphere
            key={sphere.id}
            sphere={sphere}
            frame={frame}
            totalFrames={durationInFrames}
            width={width}
            height={height}
            size={size}
          />
        ))}
      </div>

      <SpecularHighlights frame={frame} totalFrames={durationInFrames} />
      <Vignette />
      <FilmGrain frame={frame} totalFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
