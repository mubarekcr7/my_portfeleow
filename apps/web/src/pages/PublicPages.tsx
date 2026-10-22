import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Code2, ExternalLink, GitFork, Github, GraduationCap, Mail, MapPin, Phone, Send, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, type Page, type Profile, type Project } from "../api";
import { EmptyState, ErrorState, Eyebrow, Loading, ProjectCard, SectionHeading } from "../components/UI";

const summary = "I am a Software Engineering student at Wolkite University with a strong interest in web and mobile application development. I work with HTML, CSS, JavaScript, React, Flutter, Dart, Java, and MySQL. I enjoy solving problems, building useful digital products, and continuously improving my technical skills through practical projects.";
const roles = ["Software Engineering Student", "Aspiring Full-Stack Developer", "Flutter Developer"];
const resumeDownloadUrl = `${import.meta.env.VITE_API_BASE ?? "/api/v1"}/resume`;
const fallbackSkills = [
  { id: "html", name: "HTML", category: "Frontend development", description: null },
  { id: "css", name: "CSS", category: "Frontend development", description: null },
  { id: "javascript", name: "JavaScript", category: "Programming languages", description: null },
  { id: "react", name: "React", category: "Frontend development", description: null },
  { id: "flutter", name: "Flutter", category: "Mobile development", description: null },
  { id: "dart", name: "Dart", category: "Programming languages", description: null },
  { id: "java", name: "Java", category: "Programming languages", description: null },
  { id: "mysql", name: "MySQL", category: "Databases", description: null },
];
type GithubRepository = { id: number; name: string; html_url: string; description: string | null; language: string | null; stargazers_count: number; forks_count: number; updated_at: string };
const useProfile = () => useQuery<Profile | null>({ queryKey: ["profile"], queryFn: () => api("/profile") });

