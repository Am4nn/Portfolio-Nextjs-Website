import { useReducedMotion, useSpring } from 'framer-motion';
import { memo, useEffect, useRef, useState } from 'react';
import styles from './DecoderText.module.css';
import VisuallyHidden from '@/components/wrapper/VisuallyHidden/VisuallyHidden';
import { tiro_Devanagari_Hindi } from '@/utils/fonts';
import { delay } from '@/utils/delay';
import { cn } from '@/utils/cn';

export interface DecoderTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  start?: boolean;
  startDelay?: number;
  eachCharClass: string;
  className?: string;
}

const hindi = [
  'क', 'ख', 'ग', 'घ',
  'च', 'छ', 'ज', 'झ', 'ञ',
  'ट', 'ठ', 'ड', 'ढ', 'ण',
  'त', 'थ', 'द', 'ध', 'न',
  'प', 'फ', 'ब', 'भ', 'म',
  'य', 'र', 'ल', 'व',
  'श', 'ष', 'स', 'ह', 'क्ष',
  'त्र'
];

const glyphs = hindi;

const CharType = {
  Glyph: 'glyph',
  Value: 'value',
};

const springConfig = { stiffness: 8, damping: 5 };

function shuffle(content: string[], output: { type: string; value: string; }[], position: number) {
  return content.map((value, index) => {
    if (index < position) {
      return { type: CharType.Value, value };
    }

    if (position % 1 < 0.5) {
      const rand = Math.floor(Math.random() * glyphs.length);
      return { type: CharType.Glyph, value: glyphs[rand] };
    }

    return { type: CharType.Glyph, value: output[index].value };
  });
}

const DecoderText = memo(function MemoDecoderText(
  { text, start = true, startDelay = 0, eachCharClass, className, ...rest }: DecoderTextProps
) {
  const reduceMotion = useReducedMotion();
  const decoderSpring = useSpring(0, springConfig);

  const [output, setOutput] = useState([{ type: CharType.Glyph, value: '' }]);

  useEffect(() => {
    const content = text.split('');

    const unsubscribeSpring = decoderSpring.on('change', value => {
      setOutput(prev => shuffle(content, prev, value));
    });

    const startSpring = async () => {
      await delay(startDelay);
      decoderSpring.set(content.length);
    };

    if (start && !reduceMotion) {
      startSpring();
    }

    if (reduceMotion) {
      setOutput(content.map((value, index) => ({
        type: CharType.Value,
        value: content[index],
      })));
    }

    return () => {
      unsubscribeSpring?.();
    };
  }, [decoderSpring, reduceMotion, start, startDelay, eachCharClass, text]);

  return (
    <span className={cn(styles.text, tiro_Devanagari_Hindi.variable, className)} {...rest}>
      <VisuallyHidden>{text}</VisuallyHidden>
      <span aria-hidden className={styles.content}>
        {output.map((item, id) => (
          <span key={id} className={cn(styles[item.type], eachCharClass + id)}>{item.value}</span>
        ))}
      </span>
    </span>
  );
});

export default DecoderText;
