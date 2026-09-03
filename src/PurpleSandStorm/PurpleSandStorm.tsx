import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

const IS_CI = typeof process !== "undefined" && process.env.CI === "true";

const PARTICLE_BACK = IS_CI ? 600 : 1800;
const PARTICLE_MID = IS_CI ? 700 : 2200;
const PARTICLE_FRONT = IS_CI ? 300 : 1000;
const DUST_COUNT = IS_CI ? 150 : 500;
const SPARK_COUNT = IS_CI ? 100 : 300;

const COLORS = {
  deepVoid: "#0a0014",
  nightPurple: "#1a0033",
  royalPurple: "#3a0a6e",
  brightPurple: "#6a2dbf",
  highlightViolet: "#a64dff",
  royalGold: "#ffb84d",
  brightGold: "#ffd966",
  warmGold: "#ff9933",
  paleGold: "#fff2cc",
  pureWhite: "#ffffff",
};

interface Particle {
  id: number;
  x: number;
  y: number;
  z: number;
  baseSize: number;
  twinklePhase: number;
  twinkleSpeed: number;
  hue: string;
  intensity: number;
  windOffset: number;
}

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const TAU = Math.PI * 2;

const generateParticles = (
  count: number,
  seed: number,
  zMin: number,
  zMax: number,
  sizeMin: number,
  sizeMax: number
): Particle[] => {
  const rand = mulberry32(seed);
  const huePool = [
    COLORS.highlightViolet,
    COLORS.royalGold,
    COLORS.brightGold,
    COLORS.warmGold,
    COLORS.paleGold,
    COLORS.brightPurple,
  ];
  return Array.from({ length: count }, (_, i) => {
    const z = zMin + rand() * (zMax - zMin);
    const speedBucket = Math.floor(rand() * 4);
    const twinkleSpeed = [1, 2, 3, 4][speedBucket];
    return {
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      z,
      baseSize: sizeMin + rand() * (sizeMax - sizeMin),
      twinklePhase: rand(),
      twinkleSpeed,
      hue: huePool[Math.floor(rand() * huePool.length)],
      intensity: 0.4 + rand() * 0.6,
      windOffset: rand(),
    };
  });
};

const BACK = generateParticles(PARTICLE_BACK, 100, 0, 0.33, 0.5, 1.4);
const MID = generateParticles(PARTICLE_MID, 200, 0.33, 0.66, 1.0, 2.8);
const FRONT = generateParticles(PARTICLE_FRONT, 300, 0.66, 1, 2.0, 6.0);
const DUST = generateParticles(DUST_COUNT, 400, 0, 1, 8, 24);

const SPARKS = Array.from({ length: SPARK_COUNT }, (_, i) => {
  const r = mulberry32(600 + i);
  return {
    id: i,
    x: r() * 100,
    y: r() * 100,
    baseSize: 0.8 + r() * 1.8,
    phase: r(),
    speed: [2, 3, 4, 5][Math.floor(r() * 4)],
    isGold: r() > 0.4,
  };
});