export function HomePage(): React.JSX.Element {
  const profile = useProfile();
  const projects = useQuery<Page<Project>>({ queryKey: ["featured-projects"], queryFn: () => api("/projects?featured=true&limit=3") });
  const github = useQuery<GithubRepository[]>({ queryKey: ["github-repositories"], queryFn: () => api("/github/repositories"), staleTime: 60_000, refetchInterval: 60_000 });
  const name = profile.data?.name ?? "Mubarek Mohammed";
  const githubUrl = profile.data?.githubUrl || "https://github.com/mubarekcr7";
  const examRepository = github.data?.find((repository) => repository.name.toLowerCase() === "examschedulingsystem");
  const bankingRepository = github.data?.find((repository) => repository.name.toLowerCase() === "banking_management");
  const savedProjects = projects.data?.data ?? [];
  const showExamRepository = Boolean(examRepository && !savedProjects.some((project) => project.slug === "student-exam-scheduling-system"));
  const showBankingRepository = Boolean(bankingRepository && !savedProjects.some((project) => project.slug === "banking-management-system"));
  const showSurgicalConcept = !savedProjects.some((project) => project.slug === "ai-based-surgical-monitoring-system");
  const hasProjectFallback = showExamRepository || showBankingRepository || showSurgicalConcept;
  const greeting = `Hello, I’m ${name}.`;
  const greetingCharacters = Array.from(greeting);
  const [visibleGreetingCharacters, setVisibleGreetingCharacters] = useState(0);
  const reduceMotion = useReducedMotion();
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setVisibleGreetingCharacters(greetingCharacters.length);
      return;
    }
    setVisibleGreetingCharacters(0);
    const timer = window.setInterval(() => {
      setVisibleGreetingCharacters((current) => {
        if (current >= greetingCharacters.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 90);
    return () => window.clearInterval(timer);
  }, [greeting, reduceMotion]);
  useEffect(() => {
    const timer = window.setInterval(() => setRoleIndex((index) => (index + 1) % roles.length), 3600);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <section className="hero-section">
        <div className="hero-grid-bg" aria-hidden="true" />
        <div className="content-width hero-content">
          <div className="hero-copy">
            <Eyebrow>SOFTWARE ENGINEERING · ETHIOPIA</Eyebrow>
            <motion.h1 aria-label={greeting} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, ease: "easeOut" }}>
              <span className="greeting-first-line" aria-hidden="true">{greeting.slice(0, 10).slice(0, visibleGreetingCharacters)}{visibleGreetingCharacters <= 10 && visibleGreetingCharacters < greetingCharacters.length && <i className="typewriter-caret">|</i>}</span>
              <br />
              <span aria-hidden="true">{greeting.slice(10).slice(0, Math.max(0, visibleGreetingCharacters - 10))}{visibleGreetingCharacters > 10 && visibleGreetingCharacters < greetingCharacters.length && <i className="typewriter-caret">|</i>}</span>
            </motion.h1>
            <div className="role-line" aria-live="polite"><span className="role-line-bar" /><AnimatePresence mode="wait"><motion.span key={roleIndex} initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .25 }}>{roles[roleIndex]}</motion.span></AnimatePresence></div>
            <h2>Building digital<br />experiences through code<span className="blue-period">.</span></h2>
            <p className="hero-description">A student developer exploring the space between thoughtful design and useful software. Learning by building, one project at a time.</p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/projects">View my projects <ArrowUpRight size={16} /></Link>
              <Link className="button button-secondary" to="/contact">Contact me <ArrowUpRight size={16} /></Link>
              <a className="cv-link" href={resumeDownloadUrl}>Download CV <ArrowDown size={14} /></a>
            </div>
            <div className="hero-socials">
              <a href={githubUrl} target="_blank" rel="noreferrer"><Github size={16} /> GitHub <ArrowUpRight size={12} /></a>
              {profile.data?.linkedInUrl && <a href={profile.data.linkedInUrl} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={12} /></a>}
              <span><MapPin size={14} /> Ethiopia</span>
            </div>
          </div>
          <div className="hero-art" aria-label="Code-inspired profile illustration">
            <div className="hero-art-glow" />
            <div className="profile-monogram" aria-hidden="true"><span>MM</span><i>WKU · SE</i></div>
            <img className="profile-photo" src={profile.data?.profileImage || "/profile.jpg"} alt={name} onError={(event) => {
              const image = event.currentTarget;
              if (image.getAttribute("src") !== "/profile.jpg") {
                image.src = "/profile.jpg";
                return;
              }
              image.style.display = "none";
            }} />
            <div className="code-panel"><div className="code-panel-head"><span /><span /><span /><small>developer.ts</small></div><pre><code><b>const</b> builder = {'{'}<br />  curiosity: <em>true</em>,<br />  learning: <em>"always"</em>,<br />  focus: [<i>"web"</i>, <i>"mobile"</i>],<br />{'}'};</code></pre></div>
            <div className="hero-stamp"><Code2 size={16} /><span>IDEAS →<br />INTERFACES</span></div>
          </div>
          <a className="hero-scroll" href="#selected-work"><span>SCROLL TO EXPLORE</span><ArrowDown size={14} /></a>
        </div>
        <div className="hero-index eyebrow">PORTFOLIO <span>MM / 01</span></div>
      </section>

      <section className="intro-band">
        <div className="content-width intro-grid"><Eyebrow>01 / CURRENT CHAPTER</Eyebrow><p>Studying Software Engineering at <strong>Wolkite University</strong>, Ethiopia. I’m drawn to practical problems and the craft of turning an idea into something people can use.</p><GraduationCap size={28} strokeWidth={1.3} /></div>
      </section>

      <section className="content-width content-section" id="selected-work">
        <SectionHeading number="02" label="FROM THE WORKBENCH" title="Selected projects" description="Academic work and experiments. Project details are published as they’re verified and ready to share." />
        {projects.isPending && github.isPending ? <div className="skeleton-grid"><div /><div /><div /></div> : projects.isError && !hasProjectFallback ? <ErrorState onRetry={() => void projects.refetch()} /> : savedProjects.length || hasProjectFallback ? <div className="project-grid">{showExamRepository && examRepository && <GithubProjectCard repository={examRepository} title="Student Exam Scheduler" category="Academic project" index={0} />}{showBankingRepository && bankingRepository && <GithubProjectCard repository={bankingRepository} title="Banking Management System" category="Personal project" index={1} />}{showSurgicalConcept && <SurgicalConceptCard index={Number(showExamRepository) + Number(showBankingRepository)} />}{savedProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index + Number(showExamRepository) + Number(showBankingRepository) + Number(showSurgicalConcept)} />)}</div> : projects.isPending ? <div className="skeleton-grid"><div /><div /><div /></div> : <EmptyState title="Projects are being prepared" text="The project list is empty right now. Check back as work is documented and published." />}
        <div className="section-link-row"><Link className="underlined-link" to="/projects">Explore all projects <ArrowRight size={15} /></Link></div>
      </section>

      <section className="skills-strip"><div className="content-width skills-strip-inner"><Eyebrow>03 / TOOLS I’M LEARNING WITH</Eyebrow><div className="skill-wordmark-list">{["HTML", "CSS", "JavaScript", "React", "Flutter", "Dart", "Java", "MySQL"].map((skill) => <span key={skill}>{skill}</span>)}</div><Link to="/skills" aria-label="Explore all skills"><ArrowUpRight size={18} /></Link></div></section>

      <GithubSection repositories={github.data ?? []} githubUrl={githubUrl} loading={github.isPending} error={github.isError} />

      <section className="home-cta"><div className="content-width home-cta-inner"><Eyebrow>04 / YOUR NEXT IDEA</Eyebrow><h2>Let’s make<br />something useful<span className="blue-period">.</span></h2><Link className="button button-primary" to="/contact">Start a conversation <ArrowUpRight size={16} /></Link></div></section>
    </>
  );
}

