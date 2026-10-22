import "../src/config/env.js";
import { prisma } from "../src/config/database.js";

const skills = [
  ["HTML", "Frontend development"],
  ["CSS", "Frontend development"],
  ["JavaScript", "Programming languages"],
  ["React", "Frontend development"],
  ["Flutter", "Mobile development"],
  ["Dart", "Programming languages"],
  ["Java", "Programming languages"],
  ["MySQL", "Databases"],
] as const;

const projects = [
  {
    title: "Student Exam Scheduler",
    slug: "student-exam-scheduling-system",
    shortDescription: "A university-focused application for managing student exam scheduling.",
    fullDescription: "A university-focused application for managing student exam scheduling. Feature details are intentionally omitted until they can be verified against the implementation.",
    problem: null,
    solution: null,
    features: [],
    technologies: ["Dart", "Flutter"],
    category: "Academic project",
    githubUrl: "https://github.com/mubarekcr7/ExamSchedulingSystem",
  },
  {
    title: "Banking Management System",
    slug: "banking-management-system",
    shortDescription: "A C++ banking management project from my public GitHub repositories.",
    fullDescription: "A banking management project. Feature details are not claimed here; see the public repository for the current source and implementation.",
    problem: null,
    solution: null,
    features: [],
    technologies: ["C++"],
    category: "Personal project",
    githubUrl: "https://github.com/mubarekcr7/banking_management",
  },
  {
    title: "University Management System",
    slug: "university-management-system",
    shortDescription: "A learning project for managing university-related entities and operations.",
    fullDescription: "A learning project exploring university management workflows. Dart is part of the stated technology direction; Flutter integration is planned as development progresses. Specific implemented features are intentionally left unclaimed until confirmed.",
    problem: null,
    solution: null,
    features: [],
    technologies: ["Dart"],
    category: "Learning project",
  },
  {
    title: "AI-Based Surgical Monitoring System",
    slug: "ai-based-surgical-monitoring-system",
    shortDescription: "An ongoing, development-stage prototype concept for AI-assisted surgical workflow monitoring.",
    fullDescription: "A prototype concept exploring AI-assisted surgical workflow monitoring, patient-monitoring integration, alerts, and instrument-counting support. This project is not clinically validated and must not be used to guide patient care.",
    problem: null,
    solution: null,
    features: [],
    technologies: [],
    category: "Prototype concept",
    githubUrl: "https://github.com/mubarekcr7/ai_based_monitoring",
  },
] as const;

async function main(): Promise<void> {
  await prisma.profile.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      name: "Mubarek Mohammed",
      professionalTitle: "Software Engineering Student | Aspiring Full-Stack Developer",
      biography: "I am a Software Engineering student at Wolkite University with a strong interest in web and mobile application development. I work with HTML, CSS, JavaScript, React, Flutter, Dart, Java, and MySQL. I enjoy solving problems, building useful digital products, and continuously improving my technical skills through practical projects.",
      email: process.env.PUBLIC_CONTACT_EMAIL || null,
      location: "Ethiopia",
      githubUrl: "https://github.com/mubarekcr7",
      linkedInUrl: process.env.PUBLIC_LINKEDIN_URL || null,
      resumeFile: process.env.PUBLIC_CV_URL || "https://raw.githubusercontent.com/mubarekcr7/my-cv/main/%2B123-456-7890.pdf",
    },
  });
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteTitle: "Mubarek Mohammed | Software Engineering Student",
      siteDescription: "Software Engineering student at Wolkite University, Ethiopia.",
      contactEmail: process.env.PUBLIC_CONTACT_EMAIL || null,
      socialLinks: { github: "https://github.com/mubarekcr7", ...(process.env.PUBLIC_LINKEDIN_URL ? { linkedIn: process.env.PUBLIC_LINKEDIN_URL } : {}) },
    },
  });
  for (const [index, [name, category]] of skills.entries()) {
    await prisma.skill.upsert({ where: { name }, update: {}, create: { name, category, displayOrder: index } });
  }
  await prisma.education.upsert({
    where: { id: "wolkite-university-software-engineering" },
    update: {},
    create: {
      id: "wolkite-university-software-engineering",
      institution: "Wolkite University",
      qualification: "Software Engineering studies",
      fieldOfStudy: "Software Engineering",
      description: "Currently studying. Dates and qualification details can be updated in the admin dashboard.",
      displayOrder: 0,
    },
  });
  for (const project of projects) {
    const isOngoing = [
      "student-exam-scheduling-system",
      "banking-management-system",
      "university-management-system",
      "ai-based-surgical-monitoring-system",
    ].includes(project.slug);
    await prisma.project.upsert({ where: { slug: project.slug }, update: {}, create: {
      ...project,
      features: [...project.features],
      technologies: [...project.technologies],
      status: isOngoing ? "IN_PROGRESS" : "DRAFT",
      featured: isOngoing,
    } });
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());