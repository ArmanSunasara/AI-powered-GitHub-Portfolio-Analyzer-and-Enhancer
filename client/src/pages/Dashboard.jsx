import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiGithub, FiRefreshCw } from "react-icons/fi";
import InputForm from "../components/InputForm";
import Loader from "../components/Loader";
import ProfileHeader from "../components/ProfileHeader";
import ScoreCard from "../components/ScoreCard";
import Feedback from "../components/Feedback";
import RepoCard from "../components/RepoCard";
import { analyzeGithubProfile } from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (url) => {
    setLoading(true);
    setError(null);
    setData(null);

    const result = await analyzeGithubProfile(url);

    if (result.success) {
      setData(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleReset = () => {
    setData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="pt-12 pb-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <FiGithub className="text-4xl text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Portfolio Analyzer
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            AI-powered recruiter review for your GitHub profile. Get actionable
            feedback in under 60 seconds.
          </p>
        </motion.div>
      </header>

      <main className="flex-1 px-4 pb-12">
        <InputForm onAnalyze={handleAnalyze} loading={loading} />

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-center">
                <p className="text-red-300 font-medium">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-3 text-sm text-red-400 hover:text-red-300 underline underline-offset-2 cursor-pointer"
                >
                  Try again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {data && (
          <div className="max-w-5xl mx-auto">
            <ProfileHeader data={data} />

            <ScoreCard score={data.score} />

            {data.aiFeedback && <Feedback feedback={data.aiFeedback} />}

            {data.repoAnalysis && data.repoAnalysis.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-6 text-gray-300 text-center uppercase tracking-wider">
                  Top Repositories
                </h2>
                <div className="grid md:grid-cols-2 gap-5">
                  {data.repoAnalysis.map((repo, i) => (
                    <RepoCard
                      key={repo.name}
                      repo={repo}
                      index={i}
                      username={data.username}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-gray-500 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 mb-10"
              >
                No public repositories were available to analyze.
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mt-10"
            >
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-gray-400 hover:text-white border border-slate-700 hover:border-blue-500/50 px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <FiRefreshCw />
                Analyze Another Profile
              </button>
            </motion.div>
          </div>
        )}
      </main>

      <footer className="py-6 px-4 border-t border-slate-800">
        <p className="text-center text-gray-600 text-sm">
          GitHub Portfolio Analyzer — AI-Powered Recruiter Review
        </p>
      </footer>
    </div>
  );
}
