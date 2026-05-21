import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiGithub } from "react-icons/fi";
import HomePage from "./HomePage";
import CandidateShortlistPage from "./hr/CandidateShortlistPage";
import GithubProfileComparePage from "./hr/GithubProfileComparePage";
import RecruiterToolsPage from "./hr/RecruiterToolsPage";
import ResumeGithubMatchPage from "./hr/ResumeGithubMatchPage";
import AtsScorePage from "./student/AtsScorePage";
import SpecializationFitPage from "./student/SpecializationFitPage";
import StudentToolsPage from "./student/StudentToolsPage";
import { getCurrentRoute, routes } from "../routes";

function Dashboard() {
  const [route, setRoute] = useState(getCurrentRoute);

  useEffect(() => {
    const handlePopState = () => setRoute(getCurrentRoute());

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setRoute(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (route) {
      case routes.students:
        return <StudentToolsPage navigate={navigate} />;
      case routes.ats:
        return <AtsScorePage navigate={navigate} />;
      case routes.specialization:
        return <SpecializationFitPage navigate={navigate} />;
      case routes.recruiters:
        return <RecruiterToolsPage navigate={navigate} />;
      case routes.shortlist:
        return <CandidateShortlistPage navigate={navigate} />;
      case routes.resumeGithub:
        return <ResumeGithubMatchPage navigate={navigate} />;
      case routes.githubCompare:
        return <GithubProfileComparePage navigate={navigate} />;
      case routes.home:
      default:
        return <HomePage navigate={navigate} />;
    }
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
        <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
      </main>

      <footer className="py-6 px-4 border-t border-slate-800">
        <p className="text-center text-gray-600 text-sm">
          GitHub Portfolio Analyzer - AI-Powered Recruiter Review
        </p>
      </footer>
    </div>
  );
}

export default Dashboard;
