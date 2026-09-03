import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

const TAU = Math.PI * 2;
const DURATION = 960;

const BLOB_COUNT = 4;
const SPECULAR_COUNT = 5;
const GRAIN_COUNT = 240;

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
  baseX: number;
  baseY: number;
  radius: number;
  speed: number;
  phase: number;
  hue: string;
}

const BLOBS: Blob[] = Array.from({ length: BLOB_COUNT }, (_, i) => {
  const r = mulberry32(1000 + i);
  const hues = ["#e8e8e8", "#f5e6d3", "#e8b4b8", "#d4e5f7"];
  return {
    id: i,
    baseX: 0.2 + r() * 0.6,
    baseY: 0.2 + r() * 0.6,
    radius: 120 + r() * 160,
    speed: 1 + r() * 2,
    phase: r(),
    hue: hues[i % hues.length],
  };
});

const SPECULARS = Array.from({ length: SPECULAR_COUNT }, (_, i) => {
  const r = mulberry32(2000 + i);
  return {
    id: i,
    angle: r() * TAU,
    distance: 0.25 + r() * 0.35,
    size: 4 + r() * 10,
    speed: 1 + r() * 1.5,
    phase: r(),
  };
});

const GRAIN = Array.from({ length: GRAIN_COUNT }, (_, i) => {
  const r = mulberry32(3000 + i);
  return { x: r() * 100, y: r() * 100 };
});

const Background: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#050505",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(40,40,50,0.4) 0%, transparent 60%)",
      }}
    />
  </>
);

const EnvironmentReflection: React.FC<{ frame: number; totalFrames: number }> = ({
  frame,
  totalFrames,
}) => {
  const t = frame / totalFrames;
  const shift = (t * 100) % 100;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(245,230,211,0.06) 0%, rgba(232,180,184,0.04) 40%, rgba(5,5,5,0.9) 100%)",
        mixBlendMode: "screen",
        opacity: 0.6,
      }}
    />
  );
};

const BaseChrome: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const t = frame / totalFrames;
  const rotation = t * 360;
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 800,
        height: 800,
        marginLeft: -400,
        marginTop: -400,
        borderRadius: "50%",
        background: `conic-gradient(from ${rotation}deg, #e8e8e8 0%, #2a2a2a 25%, #c0c0c0 50%, #1a1a1a 75%, #e8e8e8 100%)`,
        filter: "blur(1.5px) contrast(1.3) saturate(0.2)",
        mixBlendMode: "screen",
        opacity: 0.95,
      }}
    />
  );
};

const DistortionMap: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const t = frame / totalFrames;
  const n1 = Math.sin(t * TAU * 3) * 0.5 + 0.5;
  const n2 = Math.cos(t * TAU * 2) * 0.5 + 0.5;
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 900,
        height: 900,
        marginLeft: -450,
        marginTop: -450,
        borderRadius: "50%",
        background: `radial-gradient(circle at ${40 + n1 * 20}% ${40 + n2 * 20}%, rgba(245,230,211,0.15) 0%, transparent 60%)`,
        mixBlendMode: "overlay",
        filter: "blur(20px)",
      }}
    />
  );
};

const KeyLight: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const t = frame / totalFrames;
  const x = 25 + Math.sin(t * TAU * 0.5) * 10;
  const y = 25 + Math.cos(t * TAU * 0.3) * 8;
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: 600,
        height: 600,
        marginLeft: -300,
        marginTop: -300,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,230,211,0.9) 0%, rgba(245,230,211,0.4) 25%, transparent 65%)",
        mixBlendMode: "screen",
        filter: "blur(40px)",
      }}
    />
  );
};

const FillLight: React.FC = () => (
  <div
    style={{
      position: "absolute",
      right: "5%",
      top: "40%",
      width: 500,
      height: 500,
      marginRight: -250,
      marginTop: -250,
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(232,180,184,0.55) 0%, rgba(232,180,184,0.15) 35%, transparent 70%)",
      mixBlendMode: "screen",
      filter: "blur(60px)",
    }}
  />
);

