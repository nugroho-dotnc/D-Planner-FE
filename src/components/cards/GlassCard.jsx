function GlassCard({ children, className = "", ...props }) {
  return (
    <div
      className={`glass border border-white/10 bg-white/[0.03] backdrop-blur-[20px] p-8 md:p-12 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
export default GlassCard;