// Trang phụ /gallery: xem từng màn Figma đã xuất (tĩnh), không nằm trong luồng chính
import type { ComponentType } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

interface ManifestEntry {
  nodeId: string;
  name: string;
  component: string;
  file: string;
  width: number;
  height: number;
}

const screenModules = import.meta.glob<{ default: ComponentType }>("../screens/**/*.tsx", { eager: true });
const manifestModules = import.meta.glob<ManifestEntry[]>("../manifest/*.json", { eager: true, import: "default" });

const SECTIONS = [
  { key: "registration", title: "SCRUM-12 — Registration" },
  { key: "login", title: "SCRUM-13 — Login" },
  { key: "home", title: "SCRUM-15 — Home, Services and Profile" },
  { key: "journey", title: "SCRUM-16 — Journey Details" },
  { key: "vehicle", title: "SCRUM-17 — Vehicle Size" },
  { key: "availability", title: "SCRUM-18 — Availability" },
];

const sections = SECTIONS.map((section) => ({
  ...section,
  screens: (manifestModules[`../manifest/${section.key}.json`] ?? []).map((s) => ({
    ...s,
    slug: s.nodeId.replace(":", "-"),
    Component: screenModules[`../screens/${s.file}`]?.default,
  })),
}));
const allScreens = sections.flatMap((s) => s.screens);

export function GalleryIndex() {
  return (
    <div className="min-h-screen bg-[#f1f5f9] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-[#0b2341]">PrivateHire Cars — Figma screens (static)</h1>
        <p className="mt-1 text-sm text-[#475569]">
          Luồng chạy thật bắt đầu ở <Link to="/" className="font-bold text-[#0284c7]">trang chủ /</Link>.
        </p>
        {sections.map((section) => (
          <section key={section.key} className="mt-8">
            <h2 className="text-lg font-bold text-[#0b2341]">{section.title}</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {section.screens.map((s) => (
                <li key={s.nodeId}>
                  <Link
                    to={`/gallery/${s.slug}`}
                    className="block rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm font-semibold text-[#1e293b] hover:border-[#0284c7]"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

export function GalleryScreen() {
  const { slug } = useParams();
  const index = allScreens.findIndex((s) => s.slug === slug);
  if (index === -1) return <Navigate to="/gallery" replace />;
  const screen = allScreens[index];
  const prev = allScreens[index - 1];
  const next = allScreens[index + 1];
  const { Component } = screen;
  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-10">
      <nav className="sticky top-0 z-50 flex items-center justify-between gap-2 bg-[#0b2341] px-4 py-2 text-xs text-white">
        <Link to="/gallery" className="font-bold">☰ All screens</Link>
        <span className="truncate">{screen.name}</span>
        <span className="flex gap-3">
          {prev && <Link to={`/gallery/${prev.slug}`}>← Prev</Link>}
          {next && <Link to={`/gallery/${next.slug}`}>Next →</Link>}
        </span>
      </nav>
      <div className="mx-auto pt-6" style={{ width: screen.width, height: screen.height }}>
        {Component ? <Component /> : <p className="p-6 text-red-600">Missing component: {screen.file}</p>}
      </div>
    </div>
  );
}
