import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

const RAY_COUNT = 42;
const PARTICLE_COUNT = 180;
const STAR_COUNT_BG = 140;
const STAR_COUNT_FG = 80;
const GRAIN_COUNT = 260;

const PALETTE = [
  "#ff0080", "#00f0ff", "#ff00ff", "#ffe600",
  "#00ff88", "#ff5500", "#9d4dff", "#00b3ff",
  "#ff3366", "#66ff00", "#ff8800", "#00ffcc",
];

interface Ray {
  id: number;
  baseAngle: number;
  color: string;
  baseWidth: number;
  lengthFactor: number;
  speed: number;
  phase: number;
  intensity: number;
  reverse: boolean;
}

interface Particle {
  id: number;
  orbit: number;
  radius: number;
  size: number;
  speed: number;
  color: string;
  twinklePhase: number;
}

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const generateRays = (): Ray[] => {
  const rand = mulberry32(7919);
  return Array.from({ length: RAY_COUNT }, (_, i) => ({
    id: i,
    baseAngle: (i / RAY_COUNT) * 360 + rand() * 6,
    color: PALETTE[i % PALETTE.length],
    baseWidth: 1.4 + rand() * 3.2,
    lengthFactor: 1.7 + rand() * 0.9,
    speed: 0.35 + rand() * 0.9,
    phase: rand(),
    intensity: 0.55 + rand() * 0.45,
    reverse: rand() > 0.5,
  }));
};

const generateParticles = (): Particle[] => {
  const rand = mulberry32(31337);
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    orbit: rand() * Math.PI * 2,
    radius: 0.18 + rand() * 0.42,
    size: 1 + rand() * 3.5,
    speed: 0.15 + rand() * 0.6,
    color: PALETTE[Math.floor(rand() * PALETTE.length)],
    twinklePhase: rand(),
  }));
};

const RAYS = generateRays();
const PARTICLES = generateParticles();

const STARS_BG = Array.from({ length: STAR_COUNT_BG }, (_, i) => {
  const rand = mulberry32(101 + i);
  return { x: rand() * 100, y: rand() * 100, size: 0.6 + rand() * 1.4, phase: rand() };
});
const STARS_FG = Array.from({ length: STAR_COUNT_FG }, (_, i) => {
  const rand = mulberry32(202 + i);
  return { x: rand() * 100, y: rand() * 100, size: 1.2 + rand() * 2.6, phase: rand() };
});
const GRAIN = Array.from({ length: GRAIN_COUNT }, (_, i) => {
  const rand = mulberry32(303 + i);
  return { x: rand() * 100, y: rand() * 100 };
});

const TAU = Math.PI * 2;
const tri = (t: number) => 1 - Math.abs(((t % 1) * 2) - 1);
const triPeriod = (frame: number, totalFrames: number) => tri(frame / totalFrames);

const VolumetricRay: React.FC<{
  ray: Ray;
  frame: number;
  totalFrames: number;
  layer: number;
}> = ({ ray, frame, totalFrames, layer }) => {
  const t = frame / totalFrames;
  const dir = ray.reverse ? -1 : 1;
  const turns = Math.max(1, Math.round(ray.speed * 4));
  const rotation = t * 360 * turns * dir;
  const drift = Math.sin(t * TAU * 2 + ray.phase * TAU) * 14;

  const triV = triPeriod(frame, totalFrames);
  const pulse = ray.intensity + (1 - ray.intensity) * triV;

  const wScale = 1 + layer * 0.55;
  const lScale = 1 + layer * 0.2;
  const oScale = 1 - layer * 0.22;
  const w = ray.baseWidth * wScale;
  const len = 4200 * ray.lengthFactor * lScale;
  const blur = w * (1.2 + layer * 1.4);
  const glow = w * (5 + layer * 4);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: len,
        height: w,
        background: `linear-gradient(90deg,
          ${ray.color}ff 0%,
          ${ray.color}cc 6%,
          ${ray.color}66 22%,
          ${ray.color}22 50%,
          transparent 100%)`,
        transform: `translate(0, -50%) rotate(${ray.baseAngle + rotation + drift}deg)`,
        transformOrigin: "left center",
        opacity: pulse * oScale,
        mixBlendMode: "screen",
        filter: `blur(${blur}px) drop-shadow(0 0 ${glow}px ${ray.color}) brightness(1.5) saturate(1.4)`,
        willChange: "transform, opacity",
      }}
    />
  );
};

const Core: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const t = frame / totalFrames;
  const breath = 0.92 + 0.08 * Math.sin(t * TAU);
  const hueRot = t * 360;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 2400,
          height: 2400,
          marginLeft: -1200,
          marginTop: -1200,
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg, rgba(255,0,150,0.22), rgba(0,200,255,0.22), rgba(150,0,255,0.22), rgba(255,200,0,0.22), rgba(255,0,150,0.22))",
          transform: `rotate(${hueRot}deg) scale(${breath})`,
          mixBlendMode: "screen",
          filter: "blur(90px) saturate(1.8)",
          opacity: 0.85,
        }}
      />
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
          background:
            "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,180,255,0.55) 18%, rgba(180,80,255,0.25) 40%, transparent 70%)",
          transform: `scale(${breath * 0.95})`,
          mixBlendMode: "screen",
          filter: "blur(20px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 120,
          height: 120,
          marginLeft: -60,
          marginTop: -60,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #ffffff 0%, #ffe6ff 40%, transparent 80%)",
          transform: `scale(${breath})`,
          mixBlendMode: "screen",
          filter: "blur(8px)",
        }}
      />
    </>
  );
};