const Camera: React.FC<{
  frame: number;
  totalFrames: number;
  width: number;
  height: number;
  children: React.ReactNode;
}> = ({ frame, totalFrames, width, height, children }) => {
  const t = frame / totalFrames;
  const panX = Math.sin(t * TAU * 1) * width * 0.04;
  const panY = Math.cos(t * TAU * 1) * height * 0.025;
  const tilt = Math.sin(t * TAU * 1) * 0.4;
  const breath = 1 + Math.sin(t * TAU * 1) * 0.005;
  const shakeX = Math.sin(t * TAU * 7 + 99) * 1.4;
  const shakeY = Math.sin(t * TAU * 7 + 199) * 1.4;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translate(${panX + shakeX}px, ${panY + shakeY}px) rotate(${tilt}deg) scale(${breath})`,
        transformOrigin: "center center",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
};

const GodRays: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const t = frame / totalFrames;
  const breath = 0.95 + 0.1 * Math.sin(t * TAU * 1);
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "20%",
          width: "60%",
          height: "120%",
          background:
            "linear-gradient(180deg, rgba(166, 77, 255, 0.32) 0%, rgba(106, 45, 191, 0.15) 30%, transparent 70%)",
          transform: `rotate(15deg) scale(${breath})`,
          transformOrigin: "top center",
          mixBlendMode: "screen",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "55%",
          width: "35%",
          height: "100%",
          background:
            "linear-gradient(180deg, rgba(255, 184, 77, 0.28) 0%, transparent 60%)",
          transform: `rotate(-8deg) scale(${breath})`,
          transformOrigin: "top center",
          mixBlendMode: "screen",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

const SkyGradient: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 20%, rgba(106, 45, 191, 0.7) 0%, rgba(58, 10, 110, 0.95) 40%, #0a0014 80%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, transparent 0%, rgba(26, 0, 51, 0.4) 50%, rgba(10, 0, 20, 0.85) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "45%",
        background:
          "radial-gradient(ellipse at 50% 100%, rgba(255, 184, 77, 0.28) 0%, rgba(255, 153, 51, 0.12) 30%, transparent 70%)",
        mixBlendMode: "screen",
      }}
    />
  </>
);

const ParticleLayer: React.FC<{
  particles: Particle[];
  frame: number;
  totalFrames: number;
  width: number;
  height: number;
  blurAmount: number;
  parallaxStrength: number;
  trail: boolean;
}> = ({ particles, frame, totalFrames, width, height, blurAmount, parallaxStrength, trail }) => {
  const t = frame / totalFrames;
  const windScale = 1 / parallaxStrength;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
      }}
    >
      {particles.map((p) => {
        const windN1 = 2 + Math.floor(p.windOffset * 3);
        const windN2 = 3 + Math.floor(p.windOffset * 4);
        const wx =
          p.x * width +
          Math.sin(t * TAU * windN1 + p.windOffset * TAU) * width * 0.4 +
          Math.cos(t * TAU * 2 + p.windOffset * 11) * width * 0.2;
        const wy =
          p.y * height +
          Math.cos(t * TAU * windN2 + p.windOffset * TAU) * height * 0.3 +
          Math.sin(t * TAU * 2 + p.windOffset * 13) * height * 0.15;
        const driftX = Math.sin(t * TAU * 1 + p.windOffset * TAU) * width * 0.05;
        const driftY = Math.cos(t * TAU * 1 + p.windOffset * TAU) * height * 0.03;
        const twinkle =
          0.3 +
          0.7 *
            (Math.sin(t * TAU * p.twinkleSpeed + p.twinklePhase * TAU) * 0.5 +
              0.5);
        const size = p.baseSize * p.z * windScale * 2.5;
        const px = ((wx + driftX) % (width + 200)) - 100;
        const py = ((wy + driftY) % (height + 200)) - 100;

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: p.hue,
              opacity: p.intensity * twinkle,
              boxShadow: trail
                ? `0 0 ${size * 2}px ${p.hue}, 0 0 ${size * 4}px ${p.hue}, ${size}px 0 ${size * 1.2}px ${p.hue}88, ${size * 2}px 0 ${size * 0.8}px ${p.hue}44`
                : `0 0 ${size * 2.5}px ${p.hue}, 0 0 ${size * 5}px ${p.hue}`,
              mixBlendMode: "screen",
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </div>
  );
};

const Sparks: React.FC<{ frame: number; totalFrames: number; width: number; height: number }> = ({
  frame,
  totalFrames,
  width,
  height,
}) => {
  const t = frame / totalFrames;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "screen" }}>
      {SPARKS.map((sp) => {
        const phase = (t * sp.speed + sp.phase) % 1;
        const twinkle = Math.pow(Math.sin(phase * Math.PI), 8);
        const cx =
          (sp.x / 100) * width + Math.sin(t * TAU * 3 + sp.y * 0.01) * 80;
        const cy =
          (sp.y / 100) * height + Math.cos(t * TAU * 3 + sp.x * 0.01) * 60;
        const color = sp.isGold ? COLORS.brightGold : COLORS.paleGold;
        return (
          <div
            key={sp.id}
            style={{
              position: "absolute",
              left: cx,
              top: cy,
              width: sp.baseSize,
              height: sp.baseSize,
              borderRadius: "50%",
              backgroundColor: COLORS.pureWhite,
              opacity: twinkle * 0.9,
              boxShadow: `0 0 ${sp.baseSize * 8}px ${COLORS.pureWhite}, 0 0 ${sp.baseSize * 20}px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
};

