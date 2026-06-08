"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileEdit,
  PackageOpen,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SAMPLE_PROJECTS, type Project, type ProjectStatus } from "@/lib/sample-data";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  complete: "Complete",
  generating: "Generating",
  failed: "Failed",
  draft: "Draft",
};

const STATUS_ICONS: Record<ProjectStatus, LucideIcon> = {
  complete: CheckCircle2,
  generating: Clock,
  failed: AlertCircle,
  draft: FileEdit,
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  complete: "text-green-600",
  generating: "text-[#0070f3]",
  failed: "text-red-500",
  draft: "text-[#737373]",
};

type SortKey = "newest" | "oldest" | "name";
type ViewMode = "grid" | "list";

function StatusBadge({ status }: { status: ProjectStatus }) {
  const Icon = STATUS_ICONS[status];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium ${STATUS_COLORS[status]}`}
      aria-label={`Status: ${STATUS_LABELS[status]}`}
    >
      <Icon size={11} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const href = project.isSample ? "/projects/sample" : `/projects/${project.id}`;
  return (
    <Link
      href={href}
      className="group block border border-[#e5e5e5] rounded-lg overflow-hidden hover:border-[#0a0a0a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2"
    >
      <div className="aspect-square bg-[#f5f5f5] flex items-center justify-center">
        <span className="text-[#d4d4d4] font-mono text-2xl select-none" aria-hidden="true">
          {project.name[0]}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-[#0a0a0a] group-hover:underline underline-offset-2 leading-snug">
            {project.name}
          </p>
          <StatusBadge status={project.status} />
        </div>
        <p className="text-xs text-[#737373] mt-0.5">{project.tag}</p>
        {project.status === "complete" && (
          <div className="flex gap-4 mt-3">
            <div>
              <p className="text-[10px] text-[#737373]">Vertices</p>
              <p className="text-xs font-mono text-[#0a0a0a]">{project.vertices}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#737373]">Faces</p>
              <p className="text-xs font-mono text-[#0a0a0a]">{project.faces}</p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const href = project.isSample ? "/projects/sample" : `/projects/${project.id}`;
  return (
    <Link
      href={href}
      className="group flex items-center justify-between px-4 py-3 rounded-lg border border-[#e5e5e5] hover:border-[#0a0a0a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#f5f5f5] rounded flex items-center justify-center flex-shrink-0">
          <span className="text-[#d4d4d4] font-mono text-sm select-none" aria-hidden="true">
            {project.name[0]}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-[#0a0a0a] group-hover:underline underline-offset-2">
            {project.name}
          </p>
          <p className="text-xs text-[#737373]">{project.tag} · {project.createdAt}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        {project.status === "complete" && (
          <div className="hidden sm:flex gap-6">
            <div className="text-right">
              <p className="text-[10px] text-[#737373]">Vertices</p>
              <p className="text-xs font-mono text-[#0a0a0a]">{project.vertices}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#737373]">Faces</p>
              <p className="text-xs font-mono text-[#0a0a0a]">{project.faces}</p>
            </div>
          </div>
        )}
        <StatusBadge status={project.status} />
      </div>
    </Link>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <PackageOpen size={32} className="text-[#d4d4d4] mb-4" aria-hidden="true" />
      {hasFilter ? (
        <>
          <p className="text-sm font-medium text-[#0a0a0a]">No projects match your filters</p>
          <p className="text-sm text-[#737373] mt-1">Try a different search or status filter.</p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-[#0a0a0a]">No projects yet</p>
          <p className="text-sm text-[#737373] mt-1 max-w-xs">
            Upload a reference image and Meshlab will turn it into an editable 3D model.
          </p>
          <Button as="a" href="/projects/new" variant="primary" size="sm" className="mt-6">
            <Plus size={14} aria-hidden="true" />
            New project
          </Button>
        </>
      )}
    </div>
  );
}

export function ProjectsLibrary() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<ViewMode>("grid");

  const filtered = useMemo(() => {
    let list: Project[] = SAMPLE_PROJECTS;

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }

    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
      return b.createdAt.localeCompare(a.createdAt);
    });

    return list;
  }, [query, statusFilter, sort]);

  const hasFilter = query.trim().length > 0 || statusFilter !== "all";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-[#0a0a0a]">Projects</h1>
        <Button as="a" href="/projects/new" variant="primary" size="sm">
          <Plus size={14} aria-hidden="true" />
          New project
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search projects"
            className="w-full h-8 pl-8 pr-3 text-sm border border-[#e5e5e5] rounded-md bg-white placeholder-[#a3a3a3] text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#0070f3] focus:ring-offset-0 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "all")}
            aria-label="Filter by status"
            className="h-8 px-3 text-sm border border-[#e5e5e5] rounded-md bg-white text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#0070f3] focus:ring-offset-0 cursor-pointer"
          >
            <option value="all">All status</option>
            <option value="complete">Complete</option>
            <option value="generating">Generating</option>
            <option value="failed">Failed</option>
            <option value="draft">Draft</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort projects"
            className="h-8 px-3 text-sm border border-[#e5e5e5] rounded-md bg-white text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#0070f3] focus:ring-offset-0 cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name</option>
          </select>

          {/* View toggle */}
          <div className="flex border border-[#e5e5e5] rounded-md overflow-hidden" role="group" aria-label="View mode">
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              className={`flex items-center justify-center w-8 h-8 transition-colors ${
                view === "grid"
                  ? "bg-[#0a0a0a] text-white"
                  : "bg-white text-[#737373] hover:text-[#0a0a0a]"
              }`}
            >
              <LayoutGrid size={14} aria-hidden="true" />
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              aria-pressed={view === "list"}
              className={`flex items-center justify-center w-8 h-8 border-l border-[#e5e5e5] transition-colors ${
                view === "list"
                  ? "bg-[#0a0a0a] text-white"
                  : "bg-white text-[#737373] hover:text-[#0a0a0a]"
              }`}
            >
              <List size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState hasFilter={hasFilter} />
      ) : view === "grid" ? (
        <ul
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Projects"
        >
          {filtered.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col gap-2" aria-label="Projects">
          {filtered.map((project) => (
            <li key={project.id}>
              <ProjectRow project={project} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
