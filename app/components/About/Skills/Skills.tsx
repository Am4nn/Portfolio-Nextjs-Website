import React, { memo } from 'react'
import Image from 'next/image';
import { skills } from '@/utils/config';
import { cn } from '@/utils/cn';
import styles from './Skills.module.css';
import { montserrat } from '@/utils/fonts';

const Skills = () => (
  <ul className={cn(styles.skills_wrapper, montserrat.className)}>
    {skills.map((item, idx) => (
      <SkillBubble name={item} key={idx} />
    ))}
  </ul>
);

const SkillBubble = memo(({ name }: Readonly<{ name: string }>) => (
  <li key={name}>
    <Image width={15} height={15} src={`/skills/` + (name.split(' ').at(0)) + `.svg`} alt={name} loading="lazy" />
    <span>{name}</span>
  </li>
));

SkillBubble.displayName = 'SkillBubble';

export default Skills;
