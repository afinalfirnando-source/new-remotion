import React from "react";
import { Composition } from "remotion";
import { LaserShow } from "./LaserShow/LaserShow";

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
    </>
  );
};
