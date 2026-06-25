'use client';

import type { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import AchievementLoginNotifier from './AchievementLoginNotifier';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300 ${
        isDarkMode
          ? 'bg-dark-background text-dark-text'
          : 'bg-brand-background text-brand-text'
      }`}
    >
      <Header />
      <AchievementLoginNotifier />
      <main className="flex-1 w-full" role="main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
