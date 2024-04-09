import React from 'react'
import { cn } from '@/utils/cn';
import { gotham_medium } from '@/utils/fonts';
import styles from "./SectionHeading.module.css";

const SectionHeading = ({ headText, subText }: { headText: string, subText: string }) => (
  <div className={cn(gotham_medium.className, styles.wrapper)}>
    <p className={styles.subText}>{subText}</p>
    <h2 className={styles.headText}>{headText}</h2>
  </div>

);

export default SectionHeading;
