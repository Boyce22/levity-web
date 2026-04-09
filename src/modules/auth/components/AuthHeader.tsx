import { motion, AnimatePresence } from "framer-motion";
import { LevityLogo } from "@/modules/shared/components/LevityLogo";

interface AuthHeaderProps {
  mode: "login" | "register";
}

export function AuthHeader({ mode }: AuthHeaderProps) {
  const isRegister = mode === "register";

  return (
    <>
      <motion.div layoutId="auth-icon" className="flex justify-center mb-6">
        <div className="w-12 h-12 rounded-sm flex items-center justify-center">
          <LevityLogo size={48} />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold tracking-tight text-[var(--app-text)] mb-2">
            {isRegister ? "Join the network" : "Welcome back"}
          </h1>
          <p className="text-[13px] text-[var(--app-text-muted)] font-medium opacity-70 px-4">
            {isRegister
              ? "Create your identity to start building."
              : "Your workspace is ready and waiting."}
          </p>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
