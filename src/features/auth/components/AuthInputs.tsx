import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/ui/primitives/Input";

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
        <Input
          id="user"
          type="text"
          label="Username"
          autoFocus
          placeholder="e.g. spaceman"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
      </motion.div>

      <motion.div layout>
        <div className="group relative">
          <Input
            id="pass"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-[38px] right-3.5 p-1.5 text-slate-500 transition-colors hover:text-white"
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
            <div className="group relative">
              <Input
                id="confirm-pass"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-[38px] right-3.5 p-1.5 text-slate-500 transition-colors hover:text-white"
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