function GithubProjectCard({ repository, title, category, index }: { repository: GithubRepository; title: string; category: string; index: number }): React.JSX.Element {
  const isExamScheduler = repository.name.toLowerCase() === "examschedulingsystem";
  const description = repository.name.toLowerCase() === "examschedulingsystem"
    ? "A university-focused application for managing student exam scheduling."
    : "A banking management project. Feature details are not claimed; see the repository for the current implementation.";
  const technologies = repository.name.toLowerCase() === "examschedulingsystem" ? ["Dart", "Flutter"] : [repository.language].filter((language): language is string => Boolean(language));
  return <article className="project-card" style={{ "--card-index": index } as React.CSSProperties}><a className="project-visual" href={repository.html_url} target="_blank" rel="noreferrer" aria-label={`Open ${title} on GitHub`}><div className="project-placeholder"><span>{category.toUpperCase()} / REPOSITORY</span><div className="code-mark">{isExamScheduler ? <>EXAM<br />SCHEDULER</> : <>BANKING<br />MANAGEMENT</>}</div><i /><b /></div><span className="project-open" aria-hidden="true"><ArrowUpRight size={18} /></span></a><div className="project-card-meta"><span className="eyebrow">{category.toUpperCase()} · GITHUB</span><a className="project-title-link" href={repository.html_url} target="_blank" rel="noreferrer"><h3>{title}</h3><ArrowUpRight size={16} /></a><p>{description}</p><div className="tag-list">{technologies.map((technology) => <span key={technology}>{technology}</span>)}<span>Source on GitHub</span></div>{isExamScheduler && <p className="project-reference"><span>PROJECT ID</span><code>GUBGMHVpwcTsPFvNNVdG5DKtpv6UwksAfzw5aULcGzgG</code></p>}</div></article>;
}

function SurgicalConceptCard({ index }: { index: number }): React.JSX.Element {
  const repositoryUrl = "https://github.com/mubarekcr7/ai_based_monitoring";
  return <article className="project-card" style={{ "--card-index": index } as React.CSSProperties}><a className="project-visual project-placeholder" href={repositoryUrl} target="_blank" rel="noreferrer" aria-label="Open AI-Based Surgical Monitoring System repository on GitHub"><span>PROTOTYPE / ONGOING</span><div className="code-mark">SURGICAL<br />MONITORING</div><i /><b /><span className="project-open" aria-hidden="true"><ArrowUpRight size={18} /></span></a><div className="project-card-meta"><span className="eyebrow">PROTOTYPE CONCEPT · IN PROGRESS</span><a className="project-title-link" href={repositoryUrl} target="_blank" rel="noreferrer"><h3>AI-Based Surgical Monitoring System</h3><ArrowUpRight size={16} /></a><p>A prototype concept for AI-assisted surgical workflow monitoring. Not clinically validated.</p><div className="tag-list"><span>Development stage</span><span>Not clinically validated</span></div></div></article>;
}

