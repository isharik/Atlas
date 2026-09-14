import { useState } from 'react';
import { PARTNERS } from '@/data/ecosystem';

/** Real partner logo from its X avatar, with a monogram fallback if none resolves. */
function PartnerLogo({ name, handle }: { name: string; handle: string }) {
  const [ok, setOk] = useState(Boolean(handle));
  if (ok && handle) {
    const h = handle.replace(/^@/, '');
    return (
      <img className="partner__logo partner__logo--img" src={`https://unavatar.io/x/${h}?fallback=false`}
        alt={`${name} logo`} loading="lazy" onError={() => setOk(false)} />
    );
  }
  return <span className="partner__logo font-head" aria-hidden>{name[0]}</span>;
}

/** Slim ecosystem-partners strip, shared across the program detail pages. */
export function PartnersStrip() {
  return (
    <div style={{ marginTop: 34 }}>
      <div className="eyebrow" style={{ fontSize: 10, letterSpacing: '0.4em', marginBottom: 14 }}>Ecosystem Partners</div>
      <div className="partner-strip">
        {PARTNERS.map((pt) => (
          <div key={pt.name} className="partner">
            <PartnerLogo name={pt.name} handle={pt.handle} />
            <span className="partner__meta">
              <span className="partner__name font-head">{pt.name}{pt.handle && <span className="partner__handle font-mono">{pt.handle}</span>}</span>
              <span className="partner__role font-display">{pt.role}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
