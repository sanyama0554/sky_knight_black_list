"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BlacklistManager } from "./BlacklistManager";
import { ProfileSettings } from "./ProfileSettings";

export const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <Button variant="outline" onClick={signOut}>
          ログアウト
        </Button>
      </div>

      <Tabs defaultValue="blacklist" className="space-y-4">
        <TabsList>
          <TabsTrigger value="blacklist">ブラックリスト</TabsTrigger>
          <TabsTrigger value="profile">プロフィール</TabsTrigger>
        </TabsList>
        <TabsContent value="blacklist">
          <BlacklistManager />
        </TabsContent>
        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
