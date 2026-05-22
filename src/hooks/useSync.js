import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../supabase.js';
import { KEYS, lsLoad, lsSave } from '../lib.js';

export function useSync({
  library, completionMap, revisitIds, confusedIds, starredIds, progressMap,
  setLibrary, setCompletionMap, setRevisitIds, setConfusedIds, setStarredIds, setProgressMap,
  setMergeCandidate,
  userRef,
  DEMO_DATA,
}) {
  const [syncStatus, setSyncStatus] = useState("idle");
  const syncTimerRef = useRef(null);
  const cloudSyncEnabled = useRef(false);
  const hasPendingSync = useRef(false);

  // Writes current localStorage snapshot to Supabase immediately
  const syncNow = useCallback(async (userId) => {
    if (!supabase || !userId) return;
    const { error } = await supabase.from("user_data").upsert({
      user_id: userId,
      library: lsLoad(KEYS.library, DEMO_DATA),
      completion_map: lsLoad(KEYS.completion, {}),
      revisit_ids: lsLoad(KEYS.revisit, []),
      confused_ids: lsLoad(KEYS.confused, []),
      starred_ids: lsLoad(KEYS.starred, []),
      progress_map: lsLoad(KEYS.progress, {}),
      updated_at: new Date().toISOString()
    });
    if (error) console.error("syncNow error", error.message);
    if (!error) hasPendingSync.current = false;
    return error;
  }, [DEMO_DATA]);

  // Overwrites in-memory + localStorage state with cloud data
  const applyCloudData = useCallback((data) => {
    cloudSyncEnabled.current = false;
    if (data.library) { setLibrary(data.library); lsSave(KEYS.library, data.library); }
    if (data.completion_map) { setCompletionMap(data.completion_map); lsSave(KEYS.completion, data.completion_map); }
    if (data.revisit_ids) { setRevisitIds(data.revisit_ids); lsSave(KEYS.revisit, data.revisit_ids); }
    if (data.confused_ids) { setConfusedIds(data.confused_ids); lsSave(KEYS.confused, data.confused_ids); }
    if (data.starred_ids) { setStarredIds(data.starred_ids); lsSave(KEYS.starred, data.starred_ids); }
    if (data.progress_map) { setProgressMap(data.progress_map); lsSave(KEYS.progress, data.progress_map); }
    // Small delay before re-enabling sync to let React batch the state updates
    setTimeout(() => { cloudSyncEnabled.current = true; }, 600);
  }, [setLibrary, setCompletionMap, setRevisitIds, setConfusedIds, setStarredIds, setProgressMap]);

  const loadCloudData = useCallback(async (userId) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from("user_data").select("*").eq("user_id", userId).single();
      if (error && error.code !== "PGRST116") return; // PGRST116 = no rows found
      if (!data) {
        // First sign-in ever — push local data up and start syncing
        cloudSyncEnabled.current = true;
        await syncNow(userId);
        lsSave(`sl-synced-${userId}`, true);
        return;
      }
      // If this device has synced before with this account, just apply cloud — no conflict check
      const hasSyncedBefore = lsLoad(`sl-synced-${userId}`, false);
      if (hasSyncedBefore) {
        applyCloudData(data);
        return;
      }
      // First time this device has seen this account's cloud data — check for conflict
      const localLib = lsLoad(KEYS.library, null);
      const hasLocalData = localLib && JSON.stringify(localLib) !== JSON.stringify(DEMO_DATA);
      const hasLocalProgress = Object.keys(lsLoad(KEYS.completion, {})).length > 0;
      if (hasLocalData || hasLocalProgress) {
        setMergeCandidate(data); // Show merge choice modal
      } else {
        applyCloudData(data);
        lsSave(`sl-synced-${userId}`, true);
      }
    } catch (e) { console.error("load cloud error", e); }
  }, [syncNow, applyCloudData, setMergeCandidate, DEMO_DATA]);

  // Debounced cloud sync — 2 s after any data change
  useEffect(() => {
    if (!supabase || !userRef.current || !cloudSyncEnabled.current) return;
    hasPendingSync.current = true;
    setSyncStatus("pending");
    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      if (!userRef.current) return;
      setSyncStatus("syncing");
      const { error } = await supabase.from("user_data").upsert({
        user_id: userRef.current.id,
        library,
        completion_map: completionMap,
        revisit_ids: revisitIds,
        confused_ids: confusedIds,
        starred_ids: starredIds,
        progress_map: progressMap,
        updated_at: new Date().toISOString()
      });
      if (error) {
        console.error("sync error", error.message);
        // leave hasPendingSync.current = true so online handler retries
        setSyncStatus("error");
        setTimeout(() => setSyncStatus("pending"), 4000);
      } else {
        hasPendingSync.current = false;
        setSyncStatus("synced");
        setTimeout(() => setSyncStatus("idle"), 3000);
      }
    }, 2000);
    return () => clearTimeout(syncTimerRef.current);
  }, [library, completionMap, revisitIds, confusedIds, starredIds, progressMap]);

  // Online/offline event listeners for retry-on-reconnect
  useEffect(() => {
    const handleOnline = async () => {
      if (!hasPendingSync.current || !userRef.current) return;
      setSyncStatus('syncing');
      const error = await syncNow(userRef.current.id);
      if (error) {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('pending'), 4000);
      } else {
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    };
    const handleOffline = () => {
      if (hasPendingSync.current) setSyncStatus('offline');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncNow, userRef]);

  return { syncStatus, syncNow, cloudSyncEnabled, applyCloudData, loadCloudData };
}
