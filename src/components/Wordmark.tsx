/**
 * The Prosper wordmark — the official gold serif logotype, recreated with Cinzel and a
 * vertical gold gradient (bright at the top, deep at the base) to match the brand mark.
 */
export function Wordmark({ size = 20, letterSpacing = '0.14em', style }: { size?: number | string; letterSpacing?: string; style?: React.CSSProperties }) {
  return (
    <span
      style={{
        fontFamily: 'Cinzel, serif',
        fontWeight: 600,
        fontSize: size,
        letterSpacing,
        lineHeight: 1,
        background: 'linear-gradient(180deg, #F6E7B4 0%, #E4C877 42%, #C9A24B 74%, #9A7A34 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        textShadow: '0 1px 18px rgba(228,200,119,0.18)',
        display: 'inline-block',
        userSelect: 'none',
        ...style,
      }}
    >
      PROSPER
    </span>
  );
}
