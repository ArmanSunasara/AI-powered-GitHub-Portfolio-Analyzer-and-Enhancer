import { motion } from "framer-motion";

function ScoreCard({ score }) {
  const getScoreColor = (s) => {
    if (s >= 80) return { text: "text-emerald-400", stroke: "#34d399", bg: "bg-emerald-400/10", label: "Excellent" };
    if (s >= 60) return { text: "text-yellow-400", stroke: "#facc15", bg: "bg-yellow-400/10", label: "Good" };
    if (s >= 40) return { text: "text-orange-400", stroke: "#fb923c", bg: "bg-orange-400/10", label: "Fair" };
    return { text: "text-red-400", stroke: "#f87171", bg: "bg-red-400/10", label: "Needs Work" };
  };

  const colors = getScoreColor(score);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center mb-10"
    >
      <h2 className="text-lg font-medium text-gray-400 mb-6 uppercase tracking-wider">
        Portfolio Score
      </h2>
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
          />
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-5xl font-bold ${colors.text}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-gray-500 text-sm">/ 100</span>
        </div>
      </div>
      <motion.span
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`mt-4 px-4 py-1.5 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}
      >
        {colors.label}
      </motion.span>
    </motion.div>
  );
}

export default ScoreCard;
