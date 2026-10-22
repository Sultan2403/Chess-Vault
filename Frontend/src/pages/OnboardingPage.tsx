import { useNavigate } from "react-router-dom";
import { OnboardingModal } from "../components/onboarding/OnboardingModal";

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-vault-background">
      <OnboardingModal
        isOpen
        required
        onClose={() => navigate("/dashboard", { replace: true })}
        onSuccess={() => navigate("/dashboard", { replace: true })}
      />
    </div>
  );
}
