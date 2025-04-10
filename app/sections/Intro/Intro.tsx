"use client"

import { useEffect } from 'react';
import { stagger, useAnimate } from 'framer-motion';
import DecoderText from '@/components/ui/DecoderText/DecoderText';
import ScramblingText from '@/components/ui/ScramblingText/ScramblingText';
import { introAnimatedText, myName, shortDescription } from "@/utils/config";
import { gotham_medium, raleway } from '@/utils/fonts';
import { cn } from '@/utils/cn';
import "./Intro.css";
import { DECODER_TEXT_START_DELAY, INTRO_LOAD_DELAY, INTRO_LOAD_DURATION, SCRAMBLING_TEXT_DELAY } from '@/utils/timing';

function useIntroAnimation() {
  const [scope, animate] = useAnimate();
  const staggerIntroItems = stagger(0.1, { startDelay: INTRO_LOAD_DELAY });

  useEffect(() => {
    const animation = animate(
      "[data-introanimate]",
      { opacity: 1, translate: '0px 0px', scale: 1, filter: "blur(0px)" },
      { duration: INTRO_LOAD_DURATION, delay: staggerIntroItems }
    );

    return () => {
      animation.stop(); // Cleanup animation to avoid memory leaks
    };
  }, [animate, staggerIntroItems]);

  return scope;
}

export default function Intro() {
  const introRef = useIntroAnimation();

  return (
    <section id="intro" className={cn(gotham_medium.className, gotham_medium.variable, "section intro_sec h-screen flex items-center")} aria-label="Introduction Section">
      <div ref={introRef} className="intro mx-auto">

        <div data-introanimate className="pb-4 hithere font-bold font-2-4" aria-label="Greeting">
          Hi There !
        </div>

        <h1 data-introanimate className="myname font-bold font-2-4" aria-label={`I’m ${myName}`}>
          <DecoderText text={`I’m ${myName}`} eachCharClass="namechar" startDelay={DECODER_TEXT_START_DELAY} />
        </h1>

        <div data-introanimate className={raleway.className} aria-label="Short Description">
          <h2>{shortDescription}</h2>
        </div>

        <div data-introanimate className="font-medium fluidz-48 mb-5 font-2-4" aria-label="What I like">
          <ScramblingText data={introAnimatedText} delay={SCRAMBLING_TEXT_DELAY} />
        </div>

      </div>
    </section>
  );
}
