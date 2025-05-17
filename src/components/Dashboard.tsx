"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BlacklistManager } from "./BlacklistManager";

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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <Button variant="outline" onClick={signOut}>
          ログアウト
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>プロフィール</CardTitle>
            <CardDescription>アカウント情報の管理</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              メールアドレス: {user.email}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>設定</CardTitle>
            <CardDescription>アプリケーションの設定</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">設定機能は準備中です。</p>
          </CardContent>
        </Card>
      </div>

      <BlacklistManager />
    </div>
  );
};