const Haze: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const t = frame / totalFrames;
  const breath = 0.9 + 0.15 * Math.sin(t * TAU * 1);
  const driftX = Math.sin(t * TAU * 1) * 100;
  return (
    <div
      style={{
        position: "absolute",
        top: "30%",
        left: "10%",
        width: "80%",
        height: "50%",
        background:
          "radial-gradient(ellipse at center, rgba(255, 184, 77, 0.18) 0%, rgba(166, 77, 255, 0.12) 40%, transparent 70%)",
        transform: `scale(${breath}) translateX(${driftX}px)`,
        mixBlendMode: "screen",
        filter: "blur(60px)",
        pointerEvents: "none",
      }}
    />
  );
};

const FilmGrain: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const grain = useMemo(
    () =>
      Array.from({ length: 300 }, (_, i) => {
        const r = mulberry32(800 + i);
        return { x: r() * 100, y: r() * 100 };
      }),
    []
  );
  return (
    <div style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.45, pointerEvents: "none" }}>
      {grain.map((g, i) => {
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
        "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.6) 75%, rgba(0,0,0,0.98) 100%)",
      pointerEvents: "none",
    }}
  />
);

const ChromaticAberration: React.FC<{ frame: number; totalFrames: number }> = ({
  frame,
  totalFrames,
}) => {
  const t = frame / totalFrames;
  const shift = 0.5 + 0.5 * Math.sin(t * TAU * 1);
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(255,184,77,0.06) 0%, transparent 50%, rgba(166,77,255,0.06) 100%)",
          mixBlendMode: "screen",
          opacity: shift,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
          mixBlendMode: "screen",
          opacity: shift,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export const PurpleSandStorm: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0014", overflow: "hidden" }}>
      <SkyGradient />

      <Camera frame={frame} totalFrames={durationInFrames} width={width} height={height}>
        <GodRays frame={frame} totalFrames={durationInFrames} />
        <Haze frame={frame} totalFrames={durationInFrames} />

        <ParticleLayer
          particles={BACK}
          frame={frame}
          totalFrames={durationInFrames}
          width={width}
          height={height}
          blurAmount={2.5}
          parallaxStrength={0.35}
          trail={false}
        />

        <ParticleLayer
          particles={MID}
          frame={frame}
          totalFrames={durationInFrames}
          width={width}
          height={height}
          blurAmount={0.6}
          parallaxStrength={0.65}
          trail={true}
        />

        <ParticleLayer
          particles={FRONT}
          frame={frame}
          totalFrames={durationInFrames}
          width={width}
          height={height}
          blurAmount={0}
          parallaxStrength={1}
          trail={true}
        />

        <ParticleLayer
          particles={DUST}
          frame={frame}
          totalFrames={durationInFrames}
          width={width}
          height={height}
          blurAmount={5}
          parallaxStrength={0.25}
          trail={false}
        />

        <Sparks frame={frame} totalFrames={durationInFrames} width={width} height={height} />
      </Camera>

      <ChromaticAberration frame={frame} totalFrames={durationInFrames} />
      <Vignette />
      <FilmGrain frame={frame} totalFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
