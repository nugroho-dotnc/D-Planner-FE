import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, useMotionValue, AnimatePresence } from "motion/react";
import GlassCard from "../../components/cards/GlassCard";
import AuroraBackground from "../../components/background/AuroraBackground";
import PremiumButton from "../../components/common/Premiumbutton";
import Input from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [step,            setStep]            = useState(1);
  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error,           setError]           = useState("");

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX / window.innerWidth);
    mouseY.set(e.clientY / window.innerHeight);
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!name || !email) {
        setError("Nama dan email wajib diisi.");
        return;
      }
      setStep(2);
    } else {
      if (!password || !confirmPassword) {
        setError("Password dan konfirmasi password wajib diisi.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Password dan konfirmasi password tidak sama.");
        return;
      }
      try {
        await register(name, email, password, confirmPassword);
        // navigate('/dashboard') called inside useAuth.register
      } catch (err) {
        const msg =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          "Registrasi gagal. Silakan coba lagi.";
        setError(msg);
      }
    }
  };

  const handleBack = () => {
    setError("");
    setStep(1);
  };

  const stepVariants = {
    initial: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit:    (direction) => ({ x: direction > 0 ? -50 : 50, opacity: 0, transition: { duration: 0.4, ease: "easeIn" } }),
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
          <GlassCard className="!p-8 md:!p-10 relative overflow-hidden min-h-[520px] flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-3xl -z-10" />

            {/* Progress Bar */}
            <div className="flex gap-2 mb-10 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                initial={{ width: "0%" }}
                animate={{ width: step === 1 ? "50%" : "100%" }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
            </div>

            <div className="flex-1 flex flex-col">
              <AnimatePresence mode="wait" custom={step}>
                <motion.div
                  key={step}
                  custom={step}
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full flex-1 flex flex-col"
                >
                  {step === 1 ? (
                    <div className="flex-1 flex flex-col">
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-black tracking-tighter mb-2">Create Account</h1>
                        <p className="text-white/40 text-sm">Enter your details to get started.</p>
                      </div>

                      <form onSubmit={handleNext} className="space-y-5 flex-1 flex flex-col justify-center">
                        <Input
                          label="Full Name"
                          placeholder="Your name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          }
                        />
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
                        {error && (
                          <p className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>
                        )}
                        <PremiumButton className="w-full !py-4" onClick={handleNext}>
                          Continue
                        </PremiumButton>
                      </form>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col">
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-black tracking-tighter mb-2">Set Password</h1>
                        <p className="text-white/40 text-sm">Protect your productive journey.</p>
                      </div>

                      <form onSubmit={handleNext} className="space-y-5 flex-1 flex flex-col justify-center">
                        <Input
                          label="Password"
                          placeholder="Min. 8 characters"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          }
                        />
                        <Input
                          label="Confirm Password"
                          placeholder="••••••••"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          }
                        />
                        {error && (
                          <p className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>
                        )}
                        <div className="flex flex-col gap-3">
                          <PremiumButton
                            className="w-full !py-4"
                            onClick={handleNext}
                            disabled={loading}
                          >
                            {loading ? "Creating account..." : "Create Account"}
                          </PremiumButton>
                          <button
                            type="button"
                            onClick={handleBack}
                            className="text-[10px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-[0.2em]"
                          >
                            Back
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-8 text-center text-white/30 text-xs font-medium">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-white hover:text-indigo-400 font-bold transition-colors ml-1"
              >
                Log In
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-8 text-center text-[10px] font-bold tracking-[0.2em] text-white/10 uppercase pointer-events-none">
        Besok Technologies · User Registration
      </footer>
    </div>
  );
};

export default Register;