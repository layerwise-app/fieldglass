import type { ReactNode } from 'react';
import { essay } from './copy';
import { credits, font, lt } from './palette';
import { Masthead } from './print';
import { Still } from './scenes';

/* longtake.be on a phone, laid out at 390 × 844. */

function StatusBar({ dark = false }: { dark?: boolean }) {
  const c = dark ? lt.paper : lt.ink;
  return (
    <div style={{ height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 30px 0 36px', color: c, fontFamily: font.sans, fontWeight: 600, fontSize: 16 }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width='18' height='11' viewBox='0 0 18 11' aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.6} y={8 - i * 2.6} width='3.2' height={3 + i * 2.6} rx='0.8' fill={c} />
          ))}
        </svg>
        <svg width='25' height='12' viewBox='0 0 25 12' aria-hidden>
          <rect x='0.5' y='0.5' width='21' height='11' rx='3' stroke={c} fill='none' opacity='0.5' />
          <rect x='2' y='2' width='15' height='8' rx='1.6' fill={c} />
          <rect x='22.5' y='4' width='1.6' height='4' rx='0.8' fill={c} opacity='0.5' />
        </svg>
      </span>
    </div>
  );
}

function Screen({ children, bg = lt.paper }: { children: ReactNode; bg?: string }) {
  return (
    <div style={{ width: 390, height: 844, background: bg, color: lt.ink, position: 'relative', overflow: 'hidden' }}>
      {children}
    </div>
  );
}

const plans = [
  { name: 'Print + digital', price: '€56', per: 'a year', note: 'Four issues posted to you, every essay and take online, the archive from N°1.', selected: true },
  { name: 'Digital', price: '€28', per: 'a year', note: 'Every essay and take, the archive, and each issue as a PDF to read offline.', selected: false },
  { name: 'N°14 only', price: '€14', per: '', note: 'Duration, posted to you. 96 pages.', selected: false }
];

export function PhoneSubscribe() {
  return (
    <Screen>
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 22px 14px', borderBottom: `1px solid ${lt.ink}` }}>
        <Masthead width={124} height={22} />
        <svg width='22' height='12' viewBox='0 0 22 12' aria-hidden>
          <rect y='1' width='22' height='1.6' fill={lt.ink} />
          <rect y='9' width='22' height='1.6' fill={lt.ink} />
        </svg>
      </div>
      <div style={{ padding: '26px 22px 0' }}>
        <div style={{ fontFamily: font.pixel, fontSize: 11, letterSpacing: '0.06em', color: lt.oxblood }}>N°15 — SOUND — SHIPS 4 DECEMBER</div>
        <div style={{ fontFamily: font.serif, fontSize: 52, lineHeight: 0.95, letterSpacing: '-0.02em', marginTop: 12 }}>Subscribe</div>
        <p style={{ fontFamily: font.serif, fontStyle: 'italic', fontSize: 19, lineHeight: 1.3, marginTop: 12, color: lt.inkSoft }}>
          Four issues a year, the whole archive, and screenings at member prices.
        </p>
      </div>
      <div style={{ padding: '22px 22px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              border: `1px solid ${plan.selected ? lt.ink : lt.rule}`,
              background: plan.selected ? '#f7f2e8' : 'transparent',
              padding: '14px 16px 14px 14px',
              display: 'grid',
              gridTemplateColumns: '22px 1fr auto',
              gap: 10,
              borderRadius: 3
            }}
          >
            <span style={{ width: 16, height: 16, borderRadius: 8, border: `1.5px solid ${lt.ink}`, marginTop: 3, display: 'grid', placeItems: 'center' }}>
              {plan.selected ? <span style={{ width: 8, height: 8, borderRadius: 4, background: lt.oxblood }} /> : null}
            </span>
            <div>
              <div style={{ ...credits, fontSize: 16 }}>{plan.name}</div>
              <div style={{ fontFamily: font.sans, fontSize: 13, lineHeight: 1.4, marginTop: 4, color: lt.inkSoft }}>{plan.note}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: font.serif, fontSize: 26, lineHeight: 1 }}>{plan.price}</div>
              <div style={{ fontFamily: font.pixel, fontSize: 9, color: lt.grey, marginTop: 3 }}>{plan.per.toUpperCase()}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ margin: '18px 22px 0', paddingTop: 14, borderTop: `1px solid ${lt.rule}`, display: 'grid', gridTemplateColumns: '1fr auto', gap: 4 }}>
        <span style={{ fontFamily: font.pixel, fontSize: 10, letterSpacing: '0.05em', color: lt.grey }}>MEMBER SCREENING</span>
        <span style={{ fontFamily: font.pixel, fontSize: 10, letterSpacing: '0.05em', color: lt.grey }}>€6</span>
        <span style={{ fontFamily: font.serif, fontSize: 18, lineHeight: 1.2, gridColumn: '1 / -1' }}>
          Kustweg, on the restored 35mm print. Thursday 14 November, Cinémathèque du Nord.
        </span>
      </div>
      <div style={{ position: 'absolute', left: 22, right: 22, bottom: 40 }}>
        <div style={{ background: lt.oxblood, color: lt.paper, textAlign: 'center', padding: '16px 0 15px', borderRadius: 3, ...credits, fontSize: 16 }}>
          Subscribe — €56 a year
        </div>
        <div style={{ fontFamily: font.sans, fontSize: 12, color: lt.grey, textAlign: 'center', marginTop: 12 }}>
          Cancel any time. Prices include VAT and postage in Belgium.
        </div>
      </div>
    </Screen>
  );
}

