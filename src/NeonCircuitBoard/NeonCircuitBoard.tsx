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

const PATH_COUNT = 12;
const NODE_COUNT = 24;
const PACKET_COUNT = 60;

interface Path {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  speed: number;
  phase: number;
}

interface Node {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
}

interface Packet {
  id: number;
  pathId: number;
  t: number;
  speed: number;
  size: number;
  color: string;
}

const PATHS: Path[] = Array.from({ length: PATH_COUNT }, (_, i) => {
  const r = mulberry32(1000 + i);
  const colors = ["#00fff0", "#ff00ff", "#00ff41", "#00b4ff"];
  const horizontal = i % 2 === 0;
  const pos = r();
  return {
    id: i,
    x1: horizontal ? 10 + r() * 30 : pos * 80,
    y1: horizontal ? pos * 80 : 10 + r() * 30,
    x2: horizontal ? 60 + r() * 30 : pos * 80,
    y2: horizontal ? pos * 80 : 60 + r() * 30,
    color: colors[i % colors.length],
    width: 1 + r() * 2,
    speed: 1 + r() * 2,
    phase: r() * TAU,
  };
});

const NODES: Node[] = Array.from({ length: NODE_COUNT }, (_, i) => {
  const r = mulberry32(2000 + i);
  return {
    id: i,
    x: 10 + r() * 80,
    y: 10 + r() * 80,
    size: 3 + r() * 5,
    speed: 1 + r() * 3,
    phase: r() * TAU,
  };
});

const PACKETS: Packet[] = Array.from({ length: PACKET_COUNT }, (_, i) => {
  const r = mulberry32(3000 + i);
  const colors = ["#00fff0", "#ff00ff", "#00ff41", "#ffffff"];
  return {
    id: i,
    pathId: Math.floor(r() * PATH_COUNT),
    t: r(),
    speed: 0.5 + r() * 1.5,
    size: 2 + r() * 3,
    color: colors[Math.floor(r() * colors.length)],
  };
});

const CircuitPath: React.FC<{ path: Path; frame: number; totalFrames: number }> = ({ path, frame, totalFrames }) => {
  const t = frame / totalFrames;
  const pulse = 0.5 + 0.5 * Math.sin(t * TAU * path.speed + path.phase);
  return (
    <div
      style={{
        position: "absolute",
        left: `${path.x1}%`,
        top: `${path.y1}%`,
        width: `${Math.abs(path.x2 - path.x1)}%`,
        height: `${Math.abs(path.y2 - path.y1)}%`,
        background: `linear-gradient(90deg, ${path.color}88, ${path.color})`,
        opacity: 0.3 + pulse * 0.5,
        boxShadow: `0 0 ${path.width * 2}px ${path.color}`,
        transform: `rotate(${Math.atan2(path.y2 - path.y1, path.x2 - path.x1) * 180 / Math.PI}deg)`,
        transformOrigin: "left center",
      }}
    />
  );
};

const CircuitNode: React.FC<{ node: Node; frame: number; totalFrames: number }> = ({ node, frame, totalFrames }) => {
  const t = frame / totalFrames;
  const pulse = 0.4 + 0.6 * Math.sin(t * TAU * node.speed + node.phase);
  const color = pulse > 0.7 ? "#ffffff" : "#00fff0";
  return (
    <div
      style={{
        position: "absolute",
        left: `${node.x}%`,
        top: `${node.y}%`,
        width: node.size,
        height: node.size,
        marginLeft: -node.size / 2,
        marginTop: -node.size / 2,
        borderRadius: "50%",
        backgroundColor: color,
        opacity: pulse,
        boxShadow: `0 0 ${node.size * 3}px ${color}`,
      }}
    />
  );
};

const DataPacket: React.FC<{ packet: Packet; frame: number; totalFrames: number }> = ({ packet, frame, totalFrames }) => {
  const t = frame / totalFrames;
  const progress = ((t * packet.speed + packet.t) % 1);
  const path = PATHS[packet.pathId];
  if (!path) return null;
  const x = path.x1 + (path.x2 - path.x1) * progress;
  const y = path.y1 + (path.y2 - path.y1) * progress;
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: packet.size,
        height: packet.size,
        marginLeft: -packet.size / 2,
        marginTop: -packet.size / 2,
        borderRadius: "50%",
        backgroundColor: packet.color,
        opacity: 0.9,
        boxShadow: `0 0 ${packet.size * 4}px ${packet.color}`,
      }}
    />
  );
};

const Scanlines: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
      pointerEvents: "none",
    }}
  />
);

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

export const NeonCircuitBoard: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const globalPulse = 0.9 + 0.1 * Math.sin(t * TAU * 2);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,255,240,0.1) 0%, transparent 60%)",
          transform: `scale(${globalPulse})`,
        }}
      />

      {PATHS.map((path) => (
        <CircuitPath key={path.id} path={path} frame={frame} totalFrames={durationInFrames} />
      ))}

      {NODES.map((node) => (
        <CircuitNode key={node.id} node={node} frame={frame} totalFrames={durationInFrames} />
      ))}

      {PACKETS.map((packet) => (
        <DataPacket key={packet.id} packet={packet} frame={frame} totalFrames={durationInFrames} />
      ))}

      <Scanlines />
      <FilmGrain frame={frame} totalFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