function GithubSection({ repositories, githubUrl, loading, error }: { repositories: GithubRepository[]; githubUrl: string; loading: boolean; error: boolean }): React.JSX.Element {
  return <section className="content-width github-section"><div className="github-head"><div><Eyebrow>OPEN SOURCE / LIVE FROM GITHUB</Eyebrow><h2>Code in the open<span className="blue-period">.</span></h2></div><a className="underlined-link" href={githubUrl} target="_blank" rel="noreferrer">Visit GitHub <ArrowUpRight size={15} /></a></div>
    {loading ? <Loading label="Fetching public repositories" /> : error ? <p className="subtle-note">GitHub is temporarily unavailable. The rest of the portfolio is unaffected.</p> : repositories.length === 0 ? <p className="subtle-note">No public repositories are currently available.</p> : <div className="repo-grid">{repositories.map((repository) => <a className="repo-card" href={repository.html_url} target="_blank" rel="noreferrer" key={repository.id}><div><Github size={17} /><ArrowUpRight size={14} /></div><h3>{repository.name}</h3><p>{repository.description || "No repository description provided."}</p><span>{repository.language || "Language not specified"} · {new Date(repository.updated_at).toLocaleDateString()}</span><div className="repo-stats"><span><Star size={12} />{repository.stargazers_count}</span><span><GitFork size={12} />{repository.forks_count}</span></div></a>)}</div>}
  </section>;
}

export function AboutPage(): React.JSX.Element {
  const profile = useProfile();
  return <PageFrame eyebrow="A LITTLE CONTEXT" title="A bit about me." lead={profile.data?.biography ?? summary}>
    <div className="about-page-grid"><div className="about-story"><Eyebrow>THE PATH SO FAR</Eyebrow><p>I’m studying Software Engineering at Wolkite University in Ethiopia. My interests span web and mobile application development, and I learn best by putting ideas into practice.</p><p>So far I’ve worked with HTML, CSS, JavaScript, React, Flutter, Dart, Java, and MySQL. I enjoy finding the shape of a problem, breaking it into manageable parts, and improving a solution through iteration.</p><p>My current goal is to keep building a strong foundation, document my projects honestly, and find opportunities to learn alongside experienced engineers.</p></div><aside className="about-note"><Sparkles size={18} /><span className="eyebrow">WHAT I VALUE</span><p>Useful over noisy.<br />Curiosity over certainty.<br />Progress through practice.</p><span className="mono-caption">WOLKITE UNIVERSITY · ETHIOPIA</span></aside></div>
  </PageFrame>;
}

export function SkillsPage(): React.JSX.Element {
  const skills = useQuery<{ id: string; name: string; category: string; description: string | null }[]>({ queryKey: ["skills"], queryFn: () => api("/skills") });
  const skillRecords = skills.data?.length ? skills.data : fallbackSkills;
  const usingFallback = skills.isError || !skills.data?.length;
  const grouped = useMemo(() => skillRecords.reduce<Record<string, typeof skillRecords>>(
    (groups, skill) => { (groups[skill.category] ??= []).push(skill); return groups; },
    {},
  ), [skillRecords]);
  return <PageFrame eyebrow="TOOLS & PRACTICE" title="Skills I’m building." lead="A snapshot of the technologies I’m learning and using in academic and personal projects. This list describes exposure, not an assumed proficiency level.">
    {skills.isPending ? <Loading /> : <>{usingFallback && <p className="subtle-note" role="status">Showing skills from the portfolio profile while saved skill records are unavailable.</p>}<div className="skills-category-grid">{Object.entries(grouped).map(([category, items]) => <section className="skill-category" key={category}><Eyebrow>{category}</Eyebrow><div>{items.map((skill) => <article className="skill-row" key={skill.id}><Code2 size={15} /><div><h3>{skill.name}</h3>{skill.description && <p>{skill.description}</p>}</div><span className="skill-level">IN PRACTICE</span></article>)}</div></section>)}</div></>}
  </PageFrame>;
}

