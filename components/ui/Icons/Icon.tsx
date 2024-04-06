import React from 'react';
import {
  IconEmail,
  IconExternal,
  IconGitHub,
  IconInstagram,
  IconLinkedin,
} from './index';

const Icon = ({ name }: { name?: string }) => {
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
    default:
      return <IconExternal />;
  }
};

export default Icon;
