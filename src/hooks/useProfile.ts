import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      console.log("Current user:", user);
      console.log("User error:", userError);

      if (userError) throw userError;
      if (!user) throw new Error("ユーザーが見つかりません");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log("Profile data:", data);
      console.log("Profile error:", error);

      if (error) {
        if (error.code === "PGRST116") {
          console.log("Creating new profile...");
          // プロフィールが存在しない場合は新規作成
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert([
              {
                id: user.id,
                display_name: user.user_metadata.full_name || null,
                avatar_url: user.user_metadata.avatar_url || null,
              },
            ])
            .select()
            .single();

          console.log("New profile:", newProfile);
          console.log("Create error:", createError);

          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Profile error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "プロフィールの取得に失敗しました";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      console.log("Current user:", user);
      console.log("User error:", userError);

      if (userError) throw userError;
      if (!user) throw new Error("ユーザーが見つかりません");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      console.log("Update error:", error);

      if (error) {
        if (error.code === "PGRST116") {
          console.log("Creating new profile...");
          // プロフィールが存在しない場合は新規作成
          const { error: createError } = await supabase
            .from("profiles")
            .insert([
              {
                id: user.id,
                ...updates,
              },
            ]);

          console.log("Create error:", createError);
          if (createError) throw createError;
        } else {
          throw error;
        }
      }

      // プロフィールを再取得
      await fetchProfile();
    } catch (err) {
      console.error("Update error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "プロフィールの更新に失敗しました";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
}
