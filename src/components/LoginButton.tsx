import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const LoginButton = () => {
  const { user, signIn, signOut } = useAuth();

  if (user) {
    return (
      <Button variant="outline" onClick={() => signOut()}>
        ログアウト
      </Button>
    );
  }

  return (
    <Button variant="default" onClick={() => signIn("github")}>
      GitHubでログイン
    </Button>
  );
};