export function PhoneReader() {
  return (
    <Screen>
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 22px 14px', borderBottom: `1px solid ${lt.rule}` }}>
        <svg width='10' height='16' viewBox='0 0 10 16' aria-hidden>
          <path d='M8 2 L2 8 L8 14' stroke={lt.ink} strokeWidth='1.8' fill='none' />
        </svg>
        <span style={{ fontFamily: font.pixel, fontSize: 11, letterSpacing: '0.05em' }}>N°14 — DURATION</span>
        <span style={{ marginLeft: 'auto', ...credits, fontSize: 12, color: lt.grey }}>14 min</span>
      </div>
      <div style={{ padding: '24px 22px 0' }}>
        <div style={{ ...credits, fontSize: 12, color: lt.oxblood }}>Essay — Kustweg (1991)</div>
        <div style={{ fontFamily: font.serif, fontSize: 46, lineHeight: 0.94, letterSpacing: '-0.02em', marginTop: 10 }}>{essay.title}</div>
        <div style={{ ...credits, fontSize: 12, marginTop: 12 }}>Words Mathis Okafor</div>
      </div>
      <div style={{ marginTop: 22 }}>
        <Still scene='coast' ratio={1.37} width={390} t={0.56} />
        <div style={{ display: 'flex', gap: 10, padding: '8px 22px 0', alignItems: 'baseline' }}>
          <span style={{ fontFamily: font.pixel, fontSize: 11, color: lt.oxblood }}>06:52</span>
          <span style={{ ...credits, fontSize: 11, fontWeight: 500, color: lt.inkSoft }}>The car passes her. 1.37:1, uncropped.</span>
        </div>
      </div>
      <p style={{ fontFamily: font.serif, fontSize: 19, lineHeight: 1.45, padding: '0 22px', marginTop: 18 }}>{essay.body[1]}</p>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 84,
          background: lt.ink,
          color: lt.paper,
          padding: '14px 22px 0'
        }}
      >
        <div style={{ height: 2, background: '#3d3631', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '58%', background: lt.paper }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 12 }}>
          <span style={{ fontFamily: font.pixel, fontSize: 12 }}>05:31</span>
          <span style={{ fontFamily: font.serif, fontSize: 18 }}>Headlights</span>
          <span style={{ marginLeft: 'auto', fontFamily: font.pixel, fontSize: 11, color: '#a39a8b' }}>NEXT 07:40 →</span>
        </div>
      </div>
    </Screen>
  );
}
