'use client';

import type {ReactNode} from 'react';
import { AppHeader } from './AppHeader';
import { Footer } from './Footer';

export function AppLayout({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title={title} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
