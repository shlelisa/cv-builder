'use client';

import { useCallback, useState } from 'react';

export function useTouched() {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = useCallback((field: string) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);
  return { touched, markTouched };
}