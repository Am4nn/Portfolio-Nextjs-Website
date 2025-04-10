"use client"

import React, { Fragment } from 'react';
import dynamic from 'next/dynamic';

const ScrollUpButton = dynamic(() => import('@/components/ui/ScrollUpButton/ScrollUpButton'));

const UIHelpers: React.FC = () => (
  <Fragment>
    <ScrollUpButton />
  </Fragment>
);

export default UIHelpers;
