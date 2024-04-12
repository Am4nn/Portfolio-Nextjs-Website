import { useReducedMotion, useSpring } from 'framer-motion';
import { memo, useEffect, useRef } from 'react';
import styles from './DecoderText.module.css';
import VisuallyHidden from '@/components/wrapper/VisuallyHidden/VisuallyHidden';
import { tiro_Devanagari_Hindi } from '@/utils/fonts';
import { delay } from '@/utils/delay';
import { cn } from '@/utils/cn';

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
  { text, start = true, startDelay = 0, eachCharClass, className, ...rest }:
    { text: string, start?: boolean, startDelay?: number, eachCharClass: string, className?: string }
) {
  const output = useRef([{ type: CharType.Glyph, value: '' }]);
  const container = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();
  const decoderSpring = useSpring(0, springConfig);

  useEffect(() => {
    const content = text.split('');
    let animation;

    const renderOutput = () => {
      const characterMap = output.current.map((item, id) => {
        return `<span class="${styles[item.type]} ${eachCharClass + id}">${item.value}</span>`;
      });

      if (container && container.current) {
        container.current.innerHTML = characterMap.join('');
      }
    };

    const unsubscribeSpring = decoderSpring.on('change', value => {
      output.current = shuffle(content, output.current, value);
      renderOutput();
    });

    const startSpring = async () => {
      await delay(startDelay);
      decoderSpring.set(content.length);
    };

    if (start && !animation && !reduceMotion) {
      startSpring();
    }

    if (reduceMotion) {
      output.current = content.map((value, index) => ({
        type: CharType.Value,
        value: content[index],
      }));
      renderOutput();
    }

    return () => {
      unsubscribeSpring?.();
    };
  }, [decoderSpring, reduceMotion, start, startDelay, eachCharClass, text]);

  return (
    <span className={cn(styles.text, tiro_Devanagari_Hindi.variable, className)} {...rest}>
      <VisuallyHidden>{text}</VisuallyHidden>
      <span aria-hidden className={styles.content} ref={container} />
    </span>
  );
});

export default DecoderText;
