import { motion } from "framer-motion";
import { FiCheckCircle, FiAlertTriangle, FiZap } from "react-icons/fi";

function Feedback({ feedback }) {
  if (!feedback) return null;

  const parseFeedback = (feedbackData) => {
    if (typeof feedbackData === "string") {
      try {
        return JSON.parse(feedbackData);
      } catch {
        return null;
      }
    }
    return feedbackData;
  };

  const parsed = parseFeedback(feedback);

  if (!parsed) return null;

  const sections = [
    {
      key: "strengths",
      title: "Strengths",
      items: parsed.strengths,
      icon: FiCheckCircle,
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgColor: "bg-emerald-500/5",
    },
    {
      key: "red_flags",
      title: "Red Flags",
      items: parsed.red_flags,
      icon: FiAlertTriangle,
      iconColor: "text-red-400",
      borderColor: "border-red-500/30",
      bgColor: "bg-red-500/5",
    },
    {
      key: "suggestions",
      title: "Action Plan",
      items: parsed.suggestions,
      icon: FiZap,
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-500/5",
      fullWidth: true,
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-10">
      {sections.map(
        (section, sectionIdx) =>
          section.items &&
          section.items.length > 0 && (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: sectionIdx * 0.15 }}
              className={`${section.bgColor} backdrop-blur-sm border ${section.borderColor} p-6 rounded-xl ${
                section.fullWidth ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <section.icon className={`text-xl ${section.iconColor}`} />
                <h3 className="text-lg font-semibold text-white">
                  {section.title}
                </h3>
                <span className="ml-auto text-xs text-gray-500 bg-slate-800 px-2 py-1 rounded-full">
                  {section.items.length} items
                </span>
              </div>
              <ul className="space-y-3">
                {section.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${section.iconColor.replace("text-", "bg-")} mt-2 shrink-0`}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )
      )}
    </div>
  );
}

export default Feedback;
