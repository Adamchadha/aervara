"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addProjectFile, deleteProjectFile } from "@/app/properties/project-file-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ProjectFileCategory, ProjectFileRow } from "@/types/project-file";

const CATEGORY_ORDER: ProjectFileCategory[] = [
  "floor_plan",
  "zoning_notes",
  "underwriting_notes",
  "concept_visuals",
  "document",
];

const CATEGORY_META: Record<
  ProjectFileCategory,
  { title: string; blurb: string }
> = {
  floor_plan: {
    title: "Floor plans",
    blurb: "CAD, PDFs, or dimensioned plans for this parcel or building.",
  },
  zoning_notes: {
    title: "Zoning notes",
    blurb: "Staff reports, variance memos, and entitlement summaries.",
  },
  underwriting_notes: {
    title: "Underwriting notes",
    blurb: "Pro forma assumptions, rent comps, and capital memos.",
  },
  concept_visuals: {
    title: "Concept visuals",
    blurb: "Massing, elevations, mood boards, and design intent imagery.",
  },
  document: {
    title: "Documents & PDFs",
    blurb: "OMs, surveys, title, environmental—anything in a linkable file.",
  },
};

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function previewNotes(text: string | null, max = 140): string {
  if (!text?.trim()) return "";
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function FileCard({
  row,
  propertyId,
  onRemoved,
  readOnly,
}: {
  row: ProjectFileRow;
  propertyId: string;
  onRemoved: () => void;
  readOnly?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(false);
  const hasLink = Boolean(row.link_url?.trim());

  async function confirmRemove() {
    if (readOnly) return;
    setPending(true);
    const res = await deleteProjectFile({ propertyId, fileId: row.id });
    setPending(false);
    setRemoveConfirm(false);
    if (res.ok) onRemoved();
  }

  return (
    <article
      className={cn(
        "aervara-elevate-card group relative flex flex-col rounded-2xl border border-stone-200/75 bg-white/95 p-5",
        "shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_10px_28px_-20px_rgba(15,23,42,0.12)] ring-1 ring-stone-900/[0.025]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
            Reference
          </p>
          <h4 className="mt-1 font-semibold leading-snug tracking-tight text-stone-900">
            {row.title}
          </h4>
        </div>
        {readOnly ? null : removeConfirm ? (
          <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
            <span className="text-[11px] font-medium text-stone-600">Remove?</span>
            <Button
              type="button"
              variant="secondary"
              className="h-8 px-2.5 text-[11px]"
              disabled={pending}
              onClick={() => setRemoveConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-8 px-2.5 text-[11px]"
              disabled={pending}
              onClick={() => void confirmRemove()}
            >
              {pending ? "…" : "Remove"}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="h-8 shrink-0 px-2 text-[11px] text-stone-500 opacity-80 hover:text-red-700 group-hover:opacity-100"
            disabled={pending}
            onClick={() => setRemoveConfirm(true)}
          >
            Remove
          </Button>
        )}
      </div>

      {hasLink ? (
        <a
          href={row.link_url!}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-sky-800 underline decoration-sky-800/30 underline-offset-4 hover:decoration-sky-800/70"
        >
          <span className="truncate">{row.link_url}</span>
          <span className="shrink-0 text-xs opacity-70" aria-hidden>
            ↗
          </span>
        </a>
      ) : (
        <p className="mt-3 inline-flex w-fit rounded-md border border-dashed border-amber-200/90 bg-amber-50/50 px-2.5 py-1 text-[11px] font-medium text-amber-950/80">
          Upload coming soon — add a link when you have one
        </p>
      )}

      {row.notes?.trim() ? (
        <p className="mt-3 border-t border-stone-100/90 pt-3 text-sm leading-relaxed text-stone-600">
          {previewNotes(row.notes)}
        </p>
      ) : null}

      <p className="mt-4 text-[11px] tabular-nums text-stone-400">
        Added {formatWhen(row.created_at)}
      </p>
    </article>
  );
}

function CategoryPlaceholder({ blurb }: { blurb: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-stone-200/90 bg-stone-50/40 px-5 py-8 lg:col-span-2",
        "text-center text-sm leading-relaxed text-stone-500",
      )}
    >
      <p className="font-medium text-stone-700">No references yet</p>
      <p className="mx-auto mt-2 max-w-md text-xs text-stone-500">{blurb}</p>
      <p className="mx-auto mt-3 max-w-md text-[11px] text-stone-400">
        Direct uploads will attach here in a future release. Use{" "}
        <span className="font-medium text-stone-600">Add reference</span> to
        paste a link (Drive, Dropbox, data room, etc.).
      </p>
    </div>
  );
}

type ProjectFilesPanelProps = {
  propertyId: string;
  initialFiles: ProjectFileRow[];
  className?: string;
  readOnly?: boolean;
};

export function ProjectFilesPanel({
  propertyId,
  initialFiles,
  className,
  readOnly = false,
}: ProjectFilesPanelProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ProjectFileCategory>("floor_plan");
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const close = useCallback(() => {
    dialogRef.current?.close();
    setOpen(false);
    setTitle("");
    setLinkUrl("");
    setNotes("");
    setError(null);
    setCategory("floor_plan");
  }, []);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) el.showModal();
    else el.close();
  }, [open]);

  function filesFor(cat: ProjectFileCategory) {
    return initialFiles.filter((f) => f.category === cat);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    setError(null);
    const t = title.trim();
    if (!t) {
      setError("Add a short title for this reference.");
      return;
    }
    setPending(true);
    const res = await addProjectFile({
      propertyId,
      category,
      title: t,
      linkUrl: linkUrl.trim() === "" ? null : linkUrl.trim(),
      notes: notes.trim() === "" ? null : notes.trim(),
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    close();
    router.refresh();
  }

  return (
    <div className={cn("space-y-10", className)}>
      <div className="flex flex-col gap-4 border-b border-stone-200/60 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
            Collaboration shelf
          </p>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Organize links and notes by workstream—so this Site Room reads like
            a document room, not a file dump. Binary uploads are on the
            roadmap; today everything flows through secure links you control.
          </p>
        </div>
        <Button
          type="button"
          className="h-10 shrink-0 self-start sm:self-auto"
          disabled={readOnly}
          title={readOnly ? "Disabled in Pro Preview" : undefined}
          onClick={() => {
            if (readOnly) return;
            setError(null);
            setOpen(true);
          }}
        >
          Add reference
        </Button>
      </div>

      <div className="space-y-12">
        {CATEGORY_ORDER.map((cat) => {
          const list = filesFor(cat);
          const meta = CATEGORY_META[cat];
          return (
            <section key={cat} aria-labelledby={`pf-${cat}-heading`}>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h3
                  id={`pf-${cat}-heading`}
                  className="text-base font-semibold tracking-tight text-stone-900"
                >
                  {meta.title}
                </h3>
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-stone-400">
                  {list.length} {list.length === 1 ? "item" : "items"}
                </span>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {list.map((row) => (
                  <FileCard
                    key={row.id}
                    row={row}
                    readOnly={readOnly}
                    propertyId={propertyId}
                    onRemoved={() => router.refresh()}
                  />
                ))}
                {list.length === 0 ? <CategoryPlaceholder blurb={meta.blurb} /> : null}
              </div>
            </section>
          );
        })}
      </div>

      <dialog
        ref={dialogRef}
        className={cn(
          "fixed left-1/2 top-1/2 z-[200] w-[min(calc(100vw-1.5rem),26rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200/80 bg-white p-0",
          "shadow-[0_32px_80px_-24px_rgba(15,23,42,0.28)] ring-1 ring-stone-900/[0.06]",
          "[&::backdrop]:bg-stone-950/[0.42] [&::backdrop]:backdrop-blur-[3px]",
        )}
        aria-labelledby={titleId}
        onClose={close}
        onCancel={(ev) => {
          ev.preventDefault();
          close();
        }}
      >
        <div className="border-b border-stone-100 px-6 py-5 sm:px-7">
          <p
            id={titleId}
            className="text-base font-semibold tracking-tight text-neutral-950"
          >
            Add reference
          </p>
          <p className="mt-1.5 text-sm text-neutral-500">
            Link to a file in your stack; optional notes help collaborators scan
            faster.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 sm:px-7">
          <div className="space-y-2">
            <Label
              htmlFor="pf-category"
              className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400"
            >
              Category
            </Label>
            <select
              id="pf-category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ProjectFileCategory)
              }
              className={cn(
                "h-11 w-full rounded-xl border border-stone-200/90 bg-white px-3.5 text-sm text-neutral-950",
                "focus-visible:border-stone-300/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/15",
              )}
            >
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_META[c].title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-title" className="text-xs text-neutral-500">
              Title
            </Label>
            <Input
              id="pf-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="e.g. As-built L2 — Rev C"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-url" className="text-xs text-neutral-500">
              Link (optional)
            </Label>
            <Input
              id="pf-url"
              type="url"
              inputMode="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://…"
            />
            <p className="text-[11px] text-neutral-400">
              Paste a share link; http(s) only. Leave blank for a placeholder card
              until you have a URL.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-notes" className="text-xs text-neutral-500">
              Notes (optional)
            </Label>
            <Textarea
              id="pf-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="What this file is, who produced it, or what to look for…"
              className="resize-y text-sm"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button type="button" variant="ghost" disabled={pending} onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save reference"}
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
