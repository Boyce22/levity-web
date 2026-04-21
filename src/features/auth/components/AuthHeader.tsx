import { motion, AnimatePresence } from "framer-motion";
import { LevityLogo } from "@/ui/components/LevityLogo";

interface AuthHeaderProps {
  mode: "login" | "register";
}

export function AuthHeader({ mode }: AuthHeaderProps) {
  const isRegister = mode === "register";

  return (
    <>
      <motion.div layoutId="auth-icon" className="mb-6 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm">
          <LevityLogo size={48} />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-[var(--app-text)]">
            {isRegister ? "Join the network" : "Welcome back"}
          </h1>
          <p className="px-4 text-[13px] font-medium text-[var(--app-text-muted)] opacity-70">
            {isRegister
              ? "Create your identity to start building."
              : "Your workspace is ready and waiting."}
          </p>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