const projectFilters = ["All", "Academic project", "Personal project", "Learning project", "Prototype concept"];
export function ProjectsPage(): React.JSX.Element {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ page: String(page), limit: "9", ...(filter !== "All" ? { category: filter } : {}), ...(search.trim() ? { search: search.trim() } : {}) });
  const projects = useQuery<Page<Project>>({ queryKey: ["projects", page, filter, search], queryFn: () => api(`/projects?${params}`) });
  const github = useQuery<GithubRepository[]>({ queryKey: ["github-repositories"], queryFn: () => api("/github/repositories"), staleTime: 60_000, refetchInterval: 60_000 });
  const storedProjects = projects.data?.data ?? [];
  const examRepository = github.data?.find((repository) => repository.name.toLowerCase() === "examschedulingsystem");
  const bankingRepository = github.data?.find((repository) => repository.name.toLowerCase() === "banking_management");
  const queryText = search.trim().toLowerCase();
  const matchesExamSearch = !queryText || `student exam scheduler flutter java ${examRepository?.description ?? ""} ${examRepository?.language ?? ""}`.toLowerCase().includes(queryText);
  const matchesBankingSearch = !queryText || `banking management system c++ ${bankingRepository?.description ?? ""}`.toLowerCase().includes(queryText);
  const matchesSurgicalSearch = !queryText || "ai-based surgical monitoring system prototype concept not clinically validated".includes(queryText);
  const showExamRepository = Boolean(examRepository && !storedProjects.some((project) => project.slug === "student-exam-scheduling-system") && (filter === "All" || filter === "Academic project") && matchesExamSearch);
  const showBankingRepository = Boolean(bankingRepository && !storedProjects.some((project) => project.slug === "banking-management-system") && (filter === "All" || filter === "Personal project") && matchesBankingSearch);
  const showSurgicalConcept = !storedProjects.some((project) => project.slug === "ai-based-surgical-monitoring-system") && (filter === "All" || filter === "Prototype concept") && matchesSurgicalSearch;
  const hasFallbackProjects = showExamRepository || showBankingRepository || showSurgicalConcept;
  return <PageFrame eyebrow="THE PROJECT ARCHIVE" title="Projects & experiments." lead="A growing collection of academic work, learning projects, and early-stage ideas. Each entry is published when its scope is accurately documented.">
    <div className="project-controls"><label className="search-control"><span className="sr-only">Search projects</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search projects or technologies" /></label><div className="filter-list" aria-label="Filter by project category">{projectFilters.map((item) => <button key={item} className={filter === item ? "selected" : ""} onClick={() => { setFilter(item); setPage(1); }} aria-pressed={filter === item}>{item}</button>)}</div></div>
    {projects.isPending && github.isPending ? <div className="skeleton-grid"><div /><div /><div /></div> : projects.isError && !hasFallbackProjects ? <ErrorState onRetry={() => void projects.refetch()} /> : storedProjects.length || hasFallbackProjects ? <><div className="project-grid">{showExamRepository && examRepository && <GithubProjectCard repository={examRepository} title="Student Exam Scheduler" category="Academic project" index={0} />}{showBankingRepository && bankingRepository && <GithubProjectCard repository={bankingRepository} title="Banking Management System" category="Personal project" index={Number(showExamRepository)} />}{showSurgicalConcept && <SurgicalConceptCard index={Number(showExamRepository) + Number(showBankingRepository)} />}{storedProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index + Number(showExamRepository) + Number(showBankingRepository) + Number(showSurgicalConcept)} />)}</div>{projects.data && projects.data.pagination.pages > 1 && <div className="pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><ArrowLeft size={16} /></button><span>Page {page} of {projects.data.pagination.pages}</span><button disabled={page >= projects.data.pagination.pages} onClick={() => setPage(page + 1)} aria-label="Next page"><ArrowRight size={16} /></button></div>}</> : projects.isPending ? <div className="skeleton-grid"><div /><div /><div /></div> : <EmptyState title="No published projects match" text="Try a different search, or check back as new work is published." />}
  </PageFrame>;
}

