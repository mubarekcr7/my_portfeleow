import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, BookOpen, BriefcaseBusiness, FileImage, FileText, FolderKanban, LayoutDashboard, LogOut, Mail, Plus, Save, Settings, Shield, Trash2, UserRound, Wrench } from "lucide-react";
import { Link, NavLink, Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, refreshCsrf, setCsrfToken, type Page } from "../api";
import { ErrorState, Eyebrow, Loading } from "../components/UI";
import { Project } from "../api";

const sections = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Projects", path: "/admin/projects", icon: FolderKanban },
  { label: "Skills", path: "/admin/skills", icon: Wrench },
  { label: "Education", path: "/admin/education", icon: BookOpen },
  { label: "Experience", path: "/admin/experience", icon: BriefcaseBusiness },
  { label: "Services", path: "/admin/services", icon: FileText },
  { label: "Messages", path: "/admin/messages", icon: Mail },
  { label: "Profile", path: "/admin/profile", icon: UserRound },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export function AdminLoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");
  const schema = z.object({ email: z.email("Enter a valid email address."), password: z.string().min(1, "Enter your password.").max(256) });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });
  const login = useMutation({ mutationFn: async (values: z.infer<typeof schema>) => { await refreshCsrf(); return api<{ authenticated: boolean; csrfToken: string }>("/auth/login", { method: "POST", body: JSON.stringify(values) }); }, onSuccess: (result) => { setCsrfToken(result.csrfToken); navigate("/admin", { replace: true }); }, onError: (error: Error) => setNotice(error.message) });
  return <main className="login-page"><div className="login-panel"><Link className="brand" to="/" aria-label="Back to portfolio"><span className="brand-mark">M<span>.</span></span><span className="brand-name">MUBAREK MOHAMMED</span></Link><Eyebrow>PRIVATE AREA</Eyebrow><h1>Administrator sign in</h1><p>Sign in with the administrator account created during setup.</p><form className="admin-form" onSubmit={form.handleSubmit((values) => login.mutate(values))}>
    <label>Email<input type="email" autoComplete="username" {...form.register("email")} />{form.formState.errors.email && <small className="admin-error">{form.formState.errors.email.message}</small>}</label>
    <label>Password<input type="password" autoComplete="current-password" {...form.register("password")} />{form.formState.errors.password && <small className="admin-error">{form.formState.errors.password.message}</small>}</label>
    {notice && <p className="admin-error" role="alert">{notice}</p>}
    <button className="button button-primary" type="submit" disabled={login.isPending}>{login.isPending ? "Signing in…" : "Sign in"} <Shield size={15} /></button>
  </form></div></main>;
}

export function AdminGuard(): React.JSX.Element {
  const session = useQuery<{ authenticated: boolean }>({ queryKey: ["admin-session"], queryFn: () => api("/auth/session"), retry: false });
  if (session.isPending) return <main className="page-state"><Loading label="Checking administrator session" /></main>;
  if (session.isError) return <main className="page-state"><ErrorState onRetry={() => void session.refetch()} /></main>;
  if (!session.data.authenticated) return <Navigate to="/admin/login" replace />;
  return <AdminShell />;
}

function AdminShell(): React.JSX.Element {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logout = useMutation({ mutationFn: () => api("/auth/logout", { method: "POST" }), onSuccess: () => { setCsrfToken(""); void queryClient.clear(); navigate("/admin/login", { replace: true }); } });
  return <div className="admin-layout"><aside className="admin-sidebar"><Link className="brand" to="/admin"><span className="brand-mark">M<span>.</span></span><span className="brand-name">PORTFOLIO ADMIN</span></Link><Eyebrow>CONTENT</Eyebrow><nav className="admin-nav" aria-label="Administrator navigation">{sections.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === "/admin"} className={({ isActive }) => isActive ? "active" : ""}><Icon size={15} />{label}</NavLink>)}</nav><div className="admin-sidebar-bottom"><Link to="/" target="_blank">View public site <ArrowUpRight size={13} /></Link><button onClick={() => logout.mutate()} disabled={logout.isPending}><LogOut size={14} />Sign out</button></div></aside><div className="admin-main"><div className="admin-topbar"><span>Portfolio / Administration</span><span>Mubarek Mohammed</span></div><div className="admin-content"><Outlet /></div></div></div>;
}

