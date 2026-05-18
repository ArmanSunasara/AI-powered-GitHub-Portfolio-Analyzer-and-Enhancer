import { motion } from "framer-motion";
import { FiGithub, FiUsers, FiBookOpen, FiCalendar } from "react-icons/fi";

function ProfileHeader({ data }) {
  const joinYear = data.createdAt
    ? new Date(data.createdAt).getFullYear()
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row items-center gap-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-10"
    >
      {data.avatarUrl && (
        <img
          src={data.avatarUrl}
          alt={data.username}
          className="w-20 h-20 rounded-full ring-2 ring-blue-500/50 shrink-0"
        />
      )}

      <div className="flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
          <h2 className="text-2xl font-bold text-white">{data.username}</h2>
          <a
            href={`https://github.com/${data.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors"
          >
            <FiGithub />
          </a>
        </div>
        {data.bio && (
          <p className="text-gray-400 text-sm mb-3">{data.bio}</p>
        )}

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <FiBookOpen className="text-blue-400" />
            {data.publicRepos} repos
          </span>
          <span className="flex items-center gap-1.5">
            <FiUsers className="text-purple-400" />
            {data.followers} followers
          </span>
          <span className="flex items-center gap-1.5">
            <FiUsers className="text-gray-500" />
            {data.following} following
          </span>
          {joinYear && (
            <span className="flex items-center gap-1.5">
              <FiCalendar className="text-green-400" />
              Joined {joinYear}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ProfileHeader;
