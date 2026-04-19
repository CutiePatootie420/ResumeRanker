import { motion } from "framer-motion";

export default function ScanningBeam() {
  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-sm">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <motion.div 
        initial={{ top: "-10%" }}
        animate={{ top: "110%" }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[1px] bg-white shadow-[0_4px_10px_rgba(255,255,255,0.4)] z-10"
      >
        <div className="absolute inset-0 bg-white blur-[2px] translate-y-[-2px] h-[4px] opacity-70" />
      </motion.div>
    </div>
  );
}
