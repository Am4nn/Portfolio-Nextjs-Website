"use client";
import React, { Fragment } from "react";
import dynamic from 'next/dynamic';
import GridBackgroudLayout from "@/components/wrapper/GridBackgroudLayout/GridBackgroudLayout";
import MainComponent from "@/components/wrapper/MainComponent/MainComponent";
import ErrorBoundary from "@/components/wrapper/ErrorBoundary/ErrorBoundary";
import WebGLWrapper from "@/components/wrapper/WebGLWrapper/WebGLWrapper";
// import DisplacementSphere from "@/components/ui/DisplacementSphere/DisplacementSphere";
import Footer from "@/components/ui/Footer/Footer";
import Intro from "./sections/Intro/Intro";
import About from "./sections/About/About";
import ScrollDown from "@/components/ui/ScrollDown/ScrollDown";
import withThemeRerender from "@/components/hoc/withThemeRerender";

// Only render the DisplacementSphere component on the client side
const DisplacementSphere = dynamic(() => import("@/components/ui/DisplacementSphere/DisplacementSphere"), {
  ssr: false,
  loading: () => (
    <div className="pointer-events-none flex justify-center items-center">
      <p>Loading background graphics...</p>
    </div>
  ),
});

const ThemeAwareDisplacementSphere = withThemeRerender(DisplacementSphere);

const Home = () => (
  <Fragment>
    <ErrorBoundary>
      <WebGLWrapper>
        <ThemeAwareDisplacementSphere themeAware />
      </WebGLWrapper>
    </ErrorBoundary>
    <GridBackgroudLayout>
      <MainComponent>
        <Intro />
        <ScrollDown mountDelay={2000} href="#about" />
        <About />
        <Footer />
      </MainComponent>
    </GridBackgroudLayout>
  </Fragment>
);

export default Home;
