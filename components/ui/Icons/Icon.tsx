import React from 'react';
import {
  IconArrowDown, IconArrowUp, IconEmail, IconExternal,
  IconGitHub, IconInstagram, IconLinkedin,
} from './index';

interface IconsProps {
  name: 'GitHub' | 'Linkedin' | 'Instagram' | 'Email' | 'External' | 'ArrowUp' | 'ArrowDown' | string | undefined;
}

const Icon = ({ name }: IconsProps) => {
  switch (name) {
    case 'GitHub':
      return <IconGitHub />;
    case 'Linkedin':
      return <IconLinkedin />;
    case 'Instagram':
      return <IconInstagram />;
    case 'Email':
      return <IconEmail />;
    case 'External':
      return <IconExternal />;
    case 'ArrowUp':
      return <IconArrowUp />;
    case 'ArrowDown':
      return <IconArrowDown />;
    default:
      return <IconExternal />;
  }
};

export default Icon;
