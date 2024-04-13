import React, { useRef, useEffect } from 'react';
import VisuallyHidden from '@/components/wrapper/VisuallyHidden/VisuallyHidden';
import './ScramblingText.css';

export default function ScramblingText({ data, delay = 1000, ...rest }: { data: string[], delay?: number }) {

  const elementRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const el = elementRef.current;
    const fx = new TextScramble(el);
    let timeoutID: NodeJS.Timeout | null = null;

    let counter = 0
    const next = () => {
      fx.setText(data[counter]).then(() => {
        timeoutID = setTimeout(next, delay);
      })
      counter = (counter + 1) % data.length
    }

    next();
    return () => { timeoutID && clearTimeout(timeoutID) };
  }, [data, delay]);

  return (
    <div {...rest}>
      <VisuallyHidden>{data.join(', ')}</VisuallyHidden>
      <div className="scramblingText_text" ref={elementRef} />
    </div>
  );
}

class TextScramble {
  el: HTMLElement;
  chars: string;
  frameRequest: number = 0;
  frame: number = 0;
  queue: { from: string; to: string; start: number; end: number; char?: string; }[] = [];
  resolve: ((value?: unknown) => void) = () => { };

  constructor(el: HTMLElement) {
    this.el = el
    this.chars = '!<>-_\\/[]{}—=+*^?#________'
    this.update = this.update.bind(this)
  }
  setText(newText: string) {
    const oldText = this.el.innerText
    const length = Math.max(oldText.length, newText.length)
    const promise = new Promise((resolve) => this.resolve = resolve)
    this.queue = []
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || ''
      const to = newText[i] || ''
      const start = Math.floor(Math.random() * 40)
      const end = start + Math.floor(Math.random() * 40)
      this.queue.push({ from, to, start, end })
    }
    cancelAnimationFrame(this.frameRequest)
    this.frame = 0
    this.update()
    return promise
  }
  update() {
    let output = ''
    let complete = 0
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i]
      if (this.frame >= end) {
        complete++
        output += to
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar()
          this.queue[i].char = char
        }
        output += `<span class="scramblingText_dud">${char}</span>`
      } else {
        output += from
      }
    }
    this.el.innerHTML = output
    if (complete === this.queue.length) {
      this.resolve()
    } else {
      this.frameRequest = requestAnimationFrame(this.update)
      this.frame++
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)]
  }
}
