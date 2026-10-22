import type React from "react";
import type { ReactNode } from "react";
import { ArrowUpRight, CircleAlert, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function Eyebrow({ children }: { children: ReactNode }): React.JSX.Element {
  return <span className="eyebrow"><span className="eyebrow-dot" />{children}</span>;
}

export function SectionHeading({ number, label, title, description }: { number: string; label: string; title: string; description?: string }): React.JSX.Element {
  return (
    <div className="section-heading">
      <div><Eyebrow>{number} / {label}</Eyebrow><h2>{title}</h2></div>
      {description && <p>{description}</p>}
    </div>
  );
}

export function Loading({ label = "Loading" }: { label?: string }): React.JSX.Element {
  return <div className="loading-state" role="status"><LoaderCircle className="spin" size={18} /><span>{label}</span></div>;
}

export function ErrorState({ onRetry }: { onRetry?: () => void }): React.JSX.Element {
  return <div className="state-message" role="alert"><CircleAlert size={18} /><span>Couldn’t load this content. Check your connection and try again.</span>{onRetry && <button className="text-button" onClick={onRetry}>Retry</button>}</div>;
}

export function EmptyState({ title, text, children }: { title: string; text: string; children?: ReactNode }): React.JSX.Element {
  return <div className="empty-state"><span className="empty-marker">—</span><h3>{title}</h3><p>{text}</p>{children}</div>;
}

export function ProjectCard({ project, index = 0 }: { project: { id: string; title: string; slug: string; shortDescription: string; category: string; technologies: string[]; coverImage?: string | null }; index?: number }): React.JSX.Element {
  const referenceId = project.slug === "student-exam-scheduling-system" ? "GUBGMHVpwcTsPFvNNVdG5DKtpv6UwksAfzw5aULcGzgG" : null;
  return (
    <article className="project-card" style={{ "--card-index": index } as React.CSSProperties}>
      <Link className="project-visual" to={`/projects/${project.slug}`} aria-label={`View ${project.title}`}>
        {project.coverImage ? <img src={project.coverImage} alt="" loading="lazy" /> : <div className="project-placeholder" aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span><div className="code-mark">&lt; / &gt;</div><i /><b /></div>}
        <span className="project-open" aria-hidden="true"><ArrowUpRight size={18} /></span>
      </Link>
      <div className="project-card-meta"><span className="eyebrow">{project.category}</span><Link to={`/projects/${project.slug}`} className="project-title-link"><h3>{project.title}</h3><ArrowUpRight size={16} /></Link><p>{project.shortDescription}</p>
        <div className="tag-list">{project.technologies.slice(0, 4).map((technology) => <span key={technology}>{technology}</span>)}</div>
        {referenceId && <p className="project-reference"><span>PROJECT ID</span><code>{referenceId}</code></p>}
      </div>
    </article>
  );
}