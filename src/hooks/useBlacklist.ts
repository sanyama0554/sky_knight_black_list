"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export interface BlacklistEntry {
  id: string;
  user_id: string;
  player_id: string;
  player_name: string;
  reason: string;
  created_at: string;
}

export const useBlacklist = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ブラックリストの取得
  const fetchEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("blacklist")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error("Error fetching blacklist:", err);
      setError(
        err instanceof Error
          ? err.message
          : "ブラックリストの取得に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  // ブラックリストの追加
  const addEntry = async (
    playerId: string,
    playerName: string,
    reason: string
  ) => {
    if (!user) throw new Error("ログインが必要です");

    try {
      const { error } = await supabase.from("blacklist").insert({
        user_id: user.id,
        player_id: playerId,
        player_name: playerName,
        reason,
      });

      if (error) throw error;
      await fetchEntries();
    } catch (err) {
      console.error("Error adding blacklist entry:", err);
      throw err;
    }
  };

  // ブラックリストの削除
  const deleteEntry = async (id: string) => {
    if (!user) throw new Error("ログインが必要です");

    try {
      const { error } = await supabase
        .from("blacklist")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      await fetchEntries();
    } catch (err) {
      console.error("Error deleting blacklist entry:", err);
      throw err;
    }
  };

  // 初期データの取得
  useEffect(() => {
    if (user) {
      fetchEntries();
    } else {
      setEntries([]);
      setLoading(false);
    }
  }, [user]);

  return {
    entries,
    loading,
    error,
    addEntry,
    deleteEntry,
    refreshEntries: fetchEntries,
  };
};
