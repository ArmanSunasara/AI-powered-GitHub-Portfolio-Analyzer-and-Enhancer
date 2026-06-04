import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import Container from "../ui/Container";
import Button from "../ui/Button";
import { routes } from "../../routes";

function CTABanner({ navigate }) {
  return (
    <section className="py-12 lg:py-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-blue-700/30 via-indigo-700/20 to-slate-900 px-6 py-14 text-center shadow-2xl shadow-indigo-950/40 sm:px-12"
        >
          {/* Glows */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to see how recruiters view your GitHub?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
              Get your score and a clear, prioritized plan in under a minute.
              No sign-up required.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
                className="w-full sm:w-auto"
                onClick={() => navigate(routes.recruiters)}
              >
                Browse Recruiter Tools
              </Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

export default CTABanner;
