'use client';

import { DarkModeProvider } from '@/lib/darkModeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <DarkModeProvider>{children}</DarkModeProvider>;
}