export function ProjectDetailPage(): React.JSX.Element {
  const { slug } = useParams();
  const project = useQuery<Project>({ queryKey: ["project", slug], queryFn: () => api(`/projects/${encodeURIComponent(slug ?? "")}`), retry: (count, error) => !(error instanceof Error && "status" in error && error.status === 404) && count < 2 });
  if (project.isPending) return <div className="content-width page-state"><Loading label="Loading project" /></div>;
  if (project.isError) return <div className="content-width page-state"><EmptyState title="Project not found" text="This project may have been unpublished or the address may be incorrect."><Link className="underlined-link" to="/projects">Back to projects <ArrowLeft size={15} /></Link></EmptyState></div>;
  const item = project.data;
  return <article className="content-width detail-page"><Link className="back-link" to="/projects"><ArrowLeft size={15} /> All projects</Link><Eyebrow>{item.category} / {item.status.replaceAll("_", " ")}</Eyebrow><h1>{item.title}<span className="blue-period">.</span></h1><p className="detail-lead">{item.shortDescription}</p><div className="detail-tags">{item.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>{item.coverImage && <img className="detail-cover" src={item.coverImage} alt={`${item.title} project cover`} />}
    <div className="detail-content"><div><Eyebrow>OVERVIEW</Eyebrow><p>{item.fullDescription}</p>{item.problem && <><Eyebrow>PROBLEM</Eyebrow><p>{item.problem}</p></>}{item.solution && <><Eyebrow>APPROACH</Eyebrow><p>{item.solution}</p></>}{item.features.length > 0 && <><Eyebrow>FEATURES</Eyebrow><ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></>}</div><aside className="detail-aside"><span className="eyebrow">PROJECT LINKS</span>{item.githubUrl && <a href={item.githubUrl} target="_blank" rel="noreferrer">Source code <Github size={15} /></a>}{item.liveDemoUrl && <a href={item.liveDemoUrl} target="_blank" rel="noreferrer">Live demo <ExternalLink size={15} /></a>}{!item.githubUrl && !item.liveDemoUrl && <p>No public links have been added.</p>}<span className="detail-status">{item.status.replaceAll("_", " ")}</span></aside></div>
    {item.images.length > 0 && <div className="detail-gallery">{item.images.map((image) => <img key={image.id} src={image.imageUrl} alt={image.altText} loading="lazy" />)}</div>}
  </article>;
}

type TimelineItem = { id: string; institution?: string; qualification?: string; fieldOfStudy?: string; organization?: string; role?: string; employmentType?: string; startDate?: string | null; endDate?: string | null; description?: string | null };
function Timeline({ items, education }: { items: TimelineItem[]; education: boolean }): React.JSX.Element {
  if (!items.length) return <EmptyState title={education ? "Education is not listed yet" : "No professional experience listed"} text={education ? "Education details will appear here when available." : "Mubarek’s current focus is academic and personal projects. No employment history has been added."} />;
  return <div className="timeline">{items.map((item) => <article className="timeline-item" key={item.id}><span className="timeline-pin" /><div className="timeline-date">{item.startDate ? new Date(item.startDate).getFullYear() : ""}{item.endDate ? ` — ${new Date(item.endDate).getFullYear()}` : item.startDate ? " — Present" : ""}</div><div><h3>{education ? item.qualification : item.role}</h3><p className="timeline-place">{education ? item.institution : item.organization}{education && item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ""}</p>{!education && item.employmentType && <p className="eyebrow">{item.employmentType}</p>}{item.description && <p className="timeline-description">{item.description}</p>}</div></article>)}</div>;
}

export function EducationPage(): React.JSX.Element {
  const education = useQuery<TimelineItem[]>({ queryKey: ["education"], queryFn: () => api("/education") });
  const educationItems = education.data?.length ? education.data : [{ id: "wolkite-university", institution: "Wolkite University", qualification: "Software Engineering studies", fieldOfStudy: "Software Engineering", description: "Currently studying Software Engineering at Wolkite University in Ethiopia." }];
  return <PageFrame eyebrow="LEARNING JOURNEY" title="The long game." lead="Education, practice, and the things I’m learning along the way.">
    <section className="timeline-section"><SectionHeading number="01" label="EDUCATION" title="Where I’m learning" />{education.isPending ? <Loading /> : <><Timeline items={educationItems} education />{(!education.data?.length || education.isError) && <p className="subtle-note" role="status">Showing education from the portfolio profile while saved timeline records are unavailable.</p>}</>}</section>
  </PageFrame>;
}

export function JourneyPage(): React.JSX.Element {
  const education = useQuery<TimelineItem[]>({ queryKey: ["education"], queryFn: () => api("/education") });
  const projects = useQuery<Page<Project>>({ queryKey: ["journey-projects"], queryFn: () => api("/projects?limit=12") });
  const educationItems = education.data?.length ? education.data : [{ id: "wolkite-university", institution: "Wolkite University", qualification: "Software Engineering studies", fieldOfStudy: "Software Engineering", description: "Currently studying Software Engineering at Wolkite University in Ethiopia." }];
  const fallbackProjects = [
    { id: "exam-scheduler", title: "Student Exam Scheduler", slug: "student-exam-scheduling-system", shortDescription: "An ongoing Flutter and Dart project for university exam scheduling.", category: "Academic project", technologies: ["Dart", "Flutter"], coverImage: null },
    { id: "banking-management", title: "Banking Management System", slug: "banking-management-system", shortDescription: "A C++ banking management project.", category: "Personal project", technologies: ["C++"], coverImage: null },
    { id: "ai-surgical-monitoring", title: "AI-Based Surgical Monitoring System", slug: "ai-based-surgical-monitoring-system", shortDescription: "An ongoing prototype concept. Not clinically validated.", category: "Prototype concept", technologies: [], coverImage: null },
  ];
  const projectRecords = projects.data?.data ?? [];
  const useProjectFallback = projects.isError || projectRecords.length === 0;

  return <PageFrame eyebrow="LEARNING JOURNEY" title="Learning by building." lead="My current studies and project work, shown without invented dates or unverified milestones.">
    <section className="timeline-section"><SectionHeading number="01" label="EDUCATION" title="Where I’m learning" />{education.isPending ? <Loading /> : <><Timeline items={educationItems} education />{(!education.data?.length || education.isError) && <p className="subtle-note" role="status">Showing education from the portfolio profile while saved timeline records are unavailable.</p>}</>}</section>
    <section className="timeline-section"><SectionHeading number="02" label="PROJECT PRACTICE" title="Work in progress" description="Academic and personal projects are part of how I’m learning. Prototype status and limitations are stated clearly." />{projects.isPending ? <Loading /> : <><div className="project-grid">{(useProjectFallback ? fallbackProjects : projectRecords).map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}</div>{useProjectFallback && <p className="subtle-note" role="status">Showing current portfolio projects while saved project records are unavailable.</p>}</>}</section>
  </PageFrame>;
}

export function ExperiencePage(): React.JSX.Element {
  const experience = useQuery<TimelineItem[]>({ queryKey: ["experience"], queryFn: () => api("/experience") });
  return <PageFrame eyebrow="PROFESSIONAL EXPERIENCE" title="Still getting started." lead="I’m currently focused on my studies and on building a body of practical project work.">
    {experience.isPending ? <Loading /> : experience.isError ? <ErrorState onRetry={() => void experience.refetch()} /> : <Timeline items={experience.data} education={false} />}
  </PageFrame>;
}

export function ServicesPage(): React.JSX.Element {
  const services = useQuery<{ id: string; title: string; description: string; icon: string | null }[]>({ queryKey: ["services"], queryFn: () => api("/services") });
  return <PageFrame eyebrow="COLLABORATION" title="Good work starts with a conversation." lead="I’m open to learning-focused collaboration and interesting project opportunities.">
    {services.isPending ? <Loading /> : services.isError ? <ErrorState onRetry={() => void services.refetch()} /> : services.data.length ? <div className="service-grid">{services.data.map((service) => <article className="service-card" key={service.id}><Code2 size={19} /><h2>{service.title}</h2><p>{service.description}</p></article>)}</div> : <div className="services-empty"><EmptyState title="No services listed" text="I’m focused on learning and project work. Reach out to discuss a suitable collaboration." /><Link className="button button-primary" to="/contact">Get in touch <ArrowUpRight size={16} /></Link></div>}
  </PageFrame>;
}

export const contactSchema = z.object({ name: z.string().trim().min(2, "Enter at least 2 characters.").max(120), email: z.email("Enter a valid email address.").max(320), subject: z.string().trim().min(3, "Enter at least 3 characters.").max(180), message: z.string().trim().min(10, "Enter at least 10 characters.").max(5000), website: z.string().max(0).optional() });
type ContactValues = z.infer<typeof contactSchema>;
export function ContactPage(): React.JSX.Element {
  const [notice, setNotice] = useState("");
  const form = useForm<ContactValues>({ resolver: zodResolver(contactSchema), defaultValues: { name: "", email: "", subject: "", message: "", website: "" } });
  const send = useMutation({
    mutationFn: async (data: ContactValues) => {
      const apiBase = import.meta.env.VITE_API_BASE ?? "/api/v1";
      const res = await fetch(`${apiBase}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json() as {
        data?: { received: boolean; notificationStatus: "sent" | "failed" | "not_configured" };
        error?: { message?: string };
      };
      if (!res.ok) throw new Error(body.error?.message ?? "The message could not be sent.");
      return body.data!;
    },
    onSuccess: (result) => {
      form.reset();
      setNotice(
        result.notificationStatus === "sent"
          ? "Your message was received and an email notification was sent."
          : result.notificationStatus === "failed"
            ? "Your message was saved, but the email notification could not be sent."
            : "Your message was saved. Email notifications are not configured yet."
      );
    },
    onError: (error: Error) => setNotice(error.message),
  });
  return <PageFrame eyebrow="SAY HELLO" title="Let’s start somewhere." lead="Have a question, an idea, or an opportunity to learn together? Send me a note.">
    <div className="contact-layout"><form className="contact-form" onSubmit={form.handleSubmit((values) => send.mutate(values))} noValidate>
      <div className="form-row"><Field label="Your name" name="name" register={form.register("name")} error={form.formState.errors.name?.message} /><Field label="Email address" name="email" type="email" register={form.register("email")} error={form.formState.errors.email?.message} /></div>
      <Field label="Subject" name="subject" register={form.register("subject")} error={form.formState.errors.subject?.message} />
      <label className="honeypot" aria-hidden="true">Website <input tabIndex={-1} autoComplete="off" {...form.register("website")} /></label>
      <label className="form-field"><span>Your message</span><textarea rows={6} maxLength={5000} {...form.register("message")} aria-invalid={Boolean(form.formState.errors.message)} />{form.formState.errors.message && <small role="alert">{form.formState.errors.message.message}</small>}</label>
      <div className="form-submit-row"><button className="button button-primary" type="submit" disabled={send.isPending}>{send.isPending ? "Sending…" : "Send message"} <Send size={15} /></button>{notice && <p className={`form-notice ${send.isError ? "is-error" : ""}`} role="status">{!send.isError && <Check size={14} />}{notice}</p>}</div>
    </form><aside className="contact-aside"><Eyebrow>DIRECT ROUTES</Eyebrow><a href="tel:+251970563833"><Phone size={16} /> +251 970 563 833 <ArrowUpRight size={14} /></a><a href="mailto:muba7056@gmail.com"><Mail size={16} /> muba7056@gmail.com <ArrowUpRight size={14} /></a><a href="https://github.com/mubarekcr7" target="_blank" rel="noreferrer"><Github size={16} /> github.com/mubarekcr7 <ArrowUpRight size={14} /></a><p><ShieldCheck size={16} /> Feel free to reach out directly via phone, email, or send a message using the form.</p></aside></div>
  </PageFrame>;
}

function Field({ label, name, type = "text", register, error }: { label: string; name: string; type?: string; register: UseFormRegisterReturn; error?: string }): React.JSX.Element {
  return <label className="form-field" htmlFor={name}><span>{label}</span><input id={name} type={type} {...register} aria-invalid={Boolean(error)} />{error && <small role="alert">{error}</small>}</label>;
}

export function ResumePage(): React.JSX.Element {
  const profile = useProfile();
  return <PageFrame eyebrow="CURRICULUM VITAE" title="A snapshot of my journey." lead="A concise overview of my studies, skills, and project work.">
    <div className="resume-ready"><p>{profile.data?.resumeFile ? "Download Mubarek’s current CV." : "Download the current CV."}</p><a className="button button-primary" href={resumeDownloadUrl}>Download CV <ArrowDown size={15} /></a>{profile.isError && <p className="subtle-note">Using the configured public CV file.</p>}</div>
  </PageFrame>;
}

function PageFrame({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead: string; children: React.ReactNode }): React.JSX.Element {
  return <div className="page-frame"><div className="content-width"><div className="page-intro"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{lead}</p></div>{children}</div></div>;
}