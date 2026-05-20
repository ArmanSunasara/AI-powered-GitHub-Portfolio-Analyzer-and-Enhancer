import { motion } from "framer-motion";
import { FiBriefcase, FiUsers } from "react-icons/fi";
import FeatureButton from "../components/FeatureButton";
import { routes } from "../routes";

function HomePage({ navigate }) {
  return (
    <motion.section
      key="home"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2"
    >
      <FeatureButton
        title="Student Tools"
        description="Improve your resume, GitHub profile, and career direction."
        icon={FiUsers}
        onClick={() => navigate(routes.students)}
        accent={{
          border: "border-blue-400/25",
          hoverBg: "hover:bg-blue-950/50",
          hoverBorder: "hover:border-blue-300/70",
          shadow: "hover:shadow-blue-500/10",
          iconBg: "bg-blue-500/15",
          iconText: "text-blue-300",
        }}
      />
      <FeatureButton
        title="Recruiter Tools"
        description="Shortlist, compare, and verify candidate portfolios faster."
        icon={FiBriefcase}
        onClick={() => navigate(routes.recruiters)}
        accent={{
          border: "border-purple-400/25",
          hoverBg: "hover:bg-purple-950/50",
          hoverBorder: "hover:border-purple-300/70",
          shadow: "hover:shadow-purple-500/10",
          iconBg: "bg-purple-500/15",
          iconText: "text-purple-300",
        }}
      />
    </motion.section>
  );
}

export default HomePage;
