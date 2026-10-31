import {
  Database,
  Globe,
  Gauge,
  Network,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

export const landingStats = [
  { value: "99.99%", label: "Target infrastructure uptime" },
  { value: "30+ regions", label: "Global deployment options" },
  { value: "60 sec", label: "Typical instance deployment" },
  { value: "24 / 7", label: "Technical support available" },
];

export const workloadCards = [
  { icon: Gauge, title: "High-Performance Compute", text: "Power demanding applications with fast, dependable compute resources built for consistent performance." },
  { icon: Globe, title: "Global Data Centers", text: "Deploy closer to your users with geographically distributed infrastructure and flexible location options." },
  { icon: Zap, title: "Scalable Resources", text: "Adjust compute, storage, and capacity as your applications evolve, without unnecessary infrastructure complexity." },
  { icon: Shield, title: "Advanced Security", text: "Support your security strategy with controlled access, network protection, and infrastructure safeguards." },
  { icon: Network, title: "Reliable Networking", text: "Connect applications and services with dependable network connectivity designed for modern cloud environments." },
  { icon: Database, title: "Easy Management", text: "Provision and organize your cloud resources through a streamlined experience designed to simplify daily operations." },
];

export const developerFeatures = [
  { icon: Zap, title: "Fast Deployment", text: "Launch cloud servers in seconds. Get your projects up and running quickly with a streamlined deployment experience." },
  { icon: Sparkles, title: "Predictable Pricing", text: "Keep costs clear with simple pricing designed to help you plan your cloud spending without surprises." },
  { icon: Globe, title: "Global Infrastructure", text: "Deploy closer to your users worldwide with flexible infrastructure options designed for distributed applications." },
];

export const faqItems = [
  {
    question: "What is cloud computing?",
    answer: "Cloud computing lets you access computing resources such as servers, storage, and networking over the internet. With Northstar Cloud, you can deploy infrastructure on demand without managing physical hardware.",
    open: true,
  },
  {
    question: "How do I deploy a cloud server?",
    answer: "Choose your server configuration, select an operating system, and configure your preferred location. Once you confirm your settings, you can launch your cloud server and manage it from your cloud dashboard.",
  },
  {
    question: "Can I scale my resources anytime?",
    answer: "Yes. You can adjust your cloud resources as your workload changes. Available scaling options depend on your selected server plan and configuration, helping you adapt without infrastructure bottlenecks.",
  },
  {
    question: "How does cloud pricing work?",
    answer: "Cloud pricing is based on the resources and services you use. Depending on the plan, charges may include compute capacity, storage, networking, and additional services. Review your selected plan for its exact rates and billing terms.",
  },
  {
    question: "What support options are available?",
    answer: "You can access product documentation and troubleshooting resources to help manage your infrastructure. Additional support options may be available depending on your account and service plan.",
  },
];

export const footerColumns = {
  Platform: ["Cloud compute", "Pricing & plans", "Global infrastructure", "Security"],
  Resources: ["Documentation", "API reference", "Guides & tutorials", "Support center"],
  Company: ["About Northstar", "Careers", "Status", "Contact"],
};