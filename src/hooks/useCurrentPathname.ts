'use client';

import { useState, useEffect } from 'react';

export function useCurrentPathname(): string {
  const [pathname, setPathname] = useState('/');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  return pathname;
}
