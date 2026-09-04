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

const SIDES = 8;
const RING_COUNT = 8;
const PARTICLE_COUNT = 120;

interface Ring {
  radius: number;
  speed: number;
  phase: number;
  width: number;
}

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  phase: number;
  size: number;
  color: string;
}

const RINGS: Ring[] = Array.from({ length: RING_COUNT }, (_, i) => {
  const r = mulberry32(1000 + i);
  return {
    radius: 20 + i * 12,
    speed: 0.5 + r() * 1,
    phase: r() * TAU,
    width: 1 + r() * 2,
  };
});

const PARTICLES: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const r = mulberry32(2000 + i);
  const colors = ["#a855f7", "#3b82f6", "#ec4899", "#ffffff"];
  return {
    angle: r() * TAU,
    radius: 30 + r() * 50,
    speed: 0.3 + r() * 0.8,
    phase: r() * TAU,
    size: 2 + r() * 4,
    color: colors[Math.floor(r() * colors.length)],
  };
});

const getPolygonPoints = (sides: number, radius: number, rotation: number) => {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * TAU + rotation;
    points.push({
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
    });
  }
  return points;
};

const Polygon: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const t = frame / totalFrames;
  const rotation = t * TAU * 0.5;
  const pulse = 0.8 + 0.2 * Math.sin(t * TAU * 2);
  const radius = 20 * pulse;

  const points = getPolygonPoints(SIDES, radius, rotation);
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`).join(' ') + ' Z';

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <path d={pathD} fill="none" stroke="rgba(168,85,247,0.8)" strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#a855f7">
          <animate attributeName="opacity" values="0.5;1;0.5" dur={`${1 + i * 0.1}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
};

const Ring: React.FC<{ ring: Ring; frame: number; totalFrames: number }> = ({ ring, frame, totalFrames }) => {
  const t = frame / totalFrames;
  const pulse = 0.7 + 0.3 * Math.sin(t * TAU * ring.speed + ring.phase);
  const radius = ring.radius * pulse;
  const rotation = t * TAU * ring.speed * 0.3;
  const points = getPolygonPoints(SIDES, radius, rotation);
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`).join(' ') + ' Z';

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }}>
      <path d={pathD} fill="none" stroke={`rgba(59,130,246,${0.3 + pulse * 0.4})`} strokeWidth={ring.width} />
    </svg>
  );
};

const Particle: React.FC<{ particle: Particle; frame: number; totalFrames: number }> = ({ particle, frame, totalFrames }) => {
  const t = frame / totalFrames;
  const angle = particle.angle + t * TAU * particle.speed;
  const pulse = 0.5 + 0.5 * Math.sin(t * TAU * 2 + particle.phase);
  const x = 50 + Math.cos(angle) * particle.radius;
  const y = 50 + Math.sin(angle) * particle.radius;
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
        opacity: pulse * 0.8,
        boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
      }}
    />
  );
};

const ConnectionLine: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const t = frame / totalFrames;
  const rotation = t * TAU * 0.2;
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.3 }}>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * TAU + rotation;
        const x1 = 50 + Math.cos(angle) * 20;
        const y1 = 50 + Math.sin(angle) * 20;
        const x2 = 50 + Math.cos(angle) * 60;
        const y2 = 50 + Math.sin(angle) * 60;
        return (
          <line key={i} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="rgba(236,72,153,0.5)" strokeWidth="1" />
        );
      })}
    </svg>
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

export const GeometricPulse: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const globalPulse = 0.95 + 0.05 * Math.sin(t * TAU * 3);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0014", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 50%, rgba(168,85,247,0.2) 0%, transparent 60%)",
          transform: `scale(${globalPulse})`,
        }}
      />

      <ConnectionLine frame={frame} totalFrames={durationInFrames} />
      <Polygon frame={frame} totalFrames={durationInFrames} />

      {RINGS.map((ring, i) => (
        <Ring key={i} ring={ring} frame={frame} totalFrames={durationInFrames} />
      ))}

      {PARTICLES.map((particle, i) => (
        <Particle key={i} particle={particle} frame={frame} totalFrames={durationInFrames} />
      ))}

      <FilmGrain frame={frame} totalFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
