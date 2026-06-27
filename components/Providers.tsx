'use client';

import { ThemeProvider } from 'next-themes';
import { ToasterProvider } from './ToasterProvider';
import { GoogleOAuthProviderWrapper } from './GoogleOAuthProvider';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProviderWrapper>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <ToasterProvider />
      </ThemeProvider>
    </GoogleOAuthProviderWrapper>
  );
}