type Overview = { projects: number; featuredProjects: number; skills: number; unreadMessages: number; recentMessages: { id: string; senderName: string; subject: string; createdAt: string; status: string }[] };
export function AdminOverview(): React.JSX.Element {
  const overview = useQuery<Overview>({ queryKey: ["admin-overview"], queryFn: () => api("/admin/overview") });
  if (overview.isPending) return <Loading />;
  if (overview.isError) return <ErrorState onRetry={() => void overview.refetch()} />;
  const cards = [["Total projects", overview.data.projects], ["Featured projects", overview.data.featuredProjects], ["Skills", overview.data.skills], ["Unread messages", overview.data.unreadMessages]] as const;
  return <><div className="admin-title-row"><div><Eyebrow>OVERVIEW</Eyebrow><h1>Good to see you.</h1></div><span className="eyebrow">LIVE DATABASE COUNTS</span></div><div className="admin-cards">{cards.map(([label, count]) => <article className="admin-stat" key={label}><span>{label}</span><strong>{count}</strong></article>)}</div><section className="admin-panel"><div className="admin-panel-head"><h2>Recent contact messages</h2><Link className="underlined-link" to="/admin/messages">Open inbox <ArrowUpRight size={14} /></Link></div>{overview.data.recentMessages.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Sender</th><th>Subject</th><th>Status</th><th>Received</th></tr></thead><tbody>{overview.data.recentMessages.map((message) => <tr key={message.id}><td>{message.senderName}</td><td>{message.subject}</td><td>{message.status}</td><td>{new Date(message.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <div className="admin-panel-body"><p className="subtle-note">No contact messages yet.</p></div>}</section></>;
}

const resourceLabels: Record<string, { title: string; columns: string[] }> = {
  projects: { title: "Projects", columns: ["title", "category", "status", "featured"] },
  skills: { title: "Skills", columns: ["name", "category", "visibility"] },
  education: { title: "Education", columns: ["institution", "qualification", "fieldOfStudy"] },
  experience: { title: "Experience", columns: ["organization", "role", "employmentType"] },
  services: { title: "Services", columns: ["title", "active"] },
  messages: { title: "Contact messages", columns: ["senderName", "senderEmail", "subject", "status", "createdAt"] },
};

export function AdminResourcePage(): React.JSX.Element {
  const { resource = "projects" } = useParams();
  const config = resourceLabels[resource];
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const query = new URLSearchParams({ page: String(page), limit: "20", ...(search ? { search } : {}), ...(status ? { status } : {}) });
  const records = useQuery<Page<Record<string, unknown>>>({ queryKey: ["admin-resource", resource, page, search, status], queryFn: () => api(`/admin/${resource}?${query}`), enabled: Boolean(config) });
  const client = useQueryClient();
  const remove = useMutation({ mutationFn: (id: string) => api(`/admin/${resource}/${encodeURIComponent(id)}`, { method: "DELETE" }), onSuccess: () => { void client.invalidateQueries({ queryKey: ["admin-resource", resource] }); void client.invalidateQueries({ queryKey: ["admin-overview"] }); } });
  const changeStatus = useMutation({ mutationFn: ({ id, nextStatus }: { id: string; nextStatus: string }) => api(`/admin/${resource}/${id}`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) }), onSuccess: () => void client.invalidateQueries({ queryKey: ["admin-resource", resource] }) });
  if (!config) return <Navigate to="/admin" replace />;
  if (records.isPending) return <Loading />;
  if (records.isError) return <ErrorState onRetry={() => void records.refetch()} />;
  const canCreate = resource !== "messages";
  return <><div className="admin-title-row"><div><Eyebrow>CONTENT MANAGEMENT</Eyebrow><h1>{config.title}</h1></div>{canCreate && <Link className="button button-primary" to={`/admin/${resource}/new`}><Plus size={15} />Add {resource === "projects" ? "project" : resource.slice(0, -1)}</Link>}</div><div className="admin-toolbar"><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={`Search ${config.title.toLowerCase()}`} aria-label={`Search ${config.title}`} />{resource === "messages" && <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filter message status"><option value="">All statuses</option><option value="UNREAD">Unread</option><option value="READ">Read</option><option value="ARCHIVED">Archived</option></select>}</div>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr>{config.columns.map((column) => <th key={column}>{column.replace(/[A-Z]/g, (letter) => ` ${letter}`).toUpperCase()}</th>)}<th>Actions</th></tr></thead><tbody>{records.data.data.map((item) => <tr key={String(item.id)}>{config.columns.map((column) => <td key={column}>{column === "createdAt" ? new Date(String(item[column])).toLocaleString() : column === "featured" || column === "visibility" || column === "active" ? String(item[column]) : String(item[column] ?? "—")}</td>)}<td><div className="table-actions">{resource === "messages" ? <><button className="small-action" onClick={() => changeStatus.mutate({ id: String(item.id), nextStatus: item.status === "UNREAD" ? "READ" : "UNREAD" })}>{item.status === "UNREAD" ? "Mark read" : "Unread"}</button><button className="small-action" onClick={() => changeStatus.mutate({ id: String(item.id), nextStatus: "ARCHIVED" })}>Archive</button></> : <Link className="small-action" to={`/admin/${resource}/${item.id}/edit`}>Edit</Link>}<button className="small-action danger" onClick={() => { if (window.confirm(`Delete this ${resource === "messages" ? "message" : "record"}? This cannot be undone.`)) remove.mutate(String(item.id)); }} aria-label={`Delete ${String(item.title ?? item.subject ?? item.name ?? "record")}`}><Trash2 size={13} /></button></div></td></tr>)}</tbody></table></div>
    {records.data.data.length === 0 && <div className="admin-panel-body"><p className="subtle-note">No records found.</p></div>}
    {records.data.pagination.pages > 1 && <div className="pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><ArrowLeft size={16} /></button><span>Page {page} of {records.data.pagination.pages} · {records.data.pagination.total} records</span><button disabled={page >= records.data.pagination.pages} onClick={() => setPage(page + 1)} aria-label="Next page"><ArrowUpRight size={16} /></button></div>}
  </>;
}

type FieldKind = "text" | "textarea" | "array" | "checkbox" | "select" | "date" | "url" | "email" | "file" | "number";
type Field = { name: string; label: string; kind?: FieldKind; options?: string[]; full?: boolean; required?: boolean };
const fieldSets: Record<string, Field[]> = {
  projects: [
    { name: "title", label: "Title", required: true }, { name: "slug", label: "URL slug", required: true },
    { name: "shortDescription", label: "Short description", kind: "textarea", required: true }, { name: "fullDescription", label: "Full description", kind: "textarea", required: true, full: true },
    { name: "problem", label: "Problem", kind: "textarea" }, { name: "solution", label: "Solution", kind: "textarea" },
    { name: "features", label: "Features (one per line)", kind: "array", full: true }, { name: "technologies", label: "Technologies (one per line)", kind: "array", full: true },
    { name: "category", label: "Category", required: true }, { name: "status", label: "Status", kind: "select", options: ["DRAFT", "IN_PROGRESS", "COMPLETED"] },
    { name: "coverImage", label: "Cover image URL", kind: "url", full: true }, { name: "coverUpload", label: "Upload cover image", kind: "file", full: true },
    { name: "githubUrl", label: "GitHub URL", kind: "url" }, { name: "liveDemoUrl", label: "Live demo URL", kind: "url" },
    { name: "displayOrder", label: "Display order", kind: "number" }, { name: "featured", label: "Featured project", kind: "checkbox" },
  ],
  skills: [{ name: "name", label: "Skill", required: true }, { name: "category", label: "Category", required: true }, { name: "description", label: "Description", kind: "textarea" }, { name: "icon", label: "Icon name" }, { name: "displayOrder", label: "Display order", kind: "number" }, { name: "visibility", label: "Visible on website", kind: "checkbox" }],
  education: [{ name: "institution", label: "Institution", required: true }, { name: "qualification", label: "Qualification", required: true }, { name: "fieldOfStudy", label: "Field of study", required: true }, { name: "startDate", label: "Start date", kind: "date" }, { name: "endDate", label: "End date", kind: "date" }, { name: "description", label: "Description", kind: "textarea", full: true }, { name: "displayOrder", label: "Display order", kind: "number" }],
  experience: [{ name: "organization", label: "Organization", required: true }, { name: "role", label: "Role", required: true }, { name: "employmentType", label: "Type", required: true }, { name: "startDate", label: "Start date", kind: "date" }, { name: "endDate", label: "End date", kind: "date" }, { name: "description", label: "Description", kind: "textarea", full: true }, { name: "displayOrder", label: "Display order", kind: "number" }],
  services: [{ name: "title", label: "Title", required: true }, { name: "icon", label: "Icon name" }, { name: "description", label: "Description", kind: "textarea", full: true, required: true }, { name: "active", label: "Active", kind: "checkbox" }, { name: "displayOrder", label: "Display order", kind: "number" }],
};

const emptyValues: Record<string, Record<string, unknown>> = {
  projects: { title: "", slug: "", shortDescription: "", fullDescription: "", problem: "", solution: "", features: [], technologies: [], category: "Academic project", coverImage: "", githubUrl: "", liveDemoUrl: "", status: "DRAFT", featured: false, displayOrder: 0 },
  skills: { name: "", category: "Frontend development", description: "", icon: "", visibility: true, displayOrder: 0 },
  education: { institution: "", qualification: "", fieldOfStudy: "", startDate: "", endDate: "", description: "", displayOrder: 0 },
  experience: { organization: "", role: "", employmentType: "", startDate: "", endDate: "", description: "", displayOrder: 0 },
  services: { title: "", description: "", icon: "", active: true, displayOrder: 0 },
};

function AdminEditorContent(): React.JSX.Element {
  const { resource = "projects", id } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const config = fieldSets[resource];
  const isNew = !id || id === "new";
  const [values, setValues] = useState<Record<string, unknown>>(emptyValues[resource] ?? {});
  const [notice, setNotice] = useState("");
  const item = useQuery<Record<string, unknown>>({ queryKey: ["admin-resource-item", resource, id], queryFn: () => api(`/admin/${resource}/${id}`), enabled: Boolean(config && id && !isNew) });
  useEffect(() => { if (item.data) setValues({ ...item.data, coverUpload: undefined }); }, [item.data]);
  const save = useMutation({ mutationFn: async () => {
    const body = { ...values };
    delete body.coverUpload;
    for (const field of ["startDate", "endDate"]) if (typeof body[field] === "string") body[field] = body[field] ? new Date(`${body[field]}T00:00:00.000Z`).toISOString() : null;
    if (typeof body.displayOrder === "string") body.displayOrder = Number(body.displayOrder);
    return api(`/admin/${resource}${isNew ? "" : `/${id}`}`, { method: isNew ? "POST" : "PATCH", body: JSON.stringify(body) });
  }, onSuccess: async () => { await client.invalidateQueries(); navigate(`/admin/${resource}`); }, onError: (error: Error) => setNotice(error.message) });
  const upload = useMutation({ mutationFn: async (file: File) => { const form = new FormData(); form.append("file", file); form.append("kind", "image"); return api<{ secure_url: string }>("/admin/uploads", { method: "POST", body: form }); }, onSuccess: (result) => setValues((current) => ({ ...current, coverImage: result.secure_url })), onError: (error: Error) => setNotice(error.message) });
  if (!config) return <Navigate to="/admin" replace />;
  if (item.isPending && !isNew) return <Loading />;
  if (item.isError) return <ErrorState onRetry={() => void item.refetch()} />;
  return <><div className="admin-title-row"><div><Link className="back-link" to={`/admin/${resource}`}><ArrowLeft size={14} /> {resourceLabels[resource]?.title ?? resource}</Link><h1>{isNew ? "New record" : "Edit record"}</h1></div></div><section className="admin-panel"><div className="admin-panel-head"><h2>{resourceLabels[resource]?.title ?? resource}</h2><span className="eyebrow">{isNew ? "CREATE" : "UPDATE"}</span></div><div className="admin-panel-body"><form className="admin-form" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}><div className="admin-form-grid">{config.map((field) => <label className={field.full ? "full-width" : ""} key={field.name}>{field.label}{field.kind === "textarea" || field.kind === "array" ? <textarea required={field.required} value={Array.isArray(values[field.name]) ? (values[field.name] as string[]).join("\n") : String(values[field.name] ?? "")} onChange={(event) => setValues({ ...values, [field.name]: field.kind === "array" ? event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) : event.target.value })} /> : field.kind === "checkbox" ? <input type="checkbox" checked={Boolean(values[field.name])} onChange={(event) => setValues({ ...values, [field.name]: event.target.checked })} /> : field.kind === "select" ? <select value={String(values[field.name] ?? field.options?.[0])} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}>{field.options?.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select> : field.kind === "file" ? <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload.mutate(file); }} /> : <input type={field.kind ?? "text"} required={field.required} min={field.kind === "number" ? "0" : undefined} value={field.kind === "date" && typeof values[field.name] === "string" ? String(values[field.name]).slice(0, 10) : String(values[field.name] ?? "")} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} />}</label>)}</div>{notice && <p className="admin-error" role="alert">{notice}</p>}<div className="admin-form-actions"><button className="button button-primary" type="submit" disabled={save.isPending || upload.isPending}><Save size={15} />{save.isPending ? "Saving…" : "Save changes"}</button><Link className="button button-secondary" to={`/admin/${resource}`}>Cancel</Link></div></form></div></section></>;
}

