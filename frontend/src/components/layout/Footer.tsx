import { FC } from 'react';
import { Link } from 'react-router-dom';
import BrandLink from './BrandLink';

/** GitHub mark — inlined since this project pins an older lucide-react. */
const GithubMark: FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

export const Footer: FC = () => (
  <footer className="mt-20 border-t border-line bg-surface/40">
    <div className="container-app py-10">
      <div className="flex flex-col justify-between gap-8 md:flex-row">
        <div className="max-w-xs">
          <BrandLink />
          <p className="mt-3 text-sm leading-relaxed text-ink-muted text-pretty">
            A calm, literate companion for reading the markets — built to help
            you understand what's moving and why, not to push trades.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
          <div>
            <div className="eyebrow mb-3">Product</div>
            <ul className="space-y-2 text-ink-secondary">
              <li><Link to="/" className="hover:text-ink">Dashboard</Link></li>
              <li><Link to="/markets" className="hover:text-ink">Markets</Link></li>
              <li><Link to="/portfolio" className="hover:text-ink">Portfolio</Link></li>
              <li><Link to="/insights" className="hover:text-ink">Insights</Link></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-3">Craft</div>
            <ul className="space-y-2 text-ink-secondary">
              <li><Link to="/design-system" className="hover:text-ink">Design system</Link></li>
              <li><Link to="/insights" className="hover:text-ink">How the AI works</Link></li>
              <li>
                <a href="/case-study/index.html" target="_blank" rel="noreferrer" className="hover:text-ink">
                  Case study
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-3">Connect</div>
            <ul className="space-y-2 text-ink-secondary">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-ink"
                >
                  <GithubMark size={14} /> GitHub
                </a>
              </li>
              <li>
                <a href="mailto:cheruvathoorshaj.d@northeastern.edu" className="hover:text-ink">
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row sm:items-center">
        <span>© {new Date().getFullYear()} Fluxus Fisci · Designed & built by Dennis Sharon · Not financial advice.</span>
        <span>FastAPI · React · TypeScript · Tailwind · Recharts</span>
      </div>
    </div>
  </footer>
);

export default Footer;
