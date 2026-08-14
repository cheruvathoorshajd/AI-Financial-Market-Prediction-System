import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';

interface BrandLinkProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

/**
 * The Fluxus Fisci mark as one consistent link everywhere. A single rule:
 * signed-in readers go to the Dashboard (product home), signed-out visitors to
 * the landing. Every header and footer uses this so the brand never behaves
 * differently from one screen to the next.
 */
export const BrandLink: FC<BrandLinkProps> = ({ size, showWordmark, className }) => {
  const { user } = useAuth();
  return (
    <Link
      to={user ? '/' : '/onboarding'}
      aria-label="Fluxus Fisci — home"
      className={className}
    >
      <Logo size={size} showWordmark={showWordmark} />
    </Link>
  );
};

export default BrandLink;
