import { useRef, useState } from 'react';
import { useReducedMotion } from '~/lib/hooks';
import { cn } from '~/lib/utils';
import { portfolio, type Tool } from '~/portfolio.config';
import { ToolIcon } from './ToolIcon';

/** The row of tool icons in the dashboard's top bar. Each one hops. */
export function ToolRow({ className }: { className?: string }) {
  return (
    <ul
      aria-label='Tools I work with'
      className={cn('flex items-center gap-1.5 sm:gap-2', className)}
    >
      {portfolio.tools.map((tool) => (
        <li key={tool.name}>
          <ToolButton tool={tool} />
        </li>
      ))}
    </ul>
  );
}

function ToolButton({ tool }: { tool: Tool }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [tip, setTip] = useState(false);
  const reducedMotion = useReducedMotion();

  const hop = () => {
    const icon = ref.current;
    if (!icon || reducedMotion || icon.classList.contains('hop')) return;
    icon.classList.add('hop');
  };

  return (
    <button
      type='button'
      aria-label={tool.name}
      className='relative grid h-11 w-[34px] place-items-center rounded-[11px] sm:size-9'
      onPointerEnter={() => {
        hop();
        setTip(true);
      }}
      onPointerLeave={() => setTip(false)}
      onFocus={() => {
        hop();
        setTip(true);
      }}
      onBlur={() => setTip(false)}
      onClick={hop}
    >
      {/* The tile is 34 px; the button around it is 44 px tall to tap. */}
      <span className='relative size-[34px] sm:size-9'>
        <span
          ref={ref}
          onAnimationEnd={() => ref.current?.classList.remove('hop')}
          className='relative z-[1] grid size-full place-items-center rounded-[11px] bg-white/70 text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,.9),0_1px_2px_rgba(19,20,24,.08),0_4px_10px_-4px_rgba(19,20,24,.18)]'
        >
          <ToolIcon icon={tool.icon} />
        </span>
        <span
          aria-hidden
          data-hop-shadow
          className='absolute inset-x-2 -bottom-[3px] h-[3px] rounded-full bg-ink/12'
        />
      </span>
      <span
        aria-hidden
        className={cn(
          'label pointer-events-none absolute top-full left-1/2 z-10 mt-0.5 -translate-x-1/2 rounded-md bg-ink px-2 py-1 whitespace-nowrap text-paper transition-[opacity,transform] duration-200 sm:mt-2.5',
          tip ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
        )}
      >
        {tool.name}
      </span>
    </button>
  );
}
