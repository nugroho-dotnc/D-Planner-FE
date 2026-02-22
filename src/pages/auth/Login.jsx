import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, useMotionValue } from "motion/react";
import GlassCard from "../../components/cards/GlassCard";
import AuroraBackground from "../../components/background/AuroraBackground";
import PremiumButton from "../../components/common/Premiumbutton";
import Input from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX / window.innerWidth);
    mouseY.set(e.clientY / window.innerHeight);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    try {
      await login(email, password);
      // navigate('/dashboard') is called inside useAuth.login
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        "Login gagal. Periksa email dan password kamu.";
      setError(msg);
    }
  };

  return (
    <div
      className="min-h-screen text-white selection:bg-indigo-500/30 font-sans"
      onMouseMove={handleMouseMove}
    >
      <style>{`body { background-color: #0B1220; }`}</style>

      <AuroraBackground mouseX={mouseX} mouseY={mouseY} />

      <main className="min-h-screen pt-24 pb-12 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <GlassCard className="!p-8 md:!p-10 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-3xl -z-10" />

            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black tracking-widest text-indigo-400 uppercase mb-4"
              >
                Authentication
              </motion.div>
              <h1 className="text-3xl font-black tracking-tighter mb-2">Welcome Back</h1>
              <p className="text-white/40 text-sm">Continue your journey to productivity.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Input
                  label="Email Address"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                  }
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Input
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />
              </motion.div>

              {/* Error message */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
                >
                  {error}
                </motion.p>
              )}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-4"
              >
                <PremiumButton
                  className="w-full !py-4"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </PremiumButton>
              </motion.div>
            </form>

            <div className="mt-10 text-center">
              <p className="text-white/30 text-xs font-medium">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-white hover:text-indigo-400 font-bold transition-colors ml-1"
                >
                  Create for free
                </button>
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-8 text-center text-[10px] font-bold tracking-[0.2em] text-white/10 uppercase pointer-events-none">
        Besok Technologies · Secure Login
      </footer>
    </div>
  );
};

export default Login;