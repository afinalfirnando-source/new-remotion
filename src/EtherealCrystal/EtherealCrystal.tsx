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

const RAY_COUNT = 10;
const PARTICLE_COUNT = 220;
const SPECTRUM = ["#ff0000", "#ff8800", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#8800ff", "#ff00ff"];

interface Ray {
  id: number;
  angle: number;
  length: number;
  color: string;
  speed: number;
  phase: number;
}

interface Particle {
  id: number;
  angle: number;
  dist: number;
  size: number;
  speed: number;
  phase: number;
  color: string;
}

const RAYS: Ray[] = Array.from({ length: RAY_COUNT }, (_, i) => {
  const r = mulberry32(1000 + i);
  return {
    id: i,
    angle: (i / RAY_COUNT) * TAU,
    length: 35 + r() * 25,
    color: SPECTRUM[i % SPECTRUM.length],
    speed: 1 + r() * 2,
    phase: r() * TAU,
  };
});

const PARTICLES: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const r = mulberry32(2000 + i);
  return {
    id: i,
    angle: r() * TAU,
    dist: 15 + r() * 35,
    size: 1 + r() * 3,
    speed: 0.5 + r() * 2,
    phase: r() * TAU,
    color: SPECTRUM[Math.floor(r() * SPECTRUM.length)],
  };
});

const Crystal: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const t = frame / totalFrames;
  const rotation = t * 360;
  const pulse = 0.9 + 0.1 * Math.sin(t * TAU * 2);
  const size = 160 * pulse;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        transform: `rotate(${rotation}deg)`,
        background: `
          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 15%, rgba(200,240,255,0.5) 35%, rgba(100,200,255,0.3) 55%, rgba(50,100,200,0.2) 75%, transparent 100%)
        `,
        borderRadius: "50%",
        boxShadow: `
          0 0 60px rgba(255,255,255,0.6),
          0 0 120px rgba(100,200,255,0.4),
          0 0 200px rgba(150,100,255,0.3),
          inset 0 0 40px rgba(255,255,255,0.3)
        `,
        willChange: "transform",
      }}
    />
  );
};

const PrismaticRay: React.FC<{ ray: Ray; frame: number; totalFrames: number }> = ({ ray, frame, totalFrames }) => {
  const t = frame / totalFrames;
  const angle = ray.angle + t * TAU * ray.speed * 0.1;
  const length = ray.length * (0.8 + 0.2 * Math.sin(t * TAU * ray.speed + ray.phase));
  const opacity = 0.3 + 0.4 * Math.sin(t * TAU * ray.speed + ray.phase);

  const x1 = 50;
  const y1 = 50;
  const x2 = 50 + Math.cos(angle) * length;
  const y2 = 50 + Math.sin(angle) * length;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x1}%`,
        top: `${y1}%`,
        width: `${Math.abs(x2 - x1)}%`,
        height: 2,
        background: `linear-gradient(90deg, ${ray.color} 0%, ${ray.color}88 50%, transparent 100%)`,
        transform: `rotate(${angle * 180 / Math.PI}deg)`,
        transformOrigin: "left center",
        opacity,
        boxShadow: `0 0 8px ${ray.color}`,
      }}
    />
  );
};

const LightParticle: React.FC<{ particle: Particle; frame: number; totalFrames: number }> = ({ particle, frame, totalFrames }) => {
  const t = frame / totalFrames;
  const angle = particle.angle + t * TAU * particle.speed;
  const dist = particle.dist * (0.8 + 0.2 * Math.sin(t * TAU * particle.speed + particle.phase));
  const x = 50 + Math.cos(angle) * dist;
  const y = 50 + Math.sin(angle) * dist;
  const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(t * TAU * particle.speed + particle.phase));

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: particle.size,
        height: particle.size,
        marginLeft: -particle.size / 2,
        marginTop: -particle.size / 2,
        borderRadius: "50%",
        backgroundColor: particle.color,
        opacity: twinkle,
        boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
      }}
    />
  );
};

const AmbientGlow: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const t = frame / totalFrames;
  const scale = 0.95 + 0.1 * Math.sin(t * TAU * 0.5);
  const rotation = t * 30;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 800,
        height: 800,
        marginLeft: -400,
        marginTop: -400,
        borderRadius: "50%",
        background: `
          radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, rgba(100,200,255,0.2) 30%, rgba(150,100,255,0.15) 50%, transparent 70%)
        `,
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        mixBlendMode: "screen",
      }}
    />
  );
};

const LensFlare: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const t = frame / totalFrames;
  const intensity = 0.3 + 0.4 * Math.sin(t * TAU * 1.5);
  const x = 35 + Math.sin(t * TAU * 0.3) * 10;
  const y = 30 + Math.cos(t * TAU * 0.2) * 8;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: 300,
        height: 300,
        marginLeft: -150,
        marginTop: -150,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(100,200,255,0.4) 30%, transparent 70%)",
        opacity: intensity,
        mixBlendMode: "screen",
        filter: "blur(20px)",
      }}
    />
  );
};

const FilmGrain: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const grain = Array.from({ length: 150 }, (_, i) => {
    const r = mulberry32(4000 + i);
    return { x: r() * 100, y: r() * 100 };
  });
  return (
    <div style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.3, pointerEvents: "none" }}>
      {grain.map((g, i) => {
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
        "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 72%, rgba(0,0,0,0.98) 100%)",
      pointerEvents: "none",
    }}
  />
);

export const EtherealCrystal: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>
      <AmbientGlow frame={frame} totalFrames={durationInFrames} />

      {RAYS.map((ray) => (
        <PrismaticRay key={ray.id} ray={ray} frame={frame} totalFrames={durationInFrames} />
      ))}

      <Crystal frame={frame} totalFrames={durationInFrames} />

      {PARTICLES.map((particle) => (
        <LightParticle key={particle.id} particle={particle} frame={frame} totalFrames={durationInFrames} />
      ))}

      <LensFlare frame={frame} totalFrames={durationInFrames} />
      <Vignette />
      <FilmGrain frame={frame} totalFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
