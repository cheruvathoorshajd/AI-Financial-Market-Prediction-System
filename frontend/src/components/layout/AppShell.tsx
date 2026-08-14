import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import Footer from './Footer';
import CommandPalette from '../CommandPalette';
import RouteProgress from '../RouteProgress';
import DemoTour from '../DemoTour';

/** Chrome for the authenticated product surfaces (nav + content + footer). */
export const AppShell: FC = () => (
  <div className="flex min-h-screen flex-col bg-base">
    <RouteProgress />
    <CommandPalette />
    <DemoTour />
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#F7F8F5]"
    >
      Skip to content
    </a>
    <TopNav />
    <main
      id="main-content"
      className="container-app flex-1 py-[clamp(1.5rem,1rem_+_2vw,2.75rem)]"
    >
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default AppShell;
