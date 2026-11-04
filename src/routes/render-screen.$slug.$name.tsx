import { createFileRoute, notFound } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { ScreenSet } from '~/content/screens';
import { seo } from '~/utils/seo';

// Development only: `pnpm render-screens <slug>` opens this page to capture
// each sample screen as an image. It is a 404 in the published site.
const modules = import.meta.glob<{ screens: ScreenSet }>(
  '../content/work/*/screens.tsx'
);

declare global {
  interface Window {
    __screenReady?: boolean;
  }
}

export const Route = createFileRoute('/render-screen/$slug/$name')({
  loader: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  head: () => seo({ title: 'Render screen', noindex: true }),
  staticData: { bare: true },
  component: RenderScreen
});

function RenderScreen() {
  const { slug, name } = Route.useParams();
  const [screens, setScreens] = useState<ScreenSet | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = modules[`../content/work/${slug}/screens.tsx`];
    if (!load) {
      setError(`No screens.tsx for ${slug}`);
      return;
    }
    load()
      .then((module) => setScreens(module.screens))
      .catch((e: unknown) => setError(String(e)));
  }, [slug]);

  useEffect(() => {
    if (!screens) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      // Two frames so canvases and layout settle before the capture.
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          setTimeout(() => {
            if (!cancelled) window.__screenReady = true;
          }, 400)
        )
      );
    });
    return () => {
      cancelled = true;
    };
  }, [screens, name]);

  if (error) return <pre id='screen-error'>{error}</pre>;
  if (!screens) return null;

  if (name === '_list') {
    const list = Object.entries(screens).map(([key, s]) => ({
      name: key,
      width: s.width,
      height: s.height
    }));
    return <pre id='screen-list'>{JSON.stringify(list)}</pre>;
  }

  const screen = screens[name];
  if (!screen) return <pre id='screen-error'>No screen named {name}</pre>;
  return (
    <>
      <style>{'html,body{scrollbar-gutter:auto;overflow:hidden;margin:0}'}</style>
      <div
      id='screen'
      style={{
        width: screen.width,
        height: screen.height,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {screen.render()}
      </div>
    </>
  );
}
