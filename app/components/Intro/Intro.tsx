"use client"

import { useEffect, useState } from 'react';
import { stagger, useAnimate } from 'framer-motion';
import DecoderText from '@/components/ui/DecoderText/DecoderText'
import ScramblingText from '@/components/ui/ScramblingText/ScramblingText';
import { introAnimatedText, myName, shortDescription } from "@/utils/config";
import "./Intro.css"

const introLoaderDelay = 0.3; // in seconds
const introMountDelay = 1000; // in milliseconds
const shortDescDelay = 6000; // in milliseconds

function useIntroAnimation(isMounted: boolean) {
  const [scope, animate] = useAnimate();
  const staggerIntroItems = stagger(0.1, { startDelay: 0 });

  useEffect(() => {
    animate(
      "[data-introanimate]",
      isMounted
        ? { opacity: 1, translate: '0px 0px', scale: 1, filter: "blur(0px)" }
        : { opacity: 0, translate: '0px 30px', scale: 0.6, filter: "blur(20px)" },
      {
        duration: introLoaderDelay,
        delay: isMounted ? staggerIntroItems : 0,
      }
    );
  }, [isMounted, animate, staggerIntroItems]);

  return scope;
}

const Intro = () => {
  const [isMounted, setIsMounted] = useState(false);
  const introRef = useIntroAnimation(isMounted);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), introMountDelay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section id="home" className="section intro_sec flex items-center">
      <div ref={introRef} className="intro mx-auto">

        <div data-introanimate style={{ paddingBottom: 15 }} className="hithere font-2-4">
          Hi There !
        </div>

        <h1 data-introanimate className='myname font-2-4'>
          <DecoderText text={`I’m ${myName}`} eachCharClass="namechar" startDelay={1000 - 50 + 250} />
        </h1>

        <div data-introanimate>
          <h2 style={{ '--h2-fade-in-delay': `${shortDescDelay}ms` } as React.CSSProperties}>{shortDescription}</h2>
        </div>

        <div data-introanimate className="mytextcolorwhite fluidz-48 mb-5 font-2-4" style={{ fontWeight: 500 }}>
          <ScramblingText data={introAnimatedText} delay={1500} />
        </div>

      </div>
    </section>
  )
}

export default Intro;