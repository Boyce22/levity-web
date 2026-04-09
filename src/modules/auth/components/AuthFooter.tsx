import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";

interface AuthFooterProps {
  mode: "login" | "register";
  isLoading: boolean;
  toggleMode: () => void;
}

export function AuthFooter({ mode, isLoading, toggleMode }: AuthFooterProps) {
  const isRegister = mode === "register";

  return (
    <>
      <motion.button
        layout
        type="submit"
        disabled={isLoading}
        className="flex items-center justify-center gap-2 w-full py-3 px-6 mt-8 rounded-sm text-white font-bold transition-all text-[14px] focus:ring-2 focus:ring-indigo-500/20 shadow-lg shadow-indigo-950/20"
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
        }}
        whileHover={{ filter: "brightness(1.15)", scale: 1.01 }}
        whileTap={{ scale: 0.985 }}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {isRegister ? "Initialize Workspace" : "Enter Workspace"}
            <ArrowRight className="w-4 h-4 ml-1 opacity-50" />
          </>
        )}
      </motion.button>

      <motion.div layout className="mt-8 text-center text-[12px] font-medium">
        <span className="text-[var(--app-text-muted)] opacity-60">
          {isRegister
            ? "Already have an account?"
            : "Don't have an account yet?"}
        </span>
        <button
          type="button"
          onClick={toggleMode}
          className="ml-2 text-indigo-400 hover:text-indigo-300 hover:brightness-125 font-bold transition-all"
        >
          {isRegister ? "Sign In" : "Create Account"}
        </button>
      </motion.div>
    </>
  );
}
