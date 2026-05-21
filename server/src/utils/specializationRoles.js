/**
 * Display metadata for the specialization roles dropdown.
 *
 * Kept in sync by hand with ml-service/specialization/roles.py — the Python
 * side remains the source of truth for skills, expected projects, and scoring,
 * but the Node side serves the dropdown locally so the form keeps working
 * even if the ML service is briefly down.
 */
export const SPECIALIZATION_ROLES = [
  {
    id: "sde_faang",
    name: "SDE (FAANG)",
    category: "Software Engineering",
    summary: "Big Tech SDE with strong DSA + system design fundamentals.",
    faang_relevant: true,
  },
  {
    id: "backend_engineer",
    name: "Backend Engineer",
    category: "Software Engineering",
    summary: "Server-side engineer focused on APIs, data, and reliability.",
    faang_relevant: false,
  },
  {
    id: "frontend_engineer",
    name: "Frontend Engineer",
    category: "Software Engineering",
    summary: "Client-side engineer shipping polished, accessible UIs.",
    faang_relevant: false,
  },
  {
    id: "fullstack_engineer",
    name: "Full Stack Engineer",
    category: "Software Engineering",
    summary: "End-to-end product engineer shipping full features alone.",
    faang_relevant: false,
  },
  {
    id: "devops_engineer",
    name: "DevOps Engineer",
    category: "Infrastructure",
    summary: "Automates infra, deployments, and operations.",
    faang_relevant: false,
  },
  {
    id: "mlops_engineer",
    name: "MLOps Engineer",
    category: "ML / AI",
    summary: "Operationalizes ML — training, serving, monitoring.",
    faang_relevant: false,
  },
  {
    id: "ml_engineer",
    name: "ML Engineer",
    category: "ML / AI",
    summary: "Builds and trains production ML models.",
    faang_relevant: false,
  },
  {
    id: "ai_engineer",
    name: "AI Engineer",
    category: "ML / AI",
    summary: "Builds applications on top of LLMs and foundation models.",
    faang_relevant: false,
  },
  {
    id: "data_engineer",
    name: "Data Engineer",
    category: "Data",
    summary: "Builds reliable data pipelines and warehouses.",
    faang_relevant: false,
  },
  {
    id: "cybersecurity_engineer",
    name: "Cybersecurity Engineer",
    category: "Security",
    summary: "Defends and tests systems against attackers.",
    faang_relevant: false,
  },
  {
    id: "cloud_engineer",
    name: "Cloud Engineer",
    category: "Infrastructure",
    summary: "Designs and operates cloud infrastructure.",
    faang_relevant: false,
  },
  {
    id: "android_developer",
    name: "Android Developer",
    category: "Mobile",
    summary: "Ships native Android apps.",
    faang_relevant: false,
  },
  {
    id: "ios_developer",
    name: "iOS Developer",
    category: "Mobile",
    summary: "Ships native iOS apps.",
    faang_relevant: false,
  },
  {
    id: "blockchain_developer",
    name: "Blockchain Developer",
    category: "Web3",
    summary: "Builds decentralized apps and protocols.",
    faang_relevant: false,
  },
  {
    id: "game_developer",
    name: "Game Developer",
    category: "Games",
    summary: "Builds interactive games and engines.",
    faang_relevant: false,
  },
  {
    id: "embedded_engineer",
    name: "Embedded Engineer",
    category: "Hardware",
    summary: "Programs hardware-near systems.",
    faang_relevant: false,
  },
  {
    id: "sre",
    name: "Site Reliability Engineer",
    category: "Infrastructure",
    summary: "Keeps production reliable and observable.",
    faang_relevant: false,
  },
  {
    id: "platform_engineer",
    name: "Platform Engineer",
    category: "Infrastructure",
    summary: "Builds the platform other engineers ship on top of.",
    faang_relevant: false,
  },
  {
    id: "qa_automation",
    name: "QA Automation Engineer",
    category: "Quality",
    summary: "Automates testing across the stack.",
    faang_relevant: false,
  },
];
