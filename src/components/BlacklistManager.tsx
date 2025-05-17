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
import { useBlacklist, type SortField } from "@/hooks/useBlacklist";
import { ArrowUpDown, Loader2, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const BlacklistManager = () => {
  const {
    entries,
    loading,
    error: fetchError,
    searchQuery,
    sortField,
    sortOrder,
    addEntry,
    deleteEntry,
    updateSearch,
    updateSort,
  } = useBlacklist();
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await addEntry(playerId, playerName, reason);
      toast.success("ブラックリストに追加しました");
      setPlayerId("");
      setPlayerName("");
      setReason("");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "ブラックリストの追加に失敗しました";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このエントリーを削除してもよろしいですか？")) return;

    setDeletingId(id);
    try {
      await deleteEntry(id);
      toast.success("ブラックリストから削除しました");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "ブラックリストの削除に失敗しました";
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSort = (field: SortField) => {
    updateSort(field);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="playerId">プレイヤーID</Label>
                <Input
                  id="playerId"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="playerName">プレイヤー名</Label>
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">理由（任意）</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="ブラックリストに登録する理由を入力してください（任意）"
                disabled={isSubmitting}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  追加中...
                </>
              ) : (
                "追加"
              )}
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
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="プレイヤーID、プレイヤー名、理由で検索..."
                value={searchQuery}
                onChange={(e) => updateSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          {fetchError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery
                ? "検索条件に一致するプレイヤーが見つかりません。"
                : "ブラックリストに登録されているプレイヤーはいません。"}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>プレイヤーID</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("player_name")}
                        className="flex items-center gap-1"
                      >
                        プレイヤー名
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>理由</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("created_at")}
                        className="flex items-center gap-1"
                      >
                        登録日時
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[100px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono">
                        {entry.player_id}
                      </TableCell>
                      <TableCell>{entry.player_name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {entry.reason}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(entry.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                        >
                          {deletingId === entry.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
