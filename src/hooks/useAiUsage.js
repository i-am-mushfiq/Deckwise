import { useState, useCallback } from 'react';
import { KEYS, lsLoad, lsSave } from '../lib.js';
import { todayGMT } from '../ai.js';

export function useAiUsage() {
  const [aiUsage, setAiUsage] = useState({ date: todayGMT(), count: 0 });

  const initAiUsage = useCallback(() => {
    const stored = lsLoad(KEYS.aiUsage, null);
    const today = todayGMT();
    setAiUsage(stored?.date === today ? stored : { date: today, count: 0 });
  }, []);

  const handleUsageUpdate = useCallback((cardCount, serverCount = null) => {
    setAiUsage(prev => {
      const today = todayGMT();
      const base = prev.date !== today ? 0 : prev.count;
      const newCount = serverCount !== null ? serverCount : base + cardCount;
      const next = { date: today, count: newCount };
      lsSave(KEYS.aiUsage, next);
      return next;
    });
  }, []);

  return { aiUsage, handleUsageUpdate, initAiUsage };
}
