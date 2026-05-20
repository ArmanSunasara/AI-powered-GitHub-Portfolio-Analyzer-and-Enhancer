import { motion } from "framer-motion";
import BackButton from "../../components/BackButton";
import { routes } from "../../routes";

function ResumeGithubMatchPage({ navigate }) {
  return (
    <motion.section
      key="resume-github-match"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl"
    >
      <BackButton
        label="Back to Recruiter Tools"
        onClick={() => navigate(routes.recruiters)}
      />
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">
          Recruiter Feature
        </p>
        <h2 className="mt-3 text-2xl font-bold text-white">
          Resume vs GitHub Match
        </h2>
        <p className="mt-3 text-slate-400">
          This page is ready for resume upload, GitHub input, and match scoring.
        </p>
      </div>
    </motion.section>
  );
}

export default ResumeGithubMatchPage;
