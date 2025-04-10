import React from 'react'
import Image from 'next/image';
import { skills } from '@/utils/config';
import { cn } from '@/utils/cn';
import { montserrat } from '@/utils/fonts';
import styles from './Skills.module.css';

const Skills = ({ expanded }: { expanded: boolean }) => (
  <ul className={cn(styles.skills_wrapper, montserrat.className)} role="list" aria-label="Skills List">
    {(expanded ? skills : skills.slice(0, 12)).map((item) => (
      <li key={item} role="listitem" aria-label={`Skill: ${item}`}>
        <Image
          width={15}
          height={15}
          src={`/skills/` + (item.split(' ').at(0)) + `.svg`}
          alt={`${item} Icon`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/skills/default.svg';
          }}
        />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export default Skills;
