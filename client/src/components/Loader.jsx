import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiFolder, FiCpu, FiCheckCircle } from "react-icons/fi";

const steps = [
  { icon: FiUser, label: "Fetching GitHub profile..." },
  { icon: FiFolder, label: "Analyzing repositories..." },
  { icon: FiCpu, label: "Generating AI feedback..." },
  { icon: FiCheckCircle, label: "Compiling results..." },
];

function Loader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mb-10"
    >
      <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isDone = index < currentStep;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0.4 }}
                  animate={{
                    opacity: isDone || isActive ? 1 : 0.4,
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-300 ${
                    isActive
                      ? "bg-blue-500/10 border border-blue-500/30"
                      : isDone
                      ? "bg-green-500/5"
                      : ""
                  }`}
                >
                  <Icon
                    className={`text-lg shrink-0 ${
                      isDone
                        ? "text-green-400"
                        : isActive
                        ? "text-blue-400"
                        : "text-gray-600"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      isDone
                        ? "text-green-400"
                        : isActive
                        ? "text-blue-300"
                        : "text-gray-600"
                    }`}
                  >
                    {isDone ? step.label.replace("...", " ✓") : step.label}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default Loader;
