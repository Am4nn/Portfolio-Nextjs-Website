"use client";
import React, { Fragment } from "react";
import dynamic from 'next/dynamic';
import GridBackgroudLayout from "@/components/wrapper/GridBackgroudLayout/GridBackgroudLayout";
import MainComponent from "@/components/wrapper/MainComponent/MainComponent";
import ErrorBoundary from "@/components/wrapper/ErrorBoundary/ErrorBoundary";
import WebGLWrapper from "@/components/wrapper/WebGLWrapper/WebGLWrapper";
import Footer from "@/components/ui/Footer/Footer";
import ScrollDown from "@/components/ui/ScrollDown/ScrollDown";
import withThemeRerender from "@/components/hoc/withThemeRerender";
import { SCROLL_DOWN_LOAD_DELAY } from "@/utils/timing";
import Intro from "./sections/Intro/Intro";
import About from "./sections/About/About";

// Only render the DisplacementSphere component on the client side
const DisplacementSphere = dynamic(() => import("@/components/ui/DisplacementSphere/DisplacementSphere"), {
  ssr: false,
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
        <ScrollDown mountDelay={SCROLL_DOWN_LOAD_DELAY} href="#about" />
        <About />
        <Footer />
      </MainComponent>
    </GridBackgroudLayout>
  </Fragment>
);

export default Home;
