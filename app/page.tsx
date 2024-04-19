"use client";
import React, { Fragment } from "react";
// import dynamic from 'next/dynamic';
import GridBackgroudLayout from "@/components/wrapper/GridBackgroudLayout/GridBackgroudLayout";
import MainComponent from "@/components/wrapper/MainComponent/MainComponent";
import ErrorBoundary from "@/components/wrapper/ErrorBoundary/ErrorBoundary";
import WebGLWrapper from "@/components/wrapper/WebGLWrapper/WebGLWrapper";
import ScrollIndicator from "@/components/ui/ScrollIndicator/ScrollIndicator";
import DisplacementSphere from "@/components/ui/DisplacementSphere/DisplacementSphere";
import Footer from "@/components/ui/Footer/Footer";
import Intro from "./sections/Intro/Intro";
import About from "./sections/About/About";

// Only render the DisplacementSphere component on the client side
// const DisplacementSphere = dynamic(() => import("@/components/ui/DisplacementSphere/DisplacementSphere"), { ssr: false });

export default function Home() {
  return (
    <Fragment>
      <ErrorBoundary>
        <WebGLWrapper>
          <DisplacementSphere />
        </WebGLWrapper>
      </ErrorBoundary>
      <GridBackgroudLayout>
        <MainComponent>
          <Intro />
          <ScrollIndicator mountDelay={2000} href="#about" />
          <About />
          <Footer />
        </MainComponent>
      </GridBackgroudLayout>
    </Fragment>
  );
}
