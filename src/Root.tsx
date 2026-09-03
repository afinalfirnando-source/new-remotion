import React from "react";
import { Composition } from "remotion";
import { LaserShow } from "./LaserShow/LaserShow";
import { PurpleSandStorm } from "./PurpleSandStorm/PurpleSandStorm";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LaserShow"
        component={LaserShow}
        durationInFrames={900}
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="LaserShow-1080"
        component={LaserShow}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="PurpleSandStorm"
        component={PurpleSandStorm}
        durationInFrames={1200}
        fps={60}
        width={3840}
        height={2160}
      />
      <Composition
        id="PurpleSandStorm-1080"
        component={PurpleSandStorm}
        durationInFrames={1200}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
