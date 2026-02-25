import { motion } from "framer-motion";
import { FiStar, FiGitCommit, FiFileText, FiCode, FiExternalLink } from "react-icons/fi";

function RepoCard({ repo, index = 0, username }) {
  const repoUrl = username
    ? `https://github.com/${username}/${repo.name}`
    : `https://github.com/search?q=${repo.name}`;

  return (
    <motion.a
      href={repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group block bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 p-5 rounded-xl hover:border-blue-500/40 hover:bg-slate-800/80 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate mr-2">
          {repo.name}
        </h3>
        <FiExternalLink className="text-gray-600 group-hover:text-blue-400 transition-colors shrink-0 mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-gray-400">
          <FiStar className="text-yellow-500 shrink-0" />
          <span className="text-sm">{repo.stars} stars</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <FiGitCommit className="text-blue-400 shrink-0" />
          <span className="text-sm">{repo.commitCount} commits</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <FiFileText className={`shrink-0 ${repo.hasReadme ? "text-green-400" : "text-red-400"}`} />
          <span className="text-sm">
            README: {repo.hasReadme ? "Yes" : "Missing"}
          </span>
        </div>
        {repo.languages && repo.languages.length > 0 && (
          <div className="flex items-center gap-2 text-gray-400">
            <FiCode className="text-purple-400 shrink-0" />
            <span className="text-sm truncate">{repo.languages.join(", ")}</span>
          </div>
        )}
      </div>
    </motion.a>
  );
}

export default RepoCard;
