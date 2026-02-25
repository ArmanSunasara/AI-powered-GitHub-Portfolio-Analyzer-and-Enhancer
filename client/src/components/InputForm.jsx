import { useState } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiGithub } from "react-icons/fi";

function InputForm({ onAnalyze, loading }) {
  const [url, setUrl] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !loading) {
      onAnalyze(url.trim());
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="max-w-2xl mx-auto mb-12"
    >
      <div
        className={`flex items-center gap-3 bg-slate-800/80 backdrop-blur-sm border rounded-xl px-4 py-3 transition-all duration-300 ${
          focused
            ? "border-blue-500 shadow-lg shadow-blue-500/20"
            : "border-slate-700 hover:border-slate-600"
        }`}
      >
        <FiGithub className="text-gray-400 text-xl shrink-0" />
        <input
          type="text"
          className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-base"
          placeholder="Enter GitHub profile URL or username..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing</span>
            </div>
          ) : (
            <>
              <FiSearch className="text-lg" />
              <span>Analyze</span>
            </>
          )}
        </button>
      </div>
      <p className="text-center text-gray-500 text-sm mt-3">
        e.g., https://github.com/torvalds or just &quot;torvalds&quot;
      </p>
    </motion.form>
  );
}

export default InputForm;
