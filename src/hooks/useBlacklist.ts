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

export type SortField = "created_at" | "player_name";
export type SortOrder = "asc" | "desc";

const ITEMS_PER_PAGE = 10;

export const useBlacklist = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ブラックリストの取得
  const fetchEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from("blacklist")
        .select("*", { count: "exact" })
        .eq("user_id", user.id);

      // 検索条件の適用
      if (searchQuery) {
        query = query.or(
          `player_id.ilike.%${searchQuery}%,player_name.ilike.%${searchQuery}%,reason.ilike.%${searchQuery}%`
        );
      }

      // 並び替えの適用
      query = query.order(sortField, { ascending: sortOrder === "asc" });

      // ページネーションの適用
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      setEntries(data || []);
      setTotalCount(count || 0);
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

  // 検索条件の更新
  const updateSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // 検索時は1ページ目に戻す
  };

  // 並び替えの更新
  const updateSort = (field: SortField) => {
    if (field === sortField) {
      // 同じフィールドの場合は順序を切り替え
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // 新しいフィールドの場合は降順で設定
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // ページの更新
  const updatePage = (page: number) => {
    setCurrentPage(page);
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
        reason: reason || "理由なし",
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

  // 初期データの取得と検索・並び替え条件の変更時の再取得
  useEffect(() => {
    if (user) {
      fetchEntries();
    } else {
      setEntries([]);
      setLoading(false);
    }
  }, [user, searchQuery, sortField, sortOrder, currentPage]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return {
    entries,
    loading,
    error,
    searchQuery,
    sortField,
    sortOrder,
    currentPage,
    totalPages,
    totalCount,
    addEntry,
    deleteEntry,
    updateSearch,
    updateSort,
    updatePage,
    refreshEntries: fetchEntries,
  };
};
