import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputsProps {
  mode: "login" | "register";
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (val: boolean) => void;
  isLoading: boolean;
}

export function AuthInputs({
  mode,
  username,
  setUsername,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  isLoading,
}: AuthInputsProps) {
  const isRegister = mode === "register";

  return (
    <div className="space-y-4">
      <motion.div layout>
        <label
          className="block text-[11px] font-bold mb-1.5 text-[var(--app-text-muted)] ml-1 uppercase tracking-[0.1em] opacity-60"
          htmlFor="user"
        >
          Username
        </label>
        <input
          id="user"
          type="text"
          autoFocus
          className="w-full px-4 py-3 bg-[var(--app-bg)]/50 border border-[var(--app-border)] rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-[var(--app-text-muted)]/20 transition-all text-[14px] text-[var(--app-text)] disabled:opacity-50"
          placeholder="e.g. spaceman"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
      </motion.div>

      <motion.div layout>
        <label
          className="block text-[11px] font-bold mb-1.5 text-[var(--app-text-muted)] ml-1 uppercase tracking-[0.1em] opacity-60"
          htmlFor="pass"
        >
          Password
        </label>
        <div className="relative group">
          <input
            id="pass"
            type={showPassword ? "text" : "password"}
            className="w-full px-4 pr-11 py-3 bg-[var(--app-bg)]/50 border border-[var(--app-border)] rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-[var(--app-text-muted)]/20 transition-all text-[14px] text-[var(--app-text)] disabled:opacity-50"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isRegister && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <label
              className="block text-[11px] font-bold mb-1.5 text-[var(--app-text-muted)] ml-1 uppercase tracking-[0.1em] opacity-60"
              htmlFor="confirm-pass"
            >
              Confirm Password
            </label>
            <div className="relative group">
              <input
                id="confirm-pass"
                type={showConfirmPassword ? "text" : "password"}
                className="w-full px-4 pr-11 py-3 bg-[var(--app-bg)]/50 border border-[var(--app-border)] rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-[var(--app-text-muted)]/20 transition-all text-[14px] text-[var(--app-text)]"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
