import type React from "react";
import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Shell } from "./components/Shell";
import { Eyebrow, Loading } from "./components/UI";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = lazy(() => import("./pages/PublicPages").then((module) => ({ default: module.HomePage })));
const AboutPage = lazy(() => import("./pages/PublicPages").then((module) => ({ default: module.AboutPage })));
const SkillsPage = lazy(() => import("./pages/PublicPages").then((module) => ({ default: module.SkillsPage })));
const ProjectsPage = lazy(() => import("./pages/PublicPages").then((module) => ({ default: module.ProjectsPage })));
const ProjectDetailPage = lazy(() => import("./pages/PublicPages").then((module) => ({ default: module.ProjectDetailPage })));
const EducationPage = lazy(() => import("./pages/PublicPages").then((module) => ({ default: module.EducationPage })));
const JourneyPage = lazy(() => import("./pages/PublicPages").then((module) => ({ default: module.JourneyPage })));
const ExperiencePage = lazy(() => import("./pages/PublicPages").then((module) => ({ default: module.ExperiencePage })));
const ServicesPage = lazy(() => import("./pages/PublicPages").then((module) => ({ default: module.ServicesPage })));
const ContactPage = lazy(() => import("./pages/PublicPages").then((module) => ({ default: module.ContactPage })));
const ResumePage = lazy(() => import("./pages/PublicPages").then((module) => ({ default: module.ResumePage })));
const AdminLoginPage = lazy(() => import("./pages/AdminPages").then((module) => ({ default: module.AdminLoginPage })));
const AdminGuard = lazy(() => import("./pages/AdminPages").then((module) => ({ default: module.AdminGuard })));
const AdminOverview = lazy(() => import("./pages/AdminPages").then((module) => ({ default: module.AdminOverview })));
const AdminResourcePage = lazy(() => import("./pages/AdminPages").then((module) => ({ default: module.AdminResourcePage })));
const AdminEditorPage = lazy(() => import("./pages/AdminPages").then((module) => ({ default: module.AdminEditorPage })));
const AdminSingletonPage = lazy(() => import("./pages/AdminPages").then((module) => ({ default: module.AdminSingletonPage })));

function PageMetadata(): null {
  const location = useLocation();
  useEffect(() => {
    const segment = location.pathname.split("/").filter(Boolean).at(-1);
    const title = !segment ? "Home" : segment === "login" ? "Administrator sign in" : segment.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    document.title = `${title} | Mubarek Mohammed`;
    const description = "Mubarek Mohammed, Software Engineering student at Wolkite University in Ethiopia. Explore academic projects, skills, and software engineering journey.";
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.append(meta); }
    meta.content = description;
  }, [location.pathname]);
  return null;
}

function NotFoundPage(): React.JSX.Element {
  return <div className="page-frame"><div className="content-width"><div className="page-intro"><Eyebrow>404 / NOT FOUND</Eyebrow><h1>This page went missing.</h1><p>The address may be incorrect, or this page may have moved.</p></div><Link className="underlined-link" to="/"><ArrowLeft size={15} /> Back to home</Link></div></div>;
}

export default function App(): React.JSX.Element {
  return <Suspense fallback={<main className="page-state"><Loading label="Loading page" /></main>}><PageMetadata /><Routes>
    <Route element={<Shell />}>
      <Route index element={<HomePage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="skills" element={<SkillsPage />} />
      <Route path="projects" element={<ProjectsPage />} />
      <Route path="projects/:slug" element={<ProjectDetailPage />} />
      <Route path="education" element={<EducationPage />} />
      <Route path="journey" element={<JourneyPage />} />
      <Route path="experience" element={<ExperiencePage />} />
      <Route path="services" element={<ServicesPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="resume" element={<ResumePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
    <Route path="/admin/login" element={<AdminLoginPage />} />
    <Route path="/admin" element={<AdminGuard />}>
      <Route index element={<AdminOverview />} />
      <Route path=":resource" element={<AdminResourcePage />} />
      <Route path=":resource/new" element={<AdminEditorPage />} />
      <Route path=":resource/:id/edit" element={<AdminEditorPage />} />
      <Route path="profile" element={<AdminSingletonPage section="profile" />} />
      <Route path="settings" element={<AdminSingletonPage section="settings" />} />
    </Route>
  </Routes></Suspense>;
}