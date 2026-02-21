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
import { useAgent } from "@/lib/agent";
import Intro from "./sections/Intro/Intro";
import About from "./sections/About/About";

// Only render the DisplacementSphere component on the client side
const DisplacementSphere = dynamic(() => import("@/components/ui/DisplacementSphere/DisplacementSphere"), {
  ssr: false,
});

const ThemeAwareDisplacementSphere = withThemeRerender(DisplacementSphere);

const Home = () => {
  const { state } = useAgent();

  const sectionRenderMap: Record<string, React.ReactNode> = {
    intro: (
      <Fragment key="intro">
        <Intro />
        <ScrollDown mountDelay={SCROLL_DOWN_LOAD_DELAY} href="#about" />
      </Fragment>
    ),
    about: <About key="about" />,
    footer: <Footer key="footer" />,
  };

  const orderedSectionKeys = state.sectionOrder;

  const visibleSectionSet = new Set(state.visibleSections);

  return (
    <Fragment>
      <ErrorBoundary>
        <WebGLWrapper>
          <ThemeAwareDisplacementSphere themeAware />
        </WebGLWrapper>
      </ErrorBoundary>
      <GridBackgroudLayout>
        <MainComponent>
          {orderedSectionKeys
            .filter(sectionId => visibleSectionSet.has(sectionId))
            .map(sectionId => sectionRenderMap[sectionId])}
        </MainComponent>
      </GridBackgroudLayout>
    </Fragment>
  );
};

export default Home;
