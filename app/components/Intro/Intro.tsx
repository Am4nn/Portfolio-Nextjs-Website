"use client"

import { useEffect } from 'react';
import { stagger, useAnimate } from 'framer-motion';
import DecoderText from '@/components/ui/DecoderText/DecoderText';
import ScramblingText from '@/components/ui/ScramblingText/ScramblingText';
import { introAnimatedText, myName, shortDescription } from "@/utils/config";
import { gotham_medium, raleway } from '@/utils/fonts';
import { cn } from '@/utils/cn';
import "./Intro.css";

const introMountDelay = 1; // in seconds
const decoderTextStartDelay = 1000 + 100; // in milliseconds

function useIntroAnimation() {
  const [scope, animate] = useAnimate();
  const staggerIntroItems = stagger(0.1, { startDelay: introMountDelay });

  useEffect(() => {
    animate(
      "[data-introanimate]",
      { opacity: 1, translate: '0px 0px', scale: 1, filter: "blur(0px)" },
      { duration: 0.3, delay: staggerIntroItems }
    );

  }, [animate, staggerIntroItems]);

  return scope;
}

export default function Intro() {
  const introRef = useIntroAnimation();

  return (
    <section id="home" className={cn(gotham_medium.className, gotham_medium.variable, "section intro_sec h-screen flex items-center")}>
      <div ref={introRef} className="intro mx-auto">

        <div data-introanimate className="pb-4 hithere font-bold font-2-4">
          Hi There !
        </div>

        <h1 data-introanimate className="myname font-bold font-2-4">
          <DecoderText text={`I’m ${myName}`} eachCharClass="namechar" startDelay={decoderTextStartDelay} />
        </h1>

        <div data-introanimate className={raleway.className}>
          <h2>{shortDescription}</h2>
        </div>

        <div data-introanimate className="font-medium fluidz-48 mb-5 font-2-4">
          <ScramblingText data={introAnimatedText} delay={1500} />
        </div>

      </div>
    </section>
  )
}
