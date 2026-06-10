import React from 'react';
import { LanguageProvider } from '@site/src/context/LanguageContext';
import LanguageToggle from '@site/src/components/LanguageToggle';

export default function Root({ children }) {
  return (
    <LanguageProvider>
      {children}
      <div style={{
        position: 'fixed',
        top: '14px',
        right: '24px',
        zIndex: 1000,
      }}>
        <LanguageToggle />
      </div>
    </LanguageProvider>
  );
}
