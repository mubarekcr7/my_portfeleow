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
    shortDescription: "A Flutter exam-scheduling app for organizing university exams, courses, rooms, and teaching staff.",
    fullDescription: "The repository contains a Flutter app for Ethiopian university exam scheduling. Its exam-management screen captures exam and course details, dates, start and end times, rooms, capacity, instructors, and invigilators; students can view their registered exam schedule and drop an upcoming registration. The app uses Firebase Core and Cloud Firestore.",
    problem: null,
    solution: null,
    features: ["Manage exams, course codes, dates, rooms, capacity, instructors, and invigilators", "View registered exams and drop an upcoming registration"],
    technologies: ["Dart", "Flutter", "Firebase", "Cloud Firestore"],
    category: "Academic project",
    githubUrl: "https://github.com/mubarekcr7/exam-scheduler",
  },
  {
    title: "Exam Scheduling System",
    slug: "exam-scheduling-system",
    shortDescription: "A second academic implementation for exploring university exam scheduling workflows.",
    fullDescription: "An academic exam-scheduling project focused on organizing examinations and related university scheduling workflows. The repository is linked directly so visitors can review the implementation and its progress.",
    problem: null,
    solution: null,
    features: ["Explore exam scheduling workflows", "Review the academic implementation in GitHub"],
    technologies: ["Dart", "Flutter", "Firebase"],
    category: "Academic project",
    githubUrl: "https://github.com/mubarekcr7/ExamSchedulingSystem",
  },
  {
    title: "CareAudit",
    slug: "careaudit",
    shortDescription: "A personal project focused on surgical monitoring and care-audit workflows.",
    fullDescription: "CareAudit is the selected personal project for this portfolio, presenting the idea of surgical monitoring with a care-audit perspective. The repository remains the source of truth for the current implementation and progress.",
    problem: null,
    solution: null,
    features: ["Surgical monitoring concept", "Care-audit workflow exploration"],
    technologies: ["Software engineering", "Monitoring"],
    category: "Personal project",
    githubUrl: "https://github.com/mubarekcr7/CareAudit",
  },
  {
    title: "Exam Scheduling — Learning Track",
    slug: "exam-scheduling-learning-track",
    shortDescription: "A learning entry built from the same exam-scheduling work used in the academic projects.",
    fullDescription: "This learning entry intentionally points to the same exam-scheduling work used for the academic portfolio entries, making the connection between coursework and continued practice explicit.",
    problem: null,
    solution: null,
    features: ["Reuse academic work as a learning reference", "Track continued development through GitHub"],
    technologies: ["Dart", "Flutter", "Firebase"],
    category: "Learning project",
    githubUrl: "https://github.com/mubarekcr7/ExamSchedulingSystem",
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
      resumeFile: process.env.PUBLIC_CV_URL || "/Mubarek-Mohammed-CV.pdf",
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
  for (const [index, project] of projects.entries()) {
    const record = {
      ...project,
      features: [...project.features],
      technologies: [...project.technologies],
      status: "IN_PROGRESS" as const,
      featured: true,
      displayOrder: index,
    };
    await prisma.project.upsert({ where: { slug: project.slug }, update: record, create: record });
  }
  await prisma.project.updateMany({
    where: { slug: { in: ["banking-management-system", "university-management-system", "web-learning-portfolio"] } },
    data: { status: "DRAFT", featured: false },
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
