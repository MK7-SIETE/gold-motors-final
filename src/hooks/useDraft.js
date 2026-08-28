import { useEffect, useRef } from 'react';

const DEBOUNCE_MS = 500;

// Saves a value to localStorage under `key`, wrapped with a timestamp so
// callers can show "restored from X minutes ago".
export function saveDraft(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify({ value, savedAt: Date.now() }));
  } catch {
    // storage full or unavailable — safe to ignore, the form still works
  }
}

// Returns { value, savedAt } or null if nothing is saved / storage is unavailable.
export function loadDraft(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// Roughly formats how long ago a timestamp was, for a restored-draft message.
export function timeAgo(ts) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 minute ago';
  if (mins < 60) return mins + ' minutes ago';
  const hours = Math.round(mins / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return hours + ' hours ago';
  return 'a while ago';
}

// Debounce-saves `value` to localStorage under `key` whenever it changes.
// Pass enabled=false to skip saving entirely — e.g. while editing an existing
// record, where you don't want a stale "add car" draft interfering.
export function useDraft(key, value, enabled = true) {
  const timer = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => saveDraft(key, value), DEBOUNCE_MS);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value, enabled]);
}
