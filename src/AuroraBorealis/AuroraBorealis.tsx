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

const AURORA_LAYERS = 5;
const STAR_COUNT = 200;
const ICE_COUNT = 100;

interface AuroraLayer {
  id: number;
  y: number;
  height: number;
  color: string;
  speed: number;
  phase: number;
  amplitude: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
}

interface IceParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
}

const AURORA_LAYERS_LIST: AuroraLayer[] = Array.from({ length: AURORA_LAYERS }, (_, i) => {
  const r = mulberry32(1000 + i);
  const colors = ["#00ff87", "#bd00ff", "#00b4ff", "#00ff87", "#bd00ff"];
  return {
    id: i,
    y: 15 + r() * 40,
    height: 20 + r() * 25,
    color: colors[i % colors.length],
    speed: 0.3 + r() * 0.5,
    phase: r() * TAU,
    amplitude: 15 + r() * 20,
  };
});

const STARS: Star[] = Array.from({ length: STAR_COUNT }, (_, i) => {
  const r = mulberry32(2000 + i);
  return {
    x: r() * 100,
    y: r() * 100,
    size: 0.5 + r() * 1.5,
    phase: r() * TAU,
    speed: 0.5 + r() * 2,
  };
});

const ICE_PARTICLES: IceParticle[] = Array.from({ length: ICE_COUNT }, (_, i) => {
  const r = mulberry32(3000 + i);
  return {
    x: r() * 100,
    y: r() * 100,
    size: 1 + r() * 3,
    speed: 0.1 + r() * 0.3,
    phase: r() * TAU,
  };
});

const AuroraWave: React.FC<{ layer: AuroraLayer; frame: number; totalFrames: number; width: number }> = ({
  layer,
  frame,
  totalFrames,
  width,
}) => {
  const t = frame / totalFrames;
  const waveOffset = Math.sin(t * TAU * layer.speed + layer.phase) * layer.amplitude;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: `${layer.y}%`,
        height: `${layer.height}%`,
        background: `linear-gradient(180deg, transparent 0%, ${layer.color}22 20%, ${layer.color}66 50%, ${layer.color}22 80%, transparent 100%)`,
        transform: `translateY(${waveOffset}px)`,
        opacity: 0.6,
        mixBlendMode: "screen",
        filter: "blur(20px)",
      }}
    />
  );
};

const Star: React.FC<{ star: Star; frame: number; totalFrames: number }> = ({ star, frame, totalFrames }) => {
  const t = frame / totalFrames;
  const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(t * TAU * star.speed + star.phase));
  return (
    <div
      style={{
        position: "absolute",
        left: `${star.x}%`,
        top: `${star.y}%`,
        width: star.size,
        height: star.size,
        borderRadius: "50%",
        backgroundColor: "#ffffff",
        opacity: twinkle,
        boxShadow: `0 0 ${star.size * 3}px #ffffff`,
      }}
    />
  );
};

const IceParticle: React.FC<{ particle: IceParticle; frame: number; totalFrames: number }> = ({
  particle,
  frame,
  totalFrames,
}) => {
  const t = frame / totalFrames;
  const y = ((particle.y + t * particle.speed * 100) % 120) - 10;
  const drift = Math.sin(t * TAU * 2 + particle.phase) * 5;
  return (
    <div
      style={{
        position: "absolute",
        left: `${particle.x + drift}%`,
        top: `${y}%`,
        width: particle.size,
        height: particle.size,
        borderRadius: "50%",
        backgroundColor: "#ffffff",
        opacity: 0.6,
        boxShadow: `0 0 ${particle.size * 2}px #ffffff`,
      }}
    />
  );
};

const Moon: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: "8%",
      right: "15%",
      width: 80,
      height: 80,
      borderRadius: "50%",
      background: "radial-gradient(circle, #ffffff 0%, #f0f0ff 40%, transparent 70%)",
      boxShadow: "0 0 60px rgba(255,255,255,0.4), 0 0 120px rgba(200,200,255,0.2)",
    }}
  />
);

const FilmGrain: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const grain = Array.from({ length: 150 }, (_, i) => {
    const r = mulberry32(4000 + i);
    return { x: r() * 100, y: r() * 100 };
  });
  return (
    <div style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.25, pointerEvents: "none" }}>
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

export const AuroraBorealis: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000510", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, #000510 0%, #001030 50%, #000510 100%)",
        }}
      />

      <Moon />

      {STARS.map((star) => (
        <Star key={star.x + star.y} star={star} frame={frame} totalFrames={durationInFrames} />
      ))}

      {AURORA_LAYERS_LIST.map((layer) => (
        <AuroraWave key={layer.id} layer={layer} frame={frame} totalFrames={durationInFrames} width={width} />
      ))}

      {ICE_PARTICLES.map((particle) => (
        <IceParticle key={particle.x + particle.y} particle={particle} frame={frame} totalFrames={durationInFrames} />
      ))}

      <FilmGrain frame={frame} totalFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
