import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiGithub, FiMenu, FiX, FiArrowRight } from "react-icons/fi";
import Container from "../ui/Container";
import Button from "../ui/Button";
import { routes } from "../../routes";

/**
 * Sticky, responsive top navigation.
 *
 * - `navigate` comes from the SPA router in Dashboard.
 * - `scrollToSection` jumps to a landing section by id (and routes home first
 *   when the user is on a tool page).
 * - Section links use scrollToSection; "Home" and the CTA use navigate.
 */
function Navbar({ navigate, scrollToSection }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { label: "Home", action: () => navigate(routes.home) },
    { label: "How It Works", action: () => scrollToSection("how-it-works") },
    { label: "Features", action: () => scrollToSection("features") },
    { label: "About", action: () => scrollToSection("about") },
  ];

  const handleLink = (action) => {
    setOpen(false);
    action();
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <Container as="nav" aria-label="Primary" className="flex h-16 items-center justify-between">
        {/* Brand */}
        <button
          type="button"
          onClick={() => handleLink(() => navigate(routes.home))}
          className="group flex items-center gap-2.5 cursor-pointer"
          aria-label="Go to home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-indigo-600/30 transition-transform group-hover:scale-105">
            <FiGithub className="text-lg text-white" />
          </span>
          <span className="text-base font-bold tracking-tight text-white">
            Portfolio<span className="text-gradient">Analyzer</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => handleLink(link.action)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Button
            size="sm"
            className="group"
            iconRight={FiArrowRight}
            onClick={() => navigate(routes.ats)}
          >
            Analyze Profile
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg text-slate-200 transition-colors hover:bg-slate-800/60 md:hidden cursor-pointer"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
      </Container>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl md:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {links.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleLink(link.action)}
                  className="rounded-lg px-3 py-3 text-left text-base font-medium text-slate-200 transition-colors hover:bg-slate-800/60 hover:text-white cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
              <Button
                className="mt-2 w-full group"
                iconRight={FiArrowRight}
                onClick={() => handleLink(() => navigate(routes.ats))}
              >
                Analyze Profile
              </Button>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
