import React from "react";
import { Composition } from "remotion";
import { LaserShow } from "./LaserShow/LaserShow";
import { PurpleSandStorm } from "./PurpleSandStorm/PurpleSandStorm";
import { LiquidChrome } from "./LiquidChrome/LiquidChrome";
import { GoldGrid } from "./GoldGrid/GoldGrid";
import { GoldGridTight } from "./GoldGridTight/GoldGridTight";
import { NeonCircuitBoard } from "./NeonCircuitBoard/NeonCircuitBoard";
import { AuroraBorealis } from "./AuroraBorealis/AuroraBorealis";
import { LiquidGoldPour } from "./LiquidGoldPour/LiquidGoldPour";
import { GeometricPulse } from "./GeometricPulse/GeometricPulse";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="LaserShow" component={LaserShow} durationInFrames={900} fps={60} width={3840} height={2160} />
      <Composition id="LaserShow-1080" component={LaserShow} durationInFrames={900} fps={60} width={1920} height={1080} />
      <Composition id="PurpleSandStorm" component={PurpleSandStorm} durationInFrames={1200} fps={60} width={3840} height={2160} />
      <Composition id="PurpleSandStorm-1080" component={PurpleSandStorm} durationInFrames={1200} fps={60} width={1920} height={1080} />
      <Composition id="LiquidChrome" component={LiquidChrome} durationInFrames={960} fps={60} width={3840} height={2160} />
      <Composition id="LiquidChrome-1080" component={LiquidChrome} durationInFrames={960} fps={60} width={1920} height={1080} />
      <Composition id="GoldGrid" component={GoldGrid} durationInFrames={960} fps={60} width={3840} height={2160} />
      <Composition id="GoldGrid-1080" component={GoldGrid} durationInFrames={960} fps={60} width={1920} height={1080} />
      <Composition id="GoldGridTight" component={GoldGridTight} durationInFrames={960} fps={60} width={3840} height={2160} />
      <Composition id="GoldGridTight-1080" component={GoldGridTight} durationInFrames={960} fps={60} width={1920} height={1080} />
      <Composition id="NeonCircuitBoard" component={NeonCircuitBoard} durationInFrames={720} fps={60} width={3840} height={2160} />
      <Composition id="NeonCircuitBoard-1080" component={NeonCircuitBoard} durationInFrames={720} fps={60} width={1920} height={1080} />
      <Composition id="AuroraBorealis" component={AuroraBorealis} durationInFrames={1200} fps={60} width={3840} height={2160} />
      <Composition id="AuroraBorealis-1080" component={AuroraBorealis} durationInFrames={1200} fps={60} width={1920} height={1080} />
      <Composition id="LiquidGoldPour" component={LiquidGoldPour} durationInFrames={600} fps={60} width={3840} height={2160} />
      <Composition id="LiquidGoldPour-1080" component={LiquidGoldPour} durationInFrames={600} fps={60} width={1920} height={1080} />
      <Composition id="GeometricPulse" component={GeometricPulse} durationInFrames={900} fps={60} width={3840} height={2160} />
      <Composition id="GeometricPulse-1080" component={GeometricPulse} durationInFrames={900} fps={60} width={1920} height={1080} />
    </>
  );
};
