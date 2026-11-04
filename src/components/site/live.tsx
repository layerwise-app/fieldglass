import { useEffect, useState, useSyncExternalStore } from 'react';
import { field } from '~/lib/field/store';
import { portfolio } from '~/portfolio.config';

/**
 * The owner's local time, filled in after hydration. The slot is a fixed
 * number of monospace characters so nothing moves when it appears.
 */
export function LocalTime({ className }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: portfolio.timeZone,
      timeZoneName: 'short'
    });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span
      className={className}
      style={{ display: 'inline-block', minWidth: '9ch' }}
    >
      {time ?? '  :  '}
    </span>
  );
}

const subscribe = field.subscribe;
const getInfo = () => field.getInfo();
const serverInfo = { mode: 'pending', count: 0 } as const;

/** The field's mode and particle count, updated live. */
export function useFieldInfo() {
  return useSyncExternalStore(subscribe, getInfo, () => serverInfo);
}

/** How many particles the field is drawing right now. */
export function ParticleCount({ className }: { className?: string }) {
  const info = useFieldInfo();
  let text = '';
  if (info.mode === 'live' || info.mode === 'static') {
    text = `${info.count.toLocaleString('en-US')} particles`;
  } else if (info.mode === 'still') {
    text = 'Rendered still';
  }
  return (
    <span
      className={className}
      aria-live='off'
      style={{ display: 'inline-block', minWidth: '17ch' }}
    >
      {text || ' '}
    </span>
  );
}

/** True while a project link is morphing the field before navigating. */
export function isMorphing() {
  return (
    typeof document !== 'undefined' &&
    Boolean(document.getElementById('main')?.classList.contains('page-leave'))
  );
}
