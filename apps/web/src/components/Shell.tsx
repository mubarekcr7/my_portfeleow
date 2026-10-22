import type React from "react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, type Profile } from "../api";

const links = [
  ["About", "/about"],
  ["Skills", "/skills"],
  ["Projects", "/projects"],
  ["Journey", "/journey"],
] as const;

export function Shell(): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const profile = useQuery<Profile | null>({ queryKey: ["profile"], queryFn: () => api("/profile") });
  const githubUrl = profile.data?.githubUrl || "https://github.com/mubarekcr7";
  const close = (): void => setOpen(false);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink className="brand" to="/" onClick={close} aria-label="Mubarek Mohammed home">
            <span className="brand-mark">M<span>.</span></span>
            <span className="brand-name">MUBAREK MOHAMMED</span>
          </NavLink>
          <button className="icon-button mobile-menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <nav className={`nav-links ${open ? "is-open" : ""}`} aria-label="Main navigation">
            {links.map(([label, path]) => (
              <NavLink key={path} to={path} onClick={close} className={({ isActive }) => isActive || (path === "/projects" && location.pathname.startsWith("/projects/")) ? "active" : ""}>
                {label}
              </NavLink>
            ))}
            <NavLink className="nav-contact" to="/contact" onClick={close}>Contact <ArrowUpRight size={14} /></NavLink>
          </nav>
        </div>
      </header>
      <main id="main-content"><Outlet /></main>
      <footer className="site-footer">
        <div className="footer-inner">
          <NavLink className="footer-brand" to="/">Mubarek Mohammed<span> / </span>Ethiopia</NavLink>
          <p>Building, learning, and getting better one project at a time.</p>
          <div className="footer-links">
            <a href={githubUrl} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={13} /></a>
            <NavLink to="/contact">Get in touch <ArrowUpRight size={13} /></NavLink>
            <NavLink to="/admin/login" aria-label="Administrator sign in">Admin</NavLink>
          </div>
          <span className="footer-copy">© {new Date().getFullYear()} Mubarek Mohammed</span>
        </div>
      </footer>
    </>
  );
}