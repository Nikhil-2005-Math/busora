import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BusoraLogo } from "../common/BusoraLogo";
import { KeralaBusSvg } from "../../assets/KeralaBusSvg";
import { FastForward } from "lucide-react";

interface AnimatedSplashScreenProps {
  onComplete: () => void;
  forcePlay?: boolean;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ onComplete, forcePlay = false }) => {
  const shouldReduceMotion = useReducedMotion();
  const [stage, setStage] = useState<"logo" | "tagline" | "bus" | "exiting">("logo");

  useEffect(() => {
    // If reduced motion is requested by user OS settings, complete immediately
    if (shouldReduceMotion) {
      onComplete();
      return;
    }

    // Check session storage if not forced
    if (!forcePlay && sessionStorage.getItem("busora_intro_played") === "true") {
      onComplete();
      return;
    }

    // Sequence stages:
    // 0.0s - Logo fades in
    // 0.6s - Tagline reveals
    // 1.2s - Kerala Bus enters from left and drives across
    // 3.4s - Transition out
    const timerTagline = setTimeout(() => setStage("tagline"), 600);
    const timerBus = setTimeout(() => setStage("bus"), 1100);
    const timerExit = setTimeout(() => {
      setStage("exiting");
      sessionStorage.setItem("busora_intro_played", "true");
      setTimeout(onComplete, 400);
    }, 3500);

    return () => {
      clearTimeout(timerTagline);
      clearTimeout(timerBus);
      clearTimeout(timerExit);
    };
  }, [onComplete, forcePlay, shouldReduceMotion]);

  const handleSkip = () => {
    sessionStorage.setItem("busora_intro_played", "true");
    onComplete();
  };

  return (
    <AnimatePresence>
      {stage !== "exiting" && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.5, ease: "easeInOut" } }}
          className="fixed inset-0 z-50 flex flex-col justify-between bg-white text-slate-800 overflow-hidden select-none"
        >
          {/* Top Bar with Skip Button */}
          <div className="w-full flex justify-end p-6 z-20">
            <button
              onClick={handleSkip}
              className="group flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm text-xs font-semibold text-slate-600 hover:text-[#1565C0] hover:border-[#1565C0] transition shadow-sm"
              aria-label="Skip Introduction Animation"
            >
              <span>Skip Intro</span>
              <FastForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Central Logo & Tagline Area */}
          <div className="flex-1 flex flex-col items-center justify-center -mt-10 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <BusoraLogo size="xl" clickable={false} />
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-4 text-center"
            >
              <p className="text-sm md:text-base font-semibold tracking-widest text-[#0D2B52]/80 uppercase">
                Every Bus. <span className="text-[#1565C0]">Every Stop.</span> Every Minute.
              </p>
              <p className="text-xs font-medium text-slate-600 mt-1">
                Kerala Smart Transit & Timetable Network
              </p>
            </motion.div>
          </div>

          {/* Bottom Bus Animated Drive Track with Road Markings */}
          <div className="relative w-full h-44 overflow-hidden flex flex-col justify-end">
            {/* Moving Kerala Bus */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "120%" }}
              transition={{
                delay: 1.0,
                duration: 2.4,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              className="w-[280px] sm:w-[380px] md:w-[460px] pb-3"
            >
              <KeralaBusSvg isDriving={true} className="w-full drop-shadow-2xl" />
            </motion.div>

            {/* Roadway & Asphalt */}
            <div className="w-full bg-[#1E293B] h-9 border-t-2 border-slate-700 relative flex items-center">
              {/* Dashed Road Markings */}
              <div
                className="w-full h-1 border-t-2 border-dashed border-yellow-400 opacity-80"
                style={{ backgroundSize: "40px" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
