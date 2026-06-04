import { motion } from "framer-motion";
import { FiArrowRight, FiZap, FiBriefcase } from "react-icons/fi";
import Container from "../ui/Container";
import Button from "../ui/Button";
import HeroPreview from "./HeroPreview";
import { routes } from "../../routes";

const stats = [
  { value: "<60s", label: "Per analysis" },
  { value: "5", label: "Focused tools" },
  { value: "100%", label: "Free for students" },
];

function Hero({ navigate }) {
  return (
    <section className="relative overflow-hidden">
      {/* Backdrop: grid + radial glows */}
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute -top-20 right-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse-glow" />

      <Container className="relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            <FiZap className="text-sm" />
            AI-powered GitHub reviews
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            See your GitHub the way a{" "}
            <span className="text-gradient">recruiter does</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400 lg:mx-0">
            Paste a profile and get a recruiter-style score, repo-by-repo
            feedback and clear next steps — in under 60 seconds. Built for
            students who want to stand out and recruiters who want to decide
            faster.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Button
              size="lg"
              className="group w-full sm:w-auto"
              iconRight={FiArrowRight}
              onClick={() => navigate(routes.ats)}
            >
              Analyze My Profile
            </Button>
            <Button
              size="lg"
              variant="secondary"
              icon={FiBriefcase}
              className="w-full sm:w-auto"
              onClick={() => navigate(routes.recruiters)}
            >
              I'm a Recruiter
            </Button>
          </div>

          {/* Trust stats */}
          <div className="mt-12 grid max-w-md grid-cols-3 gap-4 lg:mx-0">
            {stats.map((s) => (
              <div key={s.label} className="text-center lg:text-left">
                <p className="text-2xl font-bold text-white sm:text-3xl">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <HeroPreview />
        </motion.div>
      </Container>
    </section>
  );
}

export default Hero;
