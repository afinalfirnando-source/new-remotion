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

const STREAM_COUNT = 4;
const PARTICLE_COUNT = 300;
const BUBBLE_COUNT = 40;

interface Stream {
  id: number;
  x: number;
  width: number;
  speed: number;
  phase: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  color: string;
}

interface Bubble {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
}

const STREAMS: Stream[] = Array.from({ length: STREAM_COUNT }, (_, i) => {
  const r = mulberry32(1000 + i);
  const colors = ["#FFD700", "#FFA500", "#FF8C00", "#FFD700"];
  return {
    id: i,
    x: 30 + r() * 40,
    width: 20 + r() * 30,
    speed: 0.3 + r() * 0.4,
    phase: r() * TAU,
    color: colors[i % colors.length],
  };
});

const PARTICLES: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const r = mulberry32(2000 + i);
  const colors = ["#FFD700", "#FFA500", "#FF8C00", "#FFF8DC"];
  return {
    x: r() * 100,
    y: r() * 100,
    size: 2 + r() * 6,
    speed: 0.2 + r() * 0.5,
    phase: r() * TAU,
    color: colors[Math.floor(r() * colors.length)],
  };
});

const BUBBLES: Bubble[] = Array.from({ length: BUBBLE_COUNT }, (_, i) => {
  const r = mulberry32(3000 + i);
  return {
    x: r() * 100,
    y: r() * 100,
    size: 4 + r() * 12,
    speed: 0.1 + r() * 0.2,
    phase: r() * TAU,
  };
});

const GoldStream: React.FC<{ stream: Stream; frame: number; totalFrames: number }> = ({ stream, frame, totalFrames }) => {
  const t = frame / totalFrames;
  const wave = Math.sin(t * TAU * stream.speed + stream.phase) * 10;
  return (
    <div
      style={{
        position: "absolute",
        left: `${stream.x}%`,
        top: 0,
        width: stream.width,
        height: "100%",
        background: `linear-gradient(180deg, ${stream.color} 0%, ${stream.color}88 30%, ${stream.color}44 70%, transparent 100%)`,
        transform: `translateX(${wave}px)`,
        opacity: 0.7,
        mixBlendMode: "screen",
        filter: "blur(8px)",
      }}
    />
  );
};

const GoldParticle: React.FC<{ particle: Particle; frame: number; totalFrames: number }> = ({ particle, frame, totalFrames }) => {
  const t = frame / totalFrames;
  const y = ((particle.y - t * particle.speed * 150) % 120) - 10;
  const x = particle.x + Math.sin(t * TAU * 2 + particle.phase) * 8;
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: particle.size,
        height: particle.size,
        borderRadius: "50%",
        backgroundColor: particle.color,
        opacity: 0.7,
        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
      }}
    />
  );
};

const Bubble: React.FC<{ bubble: Bubble; frame: number; totalFrames: number }> = ({ bubble, frame, totalFrames }) => {
  const t = frame / totalFrames;
  const y = ((bubble.y - t * bubble.speed * 80) % 120) - 10;
  const wobble = Math.sin(t * TAU * 3 + bubble.phase) * 3;
  return (
    <div
      style={{
        position: "absolute",
        left: `${bubble.x + wobble}%`,
        top: `${y}%`,
        width: bubble.size,
        height: bubble.size,
        borderRadius: "50%",
        border: `1px solid rgba(255,215,0,0.5)`,
        background: "rgba(255,215,0,0.1)",
        opacity: 0.6,
      }}
    />
  );
};

const Splash: React.FC = () => {
  const drops = Array.from({ length: 30 }, (_, i) => {
    const r = mulberry32(5000 + i);
    return { x: r() * 100, y: 85 + r() * 10, size: 2 + r() * 4, phase: r() * TAU };
  });
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "20%" }}>
      {drops.map((drop, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${drop.x}%`,
            bottom: `${drop.y}%`,
            width: drop.size,
            height: drop.size,
            borderRadius: "50%",
            backgroundColor: "#FFD700",
            opacity: 0.5,
            boxShadow: `0 0 ${drop.size * 2}px #FFD700`,
          }}
        />
      ))}
    </div>
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

export const LiquidGoldPour: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const globalPulse = 0.95 + 0.05 * Math.sin(t * TAU * 3);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 100%, rgba(255,215,0,0.3) 0%, transparent 60%)",
          transform: `scale(${globalPulse})`,
        }}
      />

      {STREAMS.map((stream) => (
        <GoldStream key={stream.id} stream={stream} frame={frame} totalFrames={durationInFrames} />
      ))}

      {PARTICLES.map((particle, i) => (
        <GoldParticle key={i} particle={particle} frame={frame} totalFrames={durationInFrames} />
      ))}

      {BUBBLES.map((bubble, i) => (
        <Bubble key={i} bubble={bubble} frame={frame} totalFrames={durationInFrames} />
      ))}

      <Splash />
      <FilmGrain frame={frame} totalFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
