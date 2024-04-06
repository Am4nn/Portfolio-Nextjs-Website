"use client";
import React, { Fragment } from "react";
import Intro from "./components/Intro/Intro";
import GridBackgroudLayout from "@/components/ui/GridBackgroudLayout/GridBackgroudLayout";
import { DisplacementSphere } from "@/components/ui/DisplacementSphere/DisplacementSphere";
import MainComponent from "@/components/ui/MainComponent/MainComponent";
import { SocialSideBar } from "@/components/ui/LeftSideBar/LeftSideBar";
// import { TracingBeam } from "@/components/ui/TracingBeam/TracingBeam";

export default function Home() {
  return (
    <Fragment>
      <DisplacementSphere />
      <SocialSideBar />
      <GridBackgroudLayout>
        <MainComponent>
          <Intro />
        </MainComponent>
      </GridBackgroudLayout>
    </Fragment>
  );
}
