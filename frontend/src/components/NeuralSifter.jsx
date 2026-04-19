import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function SifterColumn({ keywords }) {
  const defaultHex = ["0x0F", "SYS", "0", "1", "NULL", "VAR", "INT", "FLT", "0x8B", "0xAA", "DATA"];
  const parsedKeywords = keywords ? keywords.split(" ").filter(k => k.trim()) : [];
  const allWords = [...defaultHex, ...parsedKeywords];
  
  const [stream, setStream] = useState([]);
  
  useEffect(() => {
    // Generate height per column
    const len = 10 + Math.floor(Math.random() * 8);
    const arr = Array.from({ length: len }).map(() => allWords[Math.floor(Math.random() * allWords.length)]);
    setStream(arr);
  }, [keywords]);

  // Randomize speed and start position for organic stagger
  const speed = 1.5 + Math.random() * 2;
  const startDelay = Math.random() * -2;

  return (
    <motion.div 
      initial={{ y: "-100%" }} 
      animate={{ y: "150%" }}
      transition={{ duration: speed, delay: startDelay, repeat: Infinity, ease: "linear" }}
      className="flex flex-col items-center gap-3 w-8"
    >
      {stream.map((char, i) => {
        const isKey = parsedKeywords.includes(char);
        return (
          <span 
            key={i} 
            className={`text-[10px] font-mono uppercase tracking-widest block transform rotate-90 ${
              isKey 
                ? "opacity-100 text-[#2dd4bf] drop-shadow-[0_0_10px_rgba(45,212,191,0.8)] font-bold shadow-teal"
                : "opacity-20 text-[#2dd4bf] blur-[1px]"
            }`}
          >
            {char}
          </span>
        );
      })}
    </motion.div>
  );
}

export default function NeuralSifter({ keywords }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      className="absolute inset-0 z-50 bg-black/95 backdrop-blur-[8px] flex justify-center gap-4 sm:gap-8 overflow-hidden rounded-sm"
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <SifterColumn key={i} keywords={keywords} />
      ))}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40">
        <h3 className="text-[#2dd4bf] font-mono tracking-[0.3em] uppercase font-bold drop-shadow-[0_0_20px_rgba(45,212,191,1)] text-xl sm:text-2xl animate-pulse text-center">
          Engine Compiling
        </h3>
        <p className="text-[#2dd4bf]/50 font-mono tracking-widest text-[10px] uppercase mt-4">
          Parsing Neural Matrix
        </p>
      </div>
    </motion.div>
  );
}
