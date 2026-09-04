import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

const TAU = Math.PI * 2;

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const COLS = 8;
const ROWS = 6;
const PADDING = 3;

interface Sphere {
  id: number;
  col: number;
  row: number;
  speed: number;
  phase: number;
}

const SPHERES: Sphere[] = (() => {
  const spheres: Sphere[] = [];
  const totalCols = COLS + PADDING * 2;
  const totalRows = ROWS + PADDING * 2;
  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < totalCols; col++) {
      const r = mulberry32(1000 + row * totalCols + col);
      const speeds = [1, 2, 3, 4, 5, 6];
      spheres.push({
        id: row * totalCols + col,
        col: col - PADDING,
        row: row - PADDING,
        speed: speeds[(col + row) % speeds.length],
        phase: r() * TAU,
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
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.95) 0%, rgba(218,165,32,0.8) 30%, rgba(184,134,11,0.6) 55%, rgba(139,105,20,0.4) 75%, rgba(0,0,0,0.1) 100%)",
    }}
  />
);

const GoldSphere: React.FC<{
  sphere: Sphere;
  frame: number;
  totalFrames: number;
  x: number;
  y: number;
  size: number;
}> = ({ sphere, frame, totalFrames, x, y, size }) => {
  const t = frame / totalFrames;
  const rotation = sphere.phase + t * 360 * sphere.speed;
  const s = size;

  return (
    <div
      style={{
        position: "absolute",
        left: x - s / 2,
        top: y - s / 2,
        width: s,
        height: s,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, #FFD700 0%, #DAA520 25%, #B8860B 50%, #8B6914 100%)`,
        boxShadow: `inset 0 0 ${s * 0.15}px rgba(255,255,255,0.4), inset 0 0 ${s * 0.05}px rgba(0,0,0,0.3)`,
        opacity: 0.98,
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
        "radial-gradient(ellipse at center, transparent 15%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.97) 100%)",
      pointerEvents: "none",
    }}
  />
);

export const GoldGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const t = frame / durationInFrames;
  const globalRotation = t * 360;

  const cellW = width / COLS;
  const cellH = height / ROWS;
  const size = Math.min(cellW, cellH) * 1.08;

  const gridPixelW = COLS * cellW;
  const gridPixelH = ROWS * cellH;
  const offsetX = (width - gridPixelW) / 2;
  const offsetY = (height - gridPixelH) / 2;

  const spheres = SPHERES.map((sphere) => {
    const cx = offsetX + (sphere.col + 0.5) * cellW;
    const cy = offsetY + (sphere.row + 0.5) * cellH;
    return { ...sphere, cx, cy };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>
      <Background />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotate(${globalRotation}deg)`,
          transformOrigin: "center center",
        }}
      >
        {spheres.map((sphere) => (
          <GoldSphere
            key={sphere.id}
            sphere={sphere}
            frame={frame}
            totalFrames={durationInFrames}
            x={sphere.cx}
            y={sphere.cy}
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