export function AdminEditorPage(): React.JSX.Element {
  const { resource, id } = useParams();
  return <><AdminEditorContent />{resource === "projects" && id && id !== "new" && <ProjectGallery projectId={id} />}</>;
}

function ProjectGallery({ projectId }: { projectId: string }): React.JSX.Element {
  const client = useQueryClient();
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [notice, setNotice] = useState("");
  const gallery = useQuery<{ id: string; imageUrl: string; altText: string; displayOrder: number }[]>({
    queryKey: ["project-gallery", projectId],
    queryFn: () => api(`/admin/projects/${projectId}/images`),
  });
  const add = useMutation({
    mutationFn: () => api(`/admin/projects/${projectId}/images`, {
      method: "POST",
      body: JSON.stringify({ imageUrl, altText, displayOrder: gallery.data?.length ?? 0 }),
    }),
    onSuccess: async () => {
      setImageUrl("");
      setAltText("");
      setNotice("");
      await client.invalidateQueries({ queryKey: ["project-gallery", projectId] });
    },
    onError: (error: Error) => setNotice(error.message),
  });
  const upload = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", "image");
      return api<{ secure_url: string }>("/admin/uploads", { method: "POST", body: form });
    },
    onSuccess: (result) => setImageUrl(result.secure_url),
    onError: (error: Error) => setNotice(error.message),
  });
  const remove = useMutation({
    mutationFn: (imageId: string) => api(`/admin/projects/${projectId}/images/${imageId}`, { method: "DELETE" }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ["project-gallery", projectId] }),
    onError: (error: Error) => setNotice(error.message),
  });

  return <section className="admin-panel"><div className="admin-panel-head"><h2>Project gallery</h2><span className="eyebrow">{gallery.data?.length ?? 0} IMAGES</span></div><div className="admin-panel-body">
    <div className="admin-form-grid">
      <label className="full-width">Image URL<input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://…" /></label>
      <label className="full-width">Alternative text<input value={altText} onChange={(event) => setAltText(event.target.value)} maxLength={240} /></label>
      <label className="full-width">Upload an image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload.mutate(file); }} /></label>
    </div>
    <button className="small-action" disabled={!imageUrl || !altText.trim() || add.isPending || upload.isPending} onClick={() => add.mutate()}><FileImage size={13} />Add image</button>
    {notice && <p className="admin-error" role="alert">{notice}</p>}
    {gallery.isPending ? <Loading /> : gallery.isError ? <ErrorState onRetry={() => void gallery.refetch()} /> : gallery.data.length ? <div className="gallery-admin-list">{gallery.data.map((image) => <article key={image.id}><img src={image.imageUrl} alt={image.altText} /><div><strong>{image.altText}</strong><span>{image.imageUrl}</span></div><button className="small-action danger" onClick={() => { if (window.confirm("Remove this gallery image?")) remove.mutate(image.id); }} aria-label={`Remove ${image.altText}`}><Trash2 size={13} /></button></article>)}</div> : <p className="subtle-note">No gallery images have been added.</p>}
  </div></section>;
}

