import { useState, useEffect } from "react";
import { motion } from "motion/react";
import PremiumButton from "../common/Premiumbutton";
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      animate={{
        background: scrolled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0)",
        backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
        borderBottomColor: scrolled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0)",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.2)" : "0 0px 0px rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      style={{ borderBottomWidth: 1, borderBottomStyle: "solid" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-black tracking-tighter text-white">BESOK.</div>
        {/* <div className="hidden md:flex gap-8 text-sm font-medium text-white/50">
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div> */}
        <PremiumButton onClick={() => window.location.href = "/login"} className="px-4! py-2! text-base! fo">Get Started</PremiumButton>
      </div>
    </motion.nav>
  );
}
export default Navbar;