import { motion } from 'framer-motion';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Container, Kicker, CTA, StatusPill, ZoneEmblem } from '@/components/PageBits';
import { zoneById, ZONE_DETAIL, FLOW_ORDER, TWO_ASSETS, OFFICIAL_LINKS, type ZoneMeta } from '@/data/ecosystem';
import type { ZoneId } from '@/store/useAtlas';
import { useAudio } from '@/audio/AudioProvider';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 22, filter: 'blur(4px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease } } };
const viewport = { once: true, amount: 0.3 };

function TwoAssets() {
  const list = [TWO_ASSETS.shares, TWO_ASSETS.pvault];
  const accents = ['#38e0a0', '#e4c877'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
      {list.map((a, i) => (
        <motion.div key={a.name} variants={rise} style={{ padding: 20, borderRadius: 12, border: `1px solid ${accents[i]}44`, background: 'rgba(15,22,18,0.5)' }}>
          <div className="font-head" style={{ fontSize: 16, fontWeight: 600, color: accents[i] }}>{a.name}</div>
          <div className="font-mono" style={{ fontSize: 9.5, letterSpacing: '0.14em', color: 'var(--mist)', margin: '5px 0 9px' }}>{a.mono}</div>
          <p className="font-display" style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--text)', opacity: 0.82, margin: 0 }}>{a.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function ZonePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { click } = useAudio();

  const zone = id ? (zoneById(id as ZoneId) as ZoneMeta | undefined) : undefined;
  if (!zone) return <Navigate to="/ecosystem" replace />;
  const detail = ZONE_DETAIL[zone.id];

  const idx = FLOW_ORDER.indexOf(zone.id);
  const prev = idx > 0 ? zoneById(FLOW_ORDER[idx - 1]) : null;
  const next = idx < FLOW_ORDER.length - 1 ? zoneById(FLOW_ORDER[idx + 1]) : null;
  const showTwoAssets = zone.id === 'vaults' || zone.id === 'pvault';

  return (
    <div style={{ paddingTop: 96, paddingBottom: 80 }}>
      <Container>
        {/* hero */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 40, alignItems: 'center' }} className="zone-hero">
          <div>
            <Kicker>{zone.glyph} · {zone.tagline}</Kicker>
            <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.4rem,6vw,4.4rem)', lineHeight: 1.02, color: 'var(--text-hi)', margin: '14px 0 14px', letterSpacing: '0.02em' }}
              initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.15, duration: 0.9, ease }}>
              {zone.label}
            </motion.h1>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <StatusPill label="Pre-launch" tone="mute" />
            </motion.div>
            <motion.p className="font-display" style={{ fontSize: 'clamp(0.95rem,1.6vw,1.1rem)', lineHeight: 1.65, color: 'var(--text)', opacity: 0.85, marginTop: 18, maxWidth: 560 }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 0.85, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease }}>
              {detail.purpose}
            </motion.p>
          </div>
          <div className="hidden md:block">
            <ZoneEmblem icon={zone.icon} color={zone.color} seed={idx} size={300} />
          </div>
        </div>

        {/* key points */}
        <motion.div variants={{ show: { transition: { staggerChildren: 0.06 } } }} initial="hidden" whileInView="show" viewport={viewport} style={{ marginTop: 56 }}>
          <motion.div variants={rise} className="eyebrow" style={{ fontSize: 11, letterSpacing: '0.4em', marginBottom: 18 }}>Key points</motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {detail.points.map((p) => (
              <motion.div key={p} variants={rise} className="flex items-start gap-3" style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(15,22,18,0.4)' }}>
                <span style={{ marginTop: 6, width: 6, height: 6, borderRadius: 2, background: zone.color, flexShrink: 0 }} />
                <span className="font-display" style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--text)', opacity: 0.86 }}>{p}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* two-asset block */}
        {showTwoAssets && (
          <motion.div variants={{ show: { transition: { staggerChildren: 0.08 } } }} initial="hidden" whileInView="show" viewport={viewport} style={{ marginTop: 48 }}>
            <motion.div variants={rise} className="eyebrow" style={{ fontSize: 11, letterSpacing: '0.4em', marginBottom: 18 }}>One launch · two assets</motion.div>
            <TwoAssets />
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.7, ease }} style={{ marginTop: 52, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {zone.id === 'curators' ? (
            <CTA primary href={OFFICIAL_LINKS.becomeCurator}>Become a Curator</CTA>
          ) : (
            <CTA primary href={OFFICIAL_LINKS.prosperX}>Join the Community</CTA>
          )}
          <CTA to="/journey">See the flow</CTA>
        </motion.div>

        {/* prev / next */}
        <div className="flex items-center justify-between" style={{ marginTop: 64, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
          <button disabled={!prev} onClick={() => { if (prev) { click(); navigate(`/zone/${prev.id}`); } }} className="pressable" style={{ background: 'none', border: 'none', textAlign: 'left', cursor: prev ? 'pointer' : 'default', opacity: prev ? 1 : 0.3 }}>
            <div className="font-mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--mist)', textTransform: 'uppercase' }}>← Prev</div>
            <div className="font-head" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-hi)' }}>{prev?.label ?? ''}</div>
          </button>
          <button disabled={!next} onClick={() => { if (next) { click(); navigate(`/zone/${next.id}`); } }} className="pressable" style={{ background: 'none', border: 'none', textAlign: 'right', cursor: next ? 'pointer' : 'default', opacity: next ? 1 : 0.3 }}>
            <div className="font-mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--mist)', textTransform: 'uppercase' }}>Next →</div>
            <div className="font-head" style={{ fontSize: 15, fontWeight: 600, color: 'var(--primary)' }}>{next?.label ?? ''}</div>
          </button>
        </div>
      </Container>
    </div>
  );
}