const singletonFields: Record<string, Field[]> = {
  profile: [
    { name: "name", label: "Name", required: true }, { name: "professionalTitle", label: "Professional title", required: true },
    { name: "email", label: "Contact email", kind: "email" }, { name: "location", label: "Location", required: true },
    { name: "githubUrl", label: "GitHub URL", kind: "url" }, { name: "linkedInUrl", label: "LinkedIn URL", kind: "url" },
    { name: "biography", label: "Biography", kind: "textarea", full: true }, { name: "profileImage", label: "Profile image URL", kind: "url" },
    { name: "resumeFile", label: "Resume URL", kind: "url" }, { name: "resumeUpload", label: "Upload replacement PDF", kind: "file", full: true },
    { name: "seoTitle", label: "SEO title" }, { name: "seoDescription", label: "SEO description", kind: "textarea" },
  ],
  settings: [
    { name: "siteTitle", label: "Site title", required: true }, { name: "siteDescription", label: "Site description", kind: "textarea", required: true },
    { name: "contactEmail", label: "Contact email", kind: "email" }, { name: "github", label: "GitHub URL", kind: "url" },
    { name: "linkedIn", label: "LinkedIn URL", kind: "url" },
  ],
};

export function AdminSingletonPage({ section }: { section: "profile" | "settings" }): React.JSX.Element {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fields = singletonFields[section];
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [notice, setNotice] = useState("");
  const query = useQuery<Record<string, unknown> | null>({ queryKey: ["admin-singleton", section], queryFn: () => api(`/admin/${section}`), enabled: Boolean(fields) });
  useEffect(() => {
    if (!query.data) return;
    const data = { ...query.data };
    if (section === "settings" && data.socialLinks && typeof data.socialLinks === "object") Object.assign(data, data.socialLinks);
    setValues(data);
  }, [query.data, section]);
  const save = useMutation({ mutationFn: () => {
    const body: Record<string, unknown> = { ...values };
    delete body.resumeUpload;
    if (section === "settings") { body.socialLinks = { github: body.github || "", linkedIn: body.linkedIn || "" }; delete body.github; delete body.linkedIn; }
    return api(`/admin/${section}`, { method: "PATCH", body: JSON.stringify(body) });
  }, onSuccess: async () => { await queryClient.invalidateQueries(); setNotice("Changes saved."); }, onError: (error: Error) => setNotice(error.message) });
  const upload = useMutation({ mutationFn: async (file: File) => { const form = new FormData(); form.append("file", file); form.append("kind", "resume"); return api<{ secure_url: string }>("/admin/uploads", { method: "POST", body: form }); }, onSuccess: (result) => setValues((current) => ({ ...current, resumeFile: result.secure_url })), onError: (error: Error) => setNotice(error.message) });
  if (!fields) return <Navigate to="/admin" replace />;
  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  return <><div className="admin-title-row"><div><Eyebrow>PORTFOLIO CONFIGURATION</Eyebrow><h1>{section === "profile" ? "Profile" : "Site settings"}</h1></div></div><section className="admin-panel"><div className="admin-panel-head"><h2>{section === "profile" ? "Public profile" : "Website settings"}</h2></div><div className="admin-panel-body"><form className="admin-form" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}><div className="admin-form-grid">{fields.map((field) => <label className={field.full ? "full-width" : ""} key={field.name}>{field.label}{field.kind === "textarea" ? <textarea required={field.required} value={String(values[field.name] ?? "")} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} /> : field.kind === "file" ? <input type="file" accept={section === "profile" ? "application/pdf" : undefined} onChange={(event) => { const file = event.target.files?.[0]; if (file) upload.mutate(file); }} /> : <input type={field.kind ?? "text"} required={field.required} value={String(values[field.name] ?? "")} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} />}</label>)}</div>{notice && <p className={save.isError || upload.isError ? "admin-error" : "subtle-note"} role="status">{notice}</p>}<button className="button button-primary" type="submit" disabled={save.isPending || upload.isPending}><Save size={15} />{save.isPending ? "Saving…" : "Save changes"}</button></form></div></section></>;
}