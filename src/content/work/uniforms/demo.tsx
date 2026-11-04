// The Uniforms playground, as a live demo: edit the sketch, drag its numbers,
// make a mistake and watch the preview keep the last working frame.
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type UIEvent
} from 'react';
import { useInView, useReducedMotion } from '~/lib/hooks';
import { createRenderer, explainError, type Explained, type Renderer } from './gl';
import { presets, readParam, writeParam } from './shaders';
import { CodeLine, Mark } from './ui';

const stills = import.meta.glob<string>('./demo-1600.webp', {
  eager: true,
  import: 'default'
});
const stillUrl = Object.values(stills)[0];

const STATIC_TIME = 1.5;

const css = `
.ufd{position:absolute;inset:0;container-type:size;overflow:hidden;background:#E9E7E1;color:#17171A;font-family:var(--fg-font-sans);font-size:14px;line-height:1.4;text-align:left}
.ufd *{box-sizing:border-box}
.ufd :focus-visible{outline:2px solid #2F45FF;outline-offset:2px}
.ufd button{font:inherit;color:inherit;cursor:pointer}
.ufd-grid{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto minmax(0,1fr);gap:8px;padding:8px}
.ufd-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;padding:4px 4px 0}
.ufd-brand{display:flex;align-items:center;gap:7px;font-weight:600;font-size:15px;letter-spacing:-0.03em}
.ufd-lesson{display:none;font-size:13px;color:#6C6A64;letter-spacing:-0.005em}
.ufd-presets{order:3;flex-basis:100%;display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;padding:2px}
.ufd-presets::-webkit-scrollbar{display:none}
.ufd-preset{flex:none;border:0;background:transparent;border-radius:999px;padding:5px 11px;font-size:13px;color:#3A3A3E;box-shadow:inset 0 0 0 1px #DAD7CF}
.ufd-preset[aria-pressed="true"]{background:#17171A;color:#fff;box-shadow:none}
.ufd-status{margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-family:var(--fg-font-pixel);font-size:11px;text-transform:uppercase;letter-spacing:.02em;color:#3A3A3E;background:#F5F4F0;border-radius:999px;padding:4px 10px 4px 8px;box-shadow:inset 0 0 0 1px #DAD7CF;white-space:nowrap}
.ufd-dot{width:7px;height:7px;border-radius:50%;background:#2F45FF;flex:none}
.ufd-status.err .ufd-dot,.ufd-msg.err .ufd-dot{background:#F2604B}
.ufd-code{grid-row:3;min-height:0;display:flex;flex-direction:column;background:#fff;border-radius:12px;box-shadow:0 0 0 1px #DAD7CF;overflow:hidden}
.ufd-codehead{display:flex;align-items:center;gap:6px;padding:6px 6px 6px 12px;border-bottom:1px solid #E7E5DF;min-height:38px}
.ufd-file{font-family:var(--fg-font-pixel);font-size:11px;text-transform:uppercase;letter-spacing:.02em;color:#6C6A64;margin-right:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ufd-ghost{border:0;background:transparent;border-radius:8px;padding:5px 9px;font-size:13px;color:#3A3A3E;white-space:nowrap}
.ufd-ghost:hover{background:#F0EFEA}
.ufd-ghost:disabled{opacity:.4;cursor:default;background:transparent}
.ufd-ghost.mistake{color:#B8392A}
.ufd-editor{position:relative;flex:1;min-height:0;display:flex;font-family:var(--fg-font-pixel);font-size:12px;line-height:18px;font-variant-ligatures:none;font-feature-settings:"liga" 0,"calt" 0}
.ufd-gutter{flex:none;width:34px;overflow:hidden;position:relative;color:#A3A099;text-align:right;background:#FAFAF8;border-right:1px solid #EFEDE8}
.ufd-gutter-inner{padding:10px 8px 10px 0;will-change:transform}
.ufd-gutter .err{color:#F2604B}
.ufd-text{position:relative;flex:1;min-width:0;overflow:hidden}
.ufd-hl,.ufd-ta{margin:0;padding:10px 14px 10px 12px;font:inherit;line-height:inherit;letter-spacing:0;tab-size:2;white-space:pre;word-wrap:normal;overflow-wrap:normal;border:0}
.ufd-hl{position:absolute;top:0;left:0;min-width:100%;width:max-content;pointer-events:none;will-change:transform}
.ufd-ln{min-width:100%;padding-right:14px;margin-right:-14px}
.ufd-ln.err{background:#FDE5E0;box-shadow:inset 2px 0 0 #F2604B;margin-left:-12px;padding-left:12px}
.ufd-ta{position:absolute;inset:0;width:100%;height:100%;resize:none;background:transparent;color:transparent;caret-color:#17171A;overflow:auto;outline:none}
.ufd-ta::selection{background:rgba(47,69,255,.22);color:transparent}
.ufd-ta:focus-visible{outline:none}
.ufd-code:has(.ufd-ta:focus-visible){box-shadow:0 0 0 2px #2F45FF}
.ufd-msg{border-top:1px solid #E7E5DF;padding:8px 10px 9px 12px;display:flex;gap:8px;align-items:flex-start;min-height:58px;font-size:12.5px;line-height:1.35;color:#3A3A3E;background:#FAFAF8}
.ufd-msg .ufd-dot{margin-top:5px}
.ufd-msg.err{background:#FFF6F3}
.ufd-msg strong{display:block;font-weight:600;color:#17171A}
.ufd-msg-line{font-family:var(--fg-font-pixel);font-size:11px;text-transform:uppercase;letter-spacing:.02em;color:#B8392A;margin-right:6px}
.ufd-fix{margin-left:auto;flex:none;align-self:center;border:0;border-radius:8px;background:#17171A;color:#fff !important;padding:6px 10px;font-size:12.5px}
.ufd-side{grid-row:2;min-height:0;display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
.ufd-preview{position:relative;height:30cqh;min-height:120px;border-radius:12px;overflow:hidden;background:#111;box-shadow:0 0 0 1px #DAD7CF;touch-action:pan-y}
.ufd-preview canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.ufd-badge{position:absolute;left:8px;top:8px;display:inline-flex;align-items:center;gap:6px;font-family:var(--fg-font-pixel);font-size:11px;text-transform:uppercase;letter-spacing:.02em;background:rgba(255,255,255,.92);color:#17171A;border-radius:999px;padding:3px 9px 3px 7px;pointer-events:none}
.ufd-badge.err .ufd-dot{background:#F2604B}
.ufd-uniforms{display:none}
.ufd-params{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px 10px;background:#F5F4F0;border-radius:12px;box-shadow:inset 0 0 0 1px #DAD7CF;padding:7px 10px 8px}
.ufd-param{display:grid;gap:1px;min-width:0}
.ufd-param-head{display:flex;justify-content:space-between;gap:6px;font-family:var(--fg-font-pixel);font-size:11px;text-transform:uppercase;letter-spacing:.02em;color:#6C6A64;white-space:nowrap}
.ufd-param-head output{color:#17171A}
.ufd-param input{width:100%;accent-color:#2F45FF;height:18px;margin:0}
.ufd-param input:disabled{opacity:.35}
.ufd-panel-title{display:none}
@container (min-width: 720px){
  .ufd{font-size:14px}
  .ufd-grid{grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);grid-template-rows:auto minmax(0,1fr);gap:12px;padding:12px}
  .ufd-bar{grid-column:1/-1;flex-wrap:nowrap;padding:2px 2px 0 6px;gap:14px}
  .ufd-lesson{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
  .ufd-presets{order:0;flex-basis:auto;margin-left:auto}
  .ufd-status{margin-left:0}
  .ufd-code{grid-column:1;grid-row:2}
  .ufd-editor{font-size:14px;line-height:22px}
  .ufd-gutter{width:40px}
  .ufd-hl,.ufd-ta{padding:14px 18px 14px 14px}
  .ufd-gutter-inner{padding:14px 10px 14px 0}
  .ufd-ln.err{margin-left:-14px;padding-left:14px}
  .ufd-msg{font-size:13.5px;padding:12px 14px;min-height:72px}
  .ufd-side{grid-column:2;grid-row:2;grid-template-rows:minmax(0,1fr) auto auto;gap:12px}
  .ufd-preview{height:auto;min-height:0}
  .ufd-badge{left:12px;top:12px}
  .ufd-uniforms{display:grid;grid-template-columns:auto 1fr;gap:5px 14px;align-items:baseline;background:#F5F4F0;border-radius:12px;box-shadow:inset 0 0 0 1px #DAD7CF;padding:12px 14px}
  .ufd-uniforms dt{font-family:var(--fg-font-pixel);font-size:13px;color:#1F2FC4}
  .ufd-uniforms dd{margin:0;font-family:var(--fg-font-pixel);font-size:13px;color:#17171A;font-variant-numeric:tabular-nums;text-align:right}
  .ufd-panel-title{display:flex;grid-column:1/-1;justify-content:space-between;font-family:var(--fg-font-pixel);font-size:11px;text-transform:uppercase;letter-spacing:.02em;color:#6C6A64;margin-bottom:2px}
  .ufd-params{grid-template-columns:minmax(0,1fr);gap:8px;padding:12px 14px}
  .ufd-param{gap:3px}
}
@container (min-width: 720px) and (max-height: 600px){
  .ufd-uniforms{display:none}
  .ufd-side{grid-template-rows:minmax(0,1fr) auto}
  .ufd-msg{min-height:58px;padding:9px 12px}
}
`;

type GlState = 'pending' | 'ok' | 'none';

export default function UniformsDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const timeOut = useRef<HTMLElement>(null);
  const mouseOut = useRef<HTMLElement>(null);
  const resOut = useRef<HTMLElement>(null);
  const time = useRef(STATIC_TIME);
  const mouse = useRef<[number, number]>([0.5, 0.5]);
  const immediate = useRef(true);

  const [presetIndex, setPresetIndex] = useState(0);
  const preset = presets[presetIndex]!;
  const [code, setCode] = useState(preset.code);
  const codeRef = useRef(code);
  codeRef.current = code;
  const [error, setError] = useState<Explained | null>(null);
  const [glState, setGlState] = useState<GlState>('pending');
  const [pageVisible, setPageVisible] = useState(true);

  const reducedMotion = useReducedMotion();
  const inView = useInView(rootRef, '100px');
  const running = glState === 'ok' && inView && pageVisible && !reducedMotion;

  const updateReadouts = useCallback(() => {
    const canvas = canvasRef.current;
    if (timeOut.current) {
      timeOut.current.textContent = `${(reducedMotion ? STATIC_TIME : time.current).toFixed(2)} s`;
    }
    if (mouseOut.current) {
      mouseOut.current.textContent = `${mouse.current[0].toFixed(2)}, ${mouse.current[1].toFixed(2)}`;
    }
    if (resOut.current && canvas) {
      resOut.current.textContent = `${canvas.width} × ${canvas.height}`;
    }
  }, [reducedMotion]);

  const drawStill = useCallback(() => {
    rendererRef.current?.draw(
      reducedMotion ? STATIC_TIME : time.current,
      mouse.current
    );
    updateReadouts();
  }, [reducedMotion, updateReadouts]);

  // Create the renderer, and recreate it if the GPU drops the context.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const init = () => {
      const renderer = createRenderer(canvas);
      if (!renderer) {
        setGlState('none');
        return;
      }
      rendererRef.current = renderer;
      const result = renderer.compile(codeRef.current);
      setError(result.ok ? null : explainError(result.log, codeRef.current));
      setGlState('ok');
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      rendererRef.current = null;
      setGlState('pending');
    };
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', init);
    init();
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', init);
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, []);

  // Keep the canvas at the preview's size, in device pixels.
  useEffect(() => {
    const box = previewRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas || glState !== 'ok') return;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(box.clientWidth * ratio));
      const height = Math.max(1, Math.round(box.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      drawStill();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(box);
    resize();
    return () => observer.disconnect();
  }, [glState, drawStill]);

  // Compile as the code changes: straight away for sliders and presets,
  // after a short pause while typing.
  useEffect(() => {
    if (glState !== 'ok') return;
    const compile = () => {
      const renderer = rendererRef.current;
      if (!renderer) return;
      const result = renderer.compile(code);
      setError(result.ok ? null : explainError(result.log, code));
      drawStill();
    };
    if (immediate.current) {
      immediate.current = false;
      compile();
      return;
    }
    const timer = window.setTimeout(compile, 220);
    return () => window.clearTimeout(timer);
  }, [code, glState, drawStill]);

  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // The render loop runs only while the demo is on screen.
  useEffect(() => {
    if (!running) {
      drawStill();
      return;
    }
    let frame = 0;
    let last = performance.now();
    let sinceReadout = 1;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      time.current += dt;
      rendererRef.current?.draw(time.current, mouse.current);
      sinceReadout += dt;
      if (sinceReadout > 0.08) {
        sinceReadout = 0;
        updateReadouts();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, drawStill, updateReadouts]);

  function loadPreset(index: number) {
    immediate.current = true;
    setPresetIndex(index);
    setCode(presets[index]!.code);
  }

  function changeCode(next: string, now = false) {
    immediate.current = now;
    setCode(next);
  }

  function syncScroll(event: UIEvent<HTMLTextAreaElement>) {
    const { scrollTop, scrollLeft } = event.currentTarget;
    if (highlightRef.current) {
      highlightRef.current.style.transform = `translate(${-scrollLeft}px, ${-scrollTop}px)`;
    }
    if (gutterRef.current) {
      gutterRef.current.style.transform = `translateY(${-scrollTop}px)`;
    }
  }

  function moveMouse(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mouse.current = [
      Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height))
    ];
    if (!running) drawStill();
  }

  function keyMouse(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 0.1 : 0.03;
    const [x, y] = mouse.current;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [x - step, y],
      ArrowRight: [x + step, y],
      ArrowUp: [x, y + step],
      ArrowDown: [x, y - step]
    };
    const next = moves[event.key];
    if (!next) return;
    event.preventDefault();
    mouse.current = [
      Math.min(1, Math.max(0, next[0])),
      Math.min(1, Math.max(0, next[1]))
    ];
    if (!running) drawStill();
    else updateReadouts();
  }

  const lines = code.split('\n');
  const broken = error ? null : preset.mistake.make(code);
  const fixed = error ? preset.mistake.fix(code) : null;

  return (
    <div ref={rootRef} className='ufd'>
      <style>{css}</style>
      <div className='ufd-grid'>
        <div className='ufd-bar'>
          <span className='ufd-brand'>
            <Mark size={15} />
            uniforms
          </span>
          <span className='ufd-lesson'>{preset.lesson}</span>
          <div className='ufd-presets' role='group' aria-label='Starter sketches'>
            {presets.map((p, i) => (
              <button
                key={p.id}
                type='button'
                className='ufd-preset'
                aria-pressed={i === presetIndex}
                onClick={() => loadPreset(i)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <span className={`ufd-status${error ? ' err' : ''}`}>
            <span className='ufd-dot' />
            {error ? `Line ${error.line} needs a fix` : 'Compiled'}
          </span>
        </div>

        <section className='ufd-code' aria-label='Code'>
          <div className='ufd-codehead'>
            <span className='ufd-file'>sketch.frag</span>
            <button
              type='button'
              className='ufd-ghost mistake'
              disabled={broken === null}
              onClick={() => broken && changeCode(broken, true)}
            >
              Make a mistake
            </button>
            <button
              type='button'
              className='ufd-ghost'
              disabled={code === preset.code}
              onClick={() => changeCode(preset.code, true)}
            >
              Reset
            </button>
          </div>
          <div className='ufd-editor'>
            <div className='ufd-gutter' aria-hidden>
              <div ref={gutterRef} className='ufd-gutter-inner'>
                {lines.map((_, i) => (
                  <div key={i} className={error?.line === i + 1 ? 'err' : undefined}>
                    {error?.line === i + 1 ? '● ' : ''}
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className='ufd-text'>
              <pre ref={highlightRef} className='ufd-hl' aria-hidden>
                {lines.map((line, i) => (
                  <div
                    key={i}
                    className={error?.line === i + 1 ? 'ufd-ln err' : 'ufd-ln'}
                  >
                    <CodeLine text={line} />
                  </div>
                ))}
              </pre>
              <textarea
                className='ufd-ta'
                value={code}
                onChange={(event) => changeCode(event.target.value)}
                onScroll={syncScroll}
                spellCheck={false}
                autoCapitalize='off'
                autoComplete='off'
                autoCorrect='off'
                wrap='off'
                aria-label={`Shader code, ${preset.lesson}`}
                aria-describedby='ufd-message'
              />
            </div>
          </div>
          <div
            id='ufd-message'
            className={`ufd-msg${error ? ' err' : ''}`}
            role='status'
            aria-live='polite'
          >
            <span className='ufd-dot' />
            {error ? (
              <>
                <span>
                  <strong>
                    <span className='ufd-msg-line'>Line {error.line}</span>
                    {error.title}
                  </strong>
                  {error.hint}
                </span>
                {fixed ? (
                  <button
                    type='button'
                    className='ufd-fix'
                    onClick={() => changeCode(fixed, true)}
                  >
                    Fix it
                  </button>
                ) : null}
              </>
            ) : (
              <span>
                <strong>It works.</strong>
                Drag a slider or type a new number. Then press Make a mistake: the
                picture stays.
              </span>
            )}
          </div>
        </section>

        <div className='ufd-side'>
          <div
            ref={previewRef}
            className='ufd-preview'
            tabIndex={0}
            role='img'
            aria-label='Live preview. Point at it, or use the arrow keys, to move u_mouse.'
            onPointerMove={moveMouse}
            onPointerDown={moveMouse}
            onKeyDown={keyMouse}
          >
            <canvas ref={canvasRef} />
            {glState === 'none' ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  padding: 16,
                  background: stillUrl ? `center / cover url("${stillUrl}")` : '#E9E7E1'
                }}
              >
                <p
                  style={{
                    margin: 0,
                    maxWidth: 280,
                    background: '#fff',
                    borderRadius: 10,
                    padding: '10px 12px',
                    fontSize: 13,
                    color: '#17171A'
                  }}
                >
                  This preview needs WebGL, which this browser has switched off.
                  The code and the error messages still work.
                </p>
              </div>
            ) : (
              <span className={`ufd-badge${error ? ' err' : ''}`}>
                <span className='ufd-dot' />
                {error ? 'Last working frame' : 'Live'}
              </span>
            )}
          </div>
          <dl className='ufd-uniforms' aria-label='Uniforms'>
            <div className='ufd-panel-title'>
              <span>Uniforms</span>
              <span>Always available</span>
            </div>
            <dt>u_time</dt>
            <dd>
              <span ref={timeOut}>1.50 s</span>
            </dd>
            <dt>u_mouse</dt>
            <dd>
              <span ref={mouseOut}>0.50, 0.50</span>
            </dd>
            <dt>u_resolution</dt>
            <dd>
              <span ref={resOut}>—</span>
            </dd>
          </dl>
          <div className='ufd-params' role='group' aria-label='Numbers in the code'>
            <div className='ufd-panel-title'>
              <span>Numbers</span>
              <span>Drag to rewrite</span>
            </div>
            {preset.params.map((param) => {
              const value = readParam(code, param);
              const id = `ufd-${preset.id}-${param.id}`;
              return (
                <div key={param.id} className='ufd-param'>
                  <div className='ufd-param-head'>
                    <label htmlFor={id}>{param.label}</label>
                    <output htmlFor={id}>
                      {value === null ? '—' : value.toFixed(param.decimals)}
                    </output>
                  </div>
                  <input
                    id={id}
                    type='range'
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={value ?? param.min}
                    disabled={value === null}
                    onChange={(event) =>
                      changeCode(
                        writeParam(code, param, Number(event.target.value)),
                        true
                      )
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
