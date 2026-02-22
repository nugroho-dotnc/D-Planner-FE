import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import GlassCard from "../../components/cards/GlassCard";
import AuroraBackground from "../../components/background/AuroraBackground";
import PremiumButton from "../../components/common/Premiumbutton";
import Navbar from "../../components/navigation/Navbar";

/* ─────────────────────────────────────────
   Sections
───────────────────────────────────────── */

function HeroSection() {
  const navigate = useNavigate();

  const handleLearnMore = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative w-full">
      <motion.div
        className="max-w-4xl md:max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2" />
          <span className="text-xs font-semibold tracking-widest text-white/50 uppercase">New Way of Planning</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] mb-8"
        >
          Plan your life <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
            as fast as you think.
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Turn scattered thoughts into a perfectly organized day.
          AI-powered planning that actually works the way you do.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <PremiumButton onClick={() => navigate("/login")}>Mulai Sekarang</PremiumButton>
          <PremiumButton variant="secondary" onClick={handleLearnMore}>Pelajari Lebih Lanjut</PremiumButton>
        </motion.div>
      </motion.div>
    </section>
  );
}

function ProblemSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section ref={ref} className="py-24 px-6 max-w-6xl mx-auto">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        initial={{ opacity: 0, y: 60 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">The mental load is real.</h2>
          <p className="text-white/60 text-lg leading-relaxed mb-8">
            Kenapa kamu butuh BESOK? Karena otakmu didesain untuk berpikir, bukan untuk mengingat list yang tidak ada habisnya.
            Terlalu banyak aplikasi, terlalu banyak keputusan.
          </p>
          <div className="space-y-4">
            {["Rencana hanya ada di kepala", "Malas buka-tutup banyak aplikasi", "Butuh jadwal instan, bukan manual input"].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center text-white/80"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.15, ease: "easeOut" }}
              >
                <svg className="w-5 h-5 text-indigo-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        <GlassCard className="rotate-3 flex flex-col items-center justify-center min-h-[300px]">
          <span className="text-6xl mb-4">🤯</span>
          <p className="text-center font-medium text-white/40 italic">"Gimana ya ngerjain tugas, kuis, rapat organisasi dalam satu hari?"</p>
        </GlassCard>
      </motion.div>
    </section>
  );
}

function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const steps = [
    { title: "Tulis rencanamu", desc: "Besok aku mau ngerjain tugas jam 7 malam", icon: "💬" },
    { title: "Kami susun otomatis", desc: "Jadwal dan task langsung terbentuk di kalender", icon: "🪄" },
    { title: "Tinggal lakukan", desc: "Fokus ke action, biarkan AI yang mikir detailnya", icon: "🚀" },
  ];

  return (
    <section id="how-it-works" ref={ref} className="py-24 px-6 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-4xl font-bold text-white mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Prompt. Review. Done.
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="p-8 rounded-3xl border border-white/5 bg-white/5"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.2, ease: "easeOut" }}
            >
              <span className="text-4xl block mb-6">{step.icon}</span>
              <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-white/50 leading-relaxed italic">"{step.desc}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PreviewSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section ref={ref} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, rotateX: 12 }}
          animate={inView ? { opacity: 1, rotateX: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformPerspective: 1000 }}
        >
          <div className="rounded-[40px] border border-white/10 bg-black/40 backdrop-blur-3xl overflow-hidden shadow-2xl">
            {/* Mock Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="text-white/20 font-bold text-sm tracking-widest">BESOK DASHBOARD</div>
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-white/10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] h-[500px]">
              {/* Sidebar */}
              <div className="hidden lg:block border-r border-white/10 p-6 space-y-6">
                <div className="h-4 w-32 bg-white/5 rounded" />
                <div className="space-y-3">
                  <div className="h-10 w-full bg-white/10 rounded-xl" />
                  <div className="h-10 w-full bg-white/5 rounded-xl" />
                  <div className="h-10 w-full bg-white/5 rounded-xl" />
                </div>
              </div>

              {/* Chat Area */}
              <div className="p-8 flex flex-col justify-end gap-6 bg-gradient-to-b from-transparent to-indigo-500/10">
                <div className="self-end bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[80%] text-sm shadow-lg">
                  Besok ada rapat jam 9 pagi, terus lanjut ngerjain revisi jurnal sampe sore.
                </div>
                <div className="self-start bg-white/10 text-white/80 p-4 rounded-2xl rounded-tl-none max-w-[80%] text-sm border border-white/10">
                  Roger that! Jadwal rapat & jurnal sudah masuk ke antrean. Saya bantu ingetin 15 menit sebelumnya ya. ✨
                </div>
              </div>

              {/* Tasks Area */}
              <div className="hidden lg:block border-l border-white/10 p-6 space-y-4">
                <h4 className="text-white font-bold text-xs mb-4">TODAY'S PLAN</h4>
                {[
                  { time: "09:00", task: "Rapat Koordinasi", active: true },
                  { time: "11:00", task: "Revisi Jurnal v2", active: false },
                  { time: "15:00", task: "Kirim File Jurnal", active: false },
                ].map((t, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${t.active ? 'border-indigo-500/50 bg-indigo-500/20' : 'border-white/5 bg-white/5 opacity-50'}`}>
                    <div className="text-[10px] font-bold text-indigo-400 mb-1">{t.time}</div>
                    <div className="text-sm text-white font-medium">{t.task}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section ref={ref} className="py-32 px-6 text-center">
      <motion.div
        className="inline-block relative"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-indigo-500 blur-[100px] opacity-20 -z-10" />
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 relative">
          Stop planning, <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
            start doing.
          </span>
        </h2>
            <PremiumButton onClick={() => navigate("/login")}>Mulai Sekarang</PremiumButton>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */

export default function Landing() {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX / window.innerWidth);
    mouseY.set(e.clientY / window.innerHeight);
  };

  return (
    <div
      className="text-white selection:bg-indigo-500/30"
      onMouseMove={handleMouseMove}
    >
      <style>{`body { background-color: #0B1220; }`}</style>

      <AuroraBackground mouseX={mouseX} mouseY={mouseY} />
      <Navbar />

      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <PreviewSection />
        <FinalCTASection />
      </main>

      <footer className="py-12 border-t border-white/5 text-center text-white/20 text-xs font-bold tracking-widest">
        © 2026 BESOK TECHNOLOGIES · DESIGNED FOR ACTION
      </footer>
    </div>
  );
}