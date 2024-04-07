"use client";
import React, { Fragment } from "react";
import Intro from "./components/Intro/Intro";
import GridBackgroudLayout from "@/components/ui/GridBackgroudLayout/GridBackgroudLayout";
import { DisplacementSphere } from "@/components/ui/DisplacementSphere/DisplacementSphere";
import MainComponent from "@/components/ui/MainComponent/MainComponent";
import { SocialSideBar } from "@/components/ui/LeftSideBar/LeftSideBar";
import ScrollIndicator from "@/components/ui/ScrollIndicator/ScrollIndicator";
import About from "./components/About/About";

export default function Home() {
  return (
    <Fragment>
      <DisplacementSphere />
      <SocialSideBar />
      <GridBackgroudLayout>
        <MainComponent>
          <Intro />
          <ScrollIndicator mountDelay={2000} href="#about" />
          <About />
        </MainComponent>
      </GridBackgroudLayout>
    </Fragment>
  );
}
