import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/ui/primitives/Button";

interface AuthFooterProps {
  mode: "login" | "register";
  isLoading: boolean;
  toggleMode: () => void;
}

export function AuthFooter({ mode, isLoading, toggleMode }: AuthFooterProps) {
  const isRegister = mode === "register";

  return (
    <>
      <div className="mt-8">
        <Button
          type="submit"
          isLoading={isLoading}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {isRegister ? "Initialize Workspace" : "Enter Workspace"}
          <ArrowRight className="ml-1 h-4 w-4 opacity-50" />
        </Button>
      </div>

      <motion.div layout className="mt-8 text-center text-[12px] font-medium">
        <span className="text-[var(--app-text-muted)] opacity-60">
          {isRegister
            ? "Already have an account?"
            : "Don't have an account yet?"}
        </span>
        <button
          type="button"
          onClick={toggleMode}
          className="ml-2 font-bold text-indigo-400 transition-all hover:text-indigo-300 hover:brightness-125"
        >
          {isRegister ? "Sign In" : "Create Account"}
        </button>
      </motion.div>
    </>
  );
}
