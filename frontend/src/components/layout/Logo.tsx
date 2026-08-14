import { FC } from 'react';
import { cn } from '../../lib/cn';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: number;
}

/**
 * Fluxus Fisci mark — a flow glyph (the "flux") rising over a ledger baseline,
 * with a single gilt point. Verdigris on paper, in the Patina palette.
 */
export const Logo: FC<LogoProps> = ({ className, showWordmark = true, size = 26 }) => (
  <span className={cn('inline-flex items-center gap-2.5', className)}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="#FBFBF9" />
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="8"
        stroke="#2F6F63"
        strokeOpacity="0.35"
      />
      {/* ledger baseline */}
      <path d="M6 23H26" stroke="#2F6F63" strokeOpacity="0.25" strokeWidth="1.4" strokeLinecap="round" />
      {/* the flux — a single quiet wave */}
      <path
        d="M6.5 19.5C9.5 19.5 10 9.5 14 9.5C18 9.5 17.5 19.5 21.5 19.5"
        stroke="#2F6F63"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* gilt point */}
      <circle cx="24.5" cy="10.5" r="2" fill="#B08D3C" />
    </svg>
    {showWordmark && (
      <span className="font-display text-[16px] font-medium tracking-tight text-ink">
        Fluxus <span className="text-ink-secondary">Fisci</span>
      </span>
    )}
  </span>
);

export default Logo;