const OrbitingParticles: React.FC<{
  frame: number;
  totalFrames: number;
  width: number;
  height: number;
}> = ({ frame, totalFrames, width, height }) => {
  const maxR = Math.hypot(width, height) * 0.55;
  const t = frame / totalFrames;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {PARTICLES.map((p) => {
        const a = p.orbit + t * TAU * p.speed;
        const r = maxR * p.radius;
        const x = width / 2 + Math.cos(a) * r;
        const y = height / 2 + Math.sin(a) * r;
        const twinkle =
          0.4 + 0.6 * (Math.sin(t * TAU + p.twinklePhase * TAU) * 0.5 + 0.5);
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
              borderRadius: "50%",
              backgroundColor: p.color,
              opacity: twinkle,
              boxShadow: `0 0 ${p.size * 6}px ${p.color}, 0 0 ${p.size * 14}px ${p.color}`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </div>
  );
};

const StarLayer: React.FC<{
  stars: { x: number; y: number; size: number; phase: number }[];
  speed: number;
  frame: number;
  totalFrames: number;
}> = ({ stars, speed, frame, totalFrames }) => {
  const t = (frame / totalFrames) * speed;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {stars.map((s, i) => {
        const phaseT = (t + s.phase) % 1;
        const triV = 1 - Math.abs(phaseT * 2 - 1);
        const twinkle = 0.15 + 0.8 * triV;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              opacity: twinkle,
              boxShadow: `0 0 ${s.size * 5}px #ffffff`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </div>
  );
};

const AnamorphicFlare: React.FC<{
  frame: number;
  totalFrames: number;
  width: number;
  height: number;
}> = ({ frame, totalFrames, width, height }) => {
  const t = frame / totalFrames;
  const orbit = t * TAU;
  const cx = width / 2 + Math.cos(orbit) * width * 0.1;
  const cy = height / 2 + Math.sin(orbit * 0.6) * height * 0.1;
  const pulse = 0.7 + 0.3 * Math.sin(t * TAU);
  const streak = Math.cos(orbit) * width * 0.4;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          width: 16,
          height: 16,
          marginLeft: -8,
          marginTop: -8,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #ffffff 0%, rgba(255,200,150,0.6) 40%, transparent 80%)",
          opacity: pulse,
          mixBlendMode: "screen",
          filter: "blur(4px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: cx + streak,
          top: cy,
          width: Math.abs(streak) + 200,
          height: 3,
          marginLeft: streak < 0 ? streak - 200 : 0,
          borderRadius: 2,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,150,200,0.6) 50%, transparent 100%)",
          opacity: pulse * 0.7,
          mixBlendMode: "screen",
          filter: "blur(6px)",
        }}
      />
    </>
  );
};

const FilmGrain: React.FC<{ frame: number; totalFrames: number }> = ({
  frame,
  totalFrames,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        mixBlendMode: "overlay",
        opacity: 0.4,
        pointerEvents: "none",
      }}
    >
      {GRAIN.map((g, i) => {
        const f = Math.sin((frame / totalFrames) * TAU * 8 + i * 1.7);
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
              opacity: 0.18,
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
        "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.97) 100%)",
      pointerEvents: "none",
    }}
  />
);

const ChromaticAberration: React.FC<{ frame: number; totalFrames: number }> = ({
  frame,
  totalFrames,
}) => {
  const shift = 0.6 + 0.6 * Math.sin((frame / totalFrames) * TAU);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(90deg, rgba(255,0,80,0.05) 0%, transparent 50%, rgba(0,200,255,0.05) 100%)",
        mixBlendMode: "screen",
        opacity: shift,
        pointerEvents: "none",
      }}
    />
  );
};

const BackgroundField: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 30% 20%, rgba(80,0,140,0.35) 0%, transparent 55%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 70% 80%, rgba(0,80,160,0.35) 0%, transparent 55%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#03000a",
      }}
    />
  </>
);

export const LaserShow: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#03000a", overflow: "hidden" }}>
      <BackgroundField />

      <StarLayer
        stars={STARS_BG}
        speed={1.2}
        frame={frame}
        totalFrames={durationInFrames}
      />

      {Array.from({ length: 3 }).map((_, layer) => (
        <React.Fragment key={layer}>
          {RAYS.map((ray) => (
            <VolumetricRay
              key={`${ray.id}-${layer}`}
              ray={ray}
              frame={frame}
              totalFrames={durationInFrames}
              layer={layer}
            />
          ))}
        </React.Fragment>
      ))}

      <Core frame={frame} totalFrames={durationInFrames} />
      <OrbitingParticles
        frame={frame}
        totalFrames={durationInFrames}
        width={width}
        height={height}
      />
      <AnamorphicFlare
        frame={frame}
        totalFrames={durationInFrames}
        width={width}
        height={height}
      />
      <StarLayer
        stars={STARS_FG}
        speed={2.4}
        frame={frame}
        totalFrames={durationInFrames}
      />

      <ChromaticAberration frame={frame} totalFrames={durationInFrames} />
      <Vignette />
      <FilmGrain frame={frame} totalFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
