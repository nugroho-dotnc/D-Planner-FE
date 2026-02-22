import { motion, useSpring, useTransform } from "motion/react";
function AuroraBackground({ mouseX, mouseY }) {
  // Smooth spring tracking - different stiffness per layer for parallax feel
  const x1 = useSpring(useTransform(mouseX, [0, 1], ["-15%", "15%"]), { stiffness: 40, damping: 20 });
  const y1 = useSpring(useTransform(mouseY, [0, 1], ["-15%", "15%"]), { stiffness: 40, damping: 20 });

  const x2 = useSpring(useTransform(mouseX, [0, 1], ["10%", "-10%"]), { stiffness: 25, damping: 18 });
  const y2 = useSpring(useTransform(mouseY, [0, 1], ["10%", "-10%"]), { stiffness: 25, damping: 18 });

  const x3 = useSpring(useTransform(mouseX, [0, 1], ["-8%", "8%"]), { stiffness: 55, damping: 22 });
  const y3 = useSpring(useTransform(mouseY, [0, 1], ["-8%", "8%"]), { stiffness: 55, damping: 22 });

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#0B1220]">
      {/* Layer 1 - Indigo, follows cursor most */}
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, #6366F1 0%, transparent 70%)",
          filter: "blur(120px)",
          x: x1,
          y: y1,
        }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 2 - Blue, opposite direction / slower */}
      <motion.div
        className="absolute bottom-[-10%] right-[-5%] w-[70vw] h-[70vw] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, #2563EB 0%, transparent 70%)",
          filter: "blur(100px)",
          x: x2,
          y: y2,
        }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 3 - Green, fastest response */}
      <motion.div
        className="absolute top-[20%] right-[10%] w-[50vw] h-[50vw] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #10B981 0%, transparent 70%)",
          filter: "blur(90px)",
          x: x3,
          y: y3,
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle cursor glow that follows exactly */}
      <motion.div
        className="absolute w-[30vw] h-[30vw] rounded-full pointer-events-none opacity-10"
        style={{
          background: "radial-gradient(circle, #a5b4fc 0%, transparent 70%)",
          filter: "blur(60px)",
          x: useSpring(useTransform(mouseX, [0, 1], ["-15vw", "85vw"]), { stiffness: 120, damping: 25 }),
          y: useSpring(useTransform(mouseY, [0, 1], ["-15vh", "85vh"]), { stiffness: 120, damping: 25 }),
        }}
      />
    </div>
  );
}
export default AuroraBackground;