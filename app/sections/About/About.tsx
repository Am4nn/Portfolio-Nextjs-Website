import SectionHeading from '@/components/ui/SectionHeading/SectionHeading';
import Image from 'next/image';
import StyledLink from '@/components/ui/StyledLink/StyledLink';
import Skills from './Skills/Skills';
import styles from './About.module.css';
import { useState } from 'react';
import { gotham } from '@/utils/fonts';
import StyledButton from '@/components/ui/StyledButton/StyledButton';
import { Icon } from '@/components/ui/Icons';

const About = () => {

  const [expanded, setExpanded] = useState<boolean>(false);
  const toggleExpand = () => setExpanded(prev => !prev);

  return (
    <section id="about">

      <SectionHeading
        subText="Introduction"
        headText="About Me"
      />

      <div className={styles.about}>

        <div className={styles.about_text}>
          <p>
            I’m Aman Arya, currently I live in Bengaluru India,
            working as a Junior Engineer at <StyledLink external href='https://www.goldmansachs.com/'>Goldman Sachs</StyledLink>.
          </p>

          <p>
            I’ve been flexible with technologies, enjoying the journey from creating games like <StyledLink external href='https://github.com/Am4nn/Super-Mario-SFML'>Super Mario</StyledLink> in C++ with SFML,
            to exploring Java with its <StyledLink external href='https://github.com/Am4nn/Auction-App-Using-RMI'>RMI</StyledLink>, <StyledLink external href='https://github.com/Am4nn/MultiClient-Java-Server'>Socket</StyledLink> and <StyledLink external href='https://github.com/Am4nn/Draw-Graphs'>Swing</StyledLink> libraries.
            Transitioning to web development, I’ve delved into various libraries and frameworks such as Next.js, TypeScript, Framer Motion, Socket.io and Redux.
            I also explored <StyledLink external href='https://github.com/Am4nn/Online-Judge-Project'>Docker, AWS, DNS management</StyledLink>, and other technologies during this transition.
          </p>

          <p>
            During my time at Goldman Sachs, I focused on Tableau, data modeling, and am currently involved in
            Playwright test automation, Cucumber, and contributing to API services with Spring Boot and RxJava.
          </p>

          <p>
            In my free time, I enjoy watching web series, playing video games, and experimenting with new technologies.
            I’m always eager to learn about new projects, so <StyledLink href='#contact'>please feel free to reach out to me</StyledLink>.
          </p>

          <p>Here are a few technologies I’ve worked on:</p>

          <Skills expanded={expanded} />

          <StyledButton
            className={gotham.className}
            aria-label={expanded ? 'show less' : 'show more'}
            onClick={toggleExpand}
            endIcon={<Icon name={expanded ? 'ArrowUp' : "ArrowDown"} />}
          >
            {expanded ? 'show less' : 'show more'}
          </StyledButton>
        </div>

        <div className={styles.about_image}>
          <div className={styles.image_wrapper}>
            <Image
              className={styles.img}
              src="/images/my-pic.png"
              width={728}
              height={1125}
              quality={95}
              alt="Aman Arya Picture"
            />
          </div>
        </div>

      </div>

    </section>
  );
}

export default About;
