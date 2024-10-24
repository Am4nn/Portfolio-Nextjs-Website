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

/**
 * A memoized React component that decodes and animates text.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.text - The text to be decoded and animated.
 * @param {boolean} [props.start=true] - Whether to start the animation immediately.
 * @param {number} [props.startDelay=0] - The delay before starting the animation, in milliseconds.
 * @param {string} [props.eachCharClass] - Additional class to apply to each character.
 * @param {string} [props.className] - Additional class to apply to the outermost span.
 * @param {Object} [props.rest] - Additional properties to spread onto the outermost span.
 * @returns {JSX.Element} The rendered component.
 */
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
