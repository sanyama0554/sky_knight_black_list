"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useBlacklist } from "@/hooks/useBlacklist";
import { useState } from "react";

export const BlacklistManager = () => {
  const {
    entries,
    loading,
    error: fetchError,
    addEntry,
    deleteEntry,
  } = useBlacklist();
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await addEntry(playerId, playerName, reason);
      setMessage("ブラックリストに追加しました");
      setPlayerId("");
      setPlayerName("");
      setReason("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ブラックリストの追加に失敗しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このエントリーを削除してもよろしいですか？")) return;

    try {
      await deleteEntry(id);
      setMessage("ブラックリストから削除しました");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ブラックリストの削除に失敗しました"
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ブラックリスト登録</CardTitle>
          <CardDescription>
            ブラックリストに追加するプレイヤー情報を入力してください
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="playerId">プレイヤーID</Label>
                <Input
                  id="playerId"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="playerName">プレイヤー名</Label>
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">理由</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "追加中..." : "追加"}
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ブラックリスト一覧</CardTitle>
          <CardDescription>登録済みのブラックリスト</CardDescription>
        </CardHeader>
        <CardContent>
          {fetchError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
          )}
          {loading ? (
            <p>読み込み中...</p>
          ) : entries.length === 0 ? (
            <p>ブラックリストに登録されているプレイヤーはいません。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>プレイヤーID</TableHead>
                  <TableHead>プレイヤー名</TableHead>
                  <TableHead>理由</TableHead>
                  <TableHead>登録日時</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.player_id}</TableCell>
                    <TableCell>{entry.player_name}</TableCell>
                    <TableCell>{entry.reason}</TableCell>
                    <TableCell>
                      {new Date(entry.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                      >
                        削除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
