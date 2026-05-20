import { FiArrowLeft } from "react-icons/fi";

function BackButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white cursor-pointer"
    >
      <FiArrowLeft />
      {label}
    </button>
  );
}

export default BackButton;
