import { FiArrowRight } from "react-icons/fi";

const featureButtonClass =
  "group flex w-full items-start gap-4 rounded-xl border bg-slate-800/70 px-5 py-5 text-left shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-0.5";

function FeatureButton({ title, description, icon: Icon, onClick, accent }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${featureButtonClass} ${accent.border} ${accent.hoverBg} ${accent.hoverBorder} ${accent.shadow}`}
    >
      <span className={`rounded-lg p-3 ${accent.iconBg} ${accent.iconText}`}>
        <Icon className="text-xl" />
      </span>
      <span className="flex-1">
        <span className="block font-semibold text-white">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-400">
          {description}
        </span>
      </span>
      <FiArrowRight className="mt-1 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
    </button>
  );
}

export default FeatureButton;
