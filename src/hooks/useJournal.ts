import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { JournalEntry } from '../types';

export function useJournal(userId: string | undefined) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setEntries(data as JournalEntry[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addEntry(content: string, isPrivate: boolean) {
    if (!userId) return;
    await supabase.from('journal_entries').insert({ user_id: userId, content, is_private: isPrivate });
    await fetch();
  }

  async function togglePrivacy(id: string, isPrivate: boolean) {
    await supabase.from('journal_entries').update({ is_private: isPrivate }).eq('id', id);
    setEntries(prev => prev.map(e => e.id === id ? { ...e, is_private: isPrivate } : e));
  }

  return { entries, loading, addEntry, togglePrivacy };
}
