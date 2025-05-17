"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        try {
          const { user } = await signIn(email, password);
          if (user) {
            router.push("/dashboard");
          }
        } catch (err) {
          if (
            err instanceof Error &&
            err.message.includes("Email not confirmed")
          ) {
            setError(
              "メールアドレスの確認が完了していません。確認メールを再送信しますか？"
            );
            setMessage(
              "確認メールを再送信するには、新規登録から再度メールアドレスを入力してください。"
            );
          } else {
            throw err;
          }
        }
      } else {
        await signUp(email, password);
        setMessage(
          "確認メールを送信しました。メールに記載されたリンクをクリックして、登録を完了してください。"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "認証に失敗しました");
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{isLogin ? "ログイン" : "新規登録"}</CardTitle>
        <CardDescription>
          {isLogin
            ? "アカウントにログインしてください"
            : "新しいアカウントを作成してください"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full">
            {isLogin ? "ログイン" : "新規登録"}
          </Button>
          <div className="text-sm text-center">
            {isLogin ? (
              <>
                アカウントをお持ちでない方は
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-blue-500 hover:underline ml-1"
                >
                  新規登録
                </button>
              </>
            ) : (
              <>
                すでにアカウントをお持ちの方は
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-blue-500 hover:underline ml-1"
                >
                  ログイン
                </button>
              </>
            )}
          </div>
          {isLogin && (
            <div className="text-sm text-center">
              <Link
                href="/reset-password"
                className="text-blue-500 hover:underline"
              >
                パスワードをお忘れですか？
              </Link>
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};
