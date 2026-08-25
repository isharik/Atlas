import { useAudio } from '@/audio/AudioProvider';
import { IconSoundOn, IconSoundOff } from './ui/icons';

/** Click-sound on/off. */
export function SoundControl() {
  const { enabled, toggle, click } = useAudio();
  return (
    <button
      onClick={() => { if (!enabled) toggle(); else { click(); toggle(); } }}
      className="pressable hover-gold"
      aria-label={enabled ? 'Mute sound' : 'Unmute sound'}
      title={enabled ? 'Sound on' : 'Sound off'}
      style={{ width: 34, height: 34, borderRadius: 999, display: 'grid', placeItems: 'center', border: '1px solid var(--border)', background: 'rgba(13,19,16,0.5)', color: enabled ? 'var(--primary)' : 'var(--mist)', cursor: 'pointer' }}
    >
      {enabled ? <IconSoundOn size={15} /> : <IconSoundOff size={15} />}
    </button>
  );
}
