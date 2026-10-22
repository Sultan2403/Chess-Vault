import { useNavigate } from "react-router-dom";
import { Platforms } from "@chess-vault/shared";
import { OnboardingModal } from "../components/onboarding/OnboardingModal";
import { useConnectLinkedAccounts, useVerifyLinkedAccount } from "../hooks/useAccount";
import { useImportGames } from "../hooks/useGames";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const connectMutation = useConnectLinkedAccounts();
  const verificationMutation = useVerifyLinkedAccount();
  const importGamesMutation = useImportGames();

  return (
    <div className="min-h-screen bg-vault-background">
      <OnboardingModal
        isOpen
        required
        onClose={() => navigate("/dashboard", { replace: true })}
        onVerifyAccount={(account) => verificationMutation.mutateAsync(account)}
        onBeginSync={async ({ chessComUsername, lichessUsername }) => {
          const accounts: Array<{ platform: (typeof Platforms)[keyof typeof Platforms]; username: string }> = [];

          if (chessComUsername) {
            accounts.push({ platform: Platforms.CHESS_COM, username: chessComUsername });
          }
          if (lichessUsername) {
            accounts.push({ platform: Platforms.LICHESS, username: lichessUsername });
          }

          const result = await connectMutation.mutateAsync({ accounts });
          if (!result.success) {
            throw new Error(
              result.results
                .map((connection) => connection.message)
                .filter(Boolean)
                .join(" ") || result.message,
            );
          }

          // Trigger real BullMQ background imports for each connected account
          for (const acc of accounts) {
            try {
              await importGamesMutation.mutateAsync({
                platform: acc.platform,
                username: acc.username,
              });
            } catch (importErr) {
              console.error("Failed to queue import for", acc.platform, importErr);
            }
          }
        }}
      />
    </div>
  );
}