const RimLight: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: "20%",
      left: "50%",
      width: 300,
      height: 800,
      marginLeft: -150,
      marginTop: -400,
      background: "linear-gradient(180deg, transparent 30%, rgba(212,229,247,0.3) 50%, transparent 70%)",
      mixBlendMode: "screen",
      filter: "blur(30px)",
    }}
  />
);

const SpecularHighlights: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const t = frame / totalFrames;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {SPECULARS.map((sp) => {
        const angle = sp.angle + t * TAU * sp.speed * 0.3;
        const dist = sp.distance * 220;
        const x = 50 + Math.cos(angle) * dist;
        const y = 50 + Math.sin(angle) * dist;
        const pulse = 0.6 + 0.4 * Math.sin(t * TAU * sp.speed + sp.phase * TAU);
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
              boxShadow: `0 0 ${sp.size * 3}px #ffffff, 0 0 ${sp.size * 8}px #f5e6d3`,
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
  const shape = getShape(t, blob.id);
  const x = blob.baseX * width + shape.dx;
  const y = blob.baseY * height + shape.dy;
  const r = blob.radius * shape.scale;
  const pulse = 0.85 + 0.15 * Math.sin(t * TAU * blob.speed + blob.phase * TAU);
  const morphBorder = shape.borderRadius;

  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: morphBorder,
        background: blob.hue,
        opacity: pulse * 0.85,
        mixBlendMode: "screen",
        filter: `blur(${shape.blur}px) contrast(${shape.contrast}) saturate(${shape.saturate})`,
        willChange: "transform, border-radius",
      }}
    />
  );
};

const getShape = (t: number, seed: number) => {
  const cycle = (t * 4 + seed * 0.1) % 1;
  const morphT = cycle < 0.5 ? cycle * 2 : 2 - cycle * 2;
  const base = Math.sin(morphT * TAU) * 0.5 + 0.5;

  const br = `${30 + base * 40}% ${30 + base * 40}% ${50 + base * 30}% ${50 + base * 30}% / ${40 + base * 30}% ${40 + base * 30}% ${60 + base * 20}% ${60 + base * 20}%`;
  return {
    dx: Math.sin(morphT * TAU * 2 + seed) * 40,
    dy: Math.cos(morphT * TAU * 2 + seed) * 30,
    scale: 0.8 + base * 0.4,
    borderRadius: br,
    blur: 25 + base * 15,
    contrast: 18 + base * 6,
    saturate: 0.8 + base * 0.4,
  };
};

const LensFlare: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const t = frame / totalFrames;
  const intensity = Math.max(0, Math.sin(t * TAU) * 0.5 + 0.5);
  return (
    <div
      style={{
        position: "absolute",
        left: "35%",
        top: "30%",
        width: 400,
        height: 400,
        marginLeft: -200,
        marginTop: -200,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(245,230,211,0.3) 30%, rgba(232,180,184,0.1) 55%, transparent 75%)",
        opacity: intensity * 0.6,
        mixBlendMode: "screen",
        filter: "blur(15px)",
      }}
    />
  );
};

const FilmGrain: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  return (
    <div style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.35, pointerEvents: "none" }}>
      {GRAIN.map((g, i) => {
        const f = Math.sin((frame / totalFrames) * TAU * 6 + i * 1.7);
        const on = f > 0.3;
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
              opacity: 0.15,
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
        "radial-gradient(ellipse at center, transparent 30%, rgba(5,5,5,0.7) 75%, rgba(5,5,5,0.98) 100%)",
      pointerEvents: "none",
    }}
  />
);

export const LiquidChrome: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const t = frame / durationInFrames;
  const globalRotation = t * 5;

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
        <DistortionMap frame={frame} totalFrames={durationInFrames} />
        <KeyLight frame={frame} totalFrames={durationInFrames} />
        <FillLight />
        <RimLight />
        <SpecularHighlights frame={frame} totalFrames={durationInFrames} />

        {BLOBS.map((blob) => (
          <MorphBlob
            key={blob.id}
            blob={blob}
            frame={frame}
            totalFrames={durationInFrames}
            width={width}
            height={height}
          />
        ))}
      </div>

      <EnvironmentReflection frame={frame} totalFrames={durationInFrames} />
      <LensFlare frame={frame} totalFrames={durationInFrames} />
      <Vignette />
      <FilmGrain frame={frame} totalFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
