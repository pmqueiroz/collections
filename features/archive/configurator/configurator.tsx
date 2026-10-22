"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Artifact } from "../../../components/artifact/artifact";
import { DEFAULT_FIT } from "../../../components/artifact/geometry";
import type {
  FaceSide,
  Fit,
  Geometry,
} from "../../../components/artifact/types";
import { Button, buttonClass } from "../../../components/ui/button";
import { cx } from "../../../components/ui/cx";
import { RangeField } from "../../../components/ui/range-field";
import { SectionLabel } from "../../../components/ui/section-label";
import { SegmentedControl } from "../../../components/ui/segmented-control";
import { type CatalogItem, defaultGeometry, KIND_LABEL } from "../catalog";
import { type ArtifactConfig, artifactProps } from "../config-store";
import { AuthForm } from "./auth-form";
import { downloadTemplate } from "./download-template";
import { FaceEditor } from "./face-editor";
import { ingestImage } from "./ingest-image";
import {
  displayValue,
  FIT_FIELDS,
  GEOMETRY_FIELDS,
  OPTION_FIELDS,
} from "./schema";

type ConfiguratorProps = {
  item: CatalogItem;
  config: ArtifactConfig;
  stored: boolean;
  authed: boolean;
  onAuthed: () => void;
  onSave: (draft: ArtifactConfig) => boolean;
  onDelete: () => boolean;
  onClose: () => void;
};

const FIT_KEY: Record<FaceSide, "fo" | "fr"> = { obv: "fo", rev: "fr" };

function clone(config: ArtifactConfig): ArtifactConfig {
  return structuredClone(config);
}

export function Configurator({
  item,
  config,
  stored,
  authed,
  onAuthed,
  onSave,
  onDelete,
  onClose,
}: ConfiguratorProps) {
  const [draft, setDraft] = useState(() => clone(config));
  const [side, setSide] = useState<FaceSide>("obv");
  const [spinning, setSpinning] = useState(false);
  const [status, setStatus] = useState("");
  const [askAuth, setAskAuth] = useState(false);
  const pending = useRef<(() => void) | null>(null);
  const live = useRef({ askAuth, onClose });
  live.current = { askAuth, onClose };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (live.current.askAuth) setAskAuth(false);
      else live.current.onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fitKey = FIT_KEY[side];
  const fit = draft[fitKey];
  const image = draft[side];
  const sideLabel = side === "obv" ? "obverse" : "reverse";

  const setGeo = <K extends keyof Geometry>(key: K, value: Geometry[K]) =>
    setDraft((current) => ({
      ...current,
      geo: { ...current.geo, [key]: value },
    }));
  const setFit = (patch: Partial<Fit>) =>
    setDraft((current) => ({
      ...current,
      [fitKey]: { ...current[fitKey], ...patch },
    }));

  const ingest = async (file: File | undefined) => {
    if (!file) return;
    try {
      const result = await ingestImage(file);
      if (!result) return;
      setDraft((current) => ({
        ...current,
        [side]: result.dataUrl,
        [fitKey]: { ...DEFAULT_FIT },
      }));
      setStatus(
        `${side} · ${result.width}×${result.height} px · ${result.kilobytes} kB · unsaved`,
      );
    } catch {
      setStatus("unreadable image");
    }
  };

  const onFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    ingest(file);
  };

  const requireAuth = (action: () => void) => {
    if (authed) return action();
    pending.current = action;
    setAskAuth(true);
  };

  const save = () =>
    requireAuth(() => {
      if (!onSave(draft)) setStatus("storage full · not saved");
    });
  const remove = () =>
    requireAuth(() => {
      if (!onDelete()) setStatus("storage full · not saved");
    });

  const handleAuthed = () => {
    setAskAuth(false);
    onAuthed();
    const action = pending.current;
    pending.current = null;
    action?.();
  };

  return (
    <div className="fixed inset-0 z-50 box-border flex items-center justify-center bg-ink/14 p-6">
      <div
        role="dialog"
        aria-modal
        aria-label={`Configure ${item.id}`}
        className="flex h-[min(800px,100%)] w-[min(1120px,100%)] flex-col overflow-hidden rounded-xs border border-line bg-paper shadow-modal"
      >
        <div className="flex items-baseline gap-3 border-b border-line px-5 py-3.5">
          <div className="mono text-cell">{item.id}</div>
          <div className="truncate text-heading font-medium">{item.title}</div>
          <div className="mr-auto mono text-tag uppercase tracking-label text-faint">
            Texture · Mesh
          </div>
          <Button onClick={onClose}>Close · Esc</Button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
          <div className="flex min-h-0 flex-col overflow-y-auto border-r border-line">
            <div className="relative h-[clamp(200px,36vh,340px)] flex-none border-b border-line bg-surface">
              <Artifact
                {...artifactProps(item, draft)}
                mode="orbit"
                rotating={spinning}
                flipped={side === "rev"}
                zoom={1}
                fit={270}
              />
              <div className="pointer-events-none absolute left-3.5 top-3 mono text-tag text-faint">
                live · draft
              </div>
              <Button
                onClick={() => setSpinning((value) => !value)}
                className="absolute bottom-3 right-3"
              >
                {spinning ? "❚❚ Hold" : "▶ Orbit"}
              </Button>
            </div>
            <div className="flex flex-none flex-col gap-3 px-5 pb-4 pt-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <SegmentedControl
                  size="md"
                  value={side}
                  onChange={setSide}
                  options={(["obv", "rev"] as const).map((value) => ({
                    value,
                    label: (
                      <>
                        {value === "obv" ? "Obverse" : "Reverse"}
                        <span className="text-[9px]">
                          {draft[value] ? "■" : "□"}
                        </span>
                      </>
                    ),
                  }))}
                />
                <div className="ml-auto flex flex-wrap gap-1.5">
                  <label className={cx(buttonClass(), "box-border")}>
                    Image…
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFileInput}
                      className="hidden"
                    />
                  </label>
                  <Button
                    onClick={() =>
                      setDraft((current) => ({ ...current, [side]: "" }))
                    }
                    className={image ? "text-ink" : "text-faint"}
                  >
                    Remove
                  </Button>
                  <Button
                    onClick={() => downloadTemplate(item, draft.geo, side)}
                  >
                    Template ↓
                  </Button>
                </div>
              </div>
              <FaceEditor
                item={item}
                geo={draft.geo}
                image={image}
                fit={fit}
                sideLabel={sideLabel}
                onFit={setFit}
                onFile={ingest}
              />
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-[22px] overflow-y-auto px-5 pb-6 pt-3.5">
            <div className="flex flex-col">
              <SectionLabel className="pb-2">Fit · {sideLabel}</SectionLabel>
              {FIT_FIELDS.map((field) => (
                <RangeField
                  key={field.key}
                  label={field.label}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={displayValue(fit[field.key], field.step)}
                  onChange={(value) => setFit({ [field.key]: value })}
                />
              ))}
            </div>
            <div className="flex flex-col">
              <SectionLabel className="pb-2">
                Mesh · {KIND_LABEL[item.kind]}
              </SectionLabel>
              {GEOMETRY_FIELDS[item.kind].map((field) => (
                <RangeField
                  key={field.key}
                  label={field.label}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={displayValue(draft.geo[field.key], field.step)}
                  onChange={(value) => setGeo(field.key, value)}
                />
              ))}
              {OPTION_FIELDS[item.kind].map((option) => (
                <div
                  key={option.key}
                  className="grid h-9 grid-cols-[92px_minmax(0,1fr)] items-center gap-3 border-b border-line"
                >
                  <div className="mono text-tag uppercase text-muted">
                    {option.label}
                  </div>
                  {option.key === "edge" ? (
                    <SegmentedControl
                      className="justify-self-start"
                      options={option.choices}
                      value={draft.geo.edge ?? "reeded"}
                      onChange={(value) => setGeo("edge", value)}
                    />
                  ) : (
                    <SegmentedControl
                      className="justify-self-start"
                      options={option.choices}
                      value={draft.geo.chip !== false}
                      onChange={(value) => setGeo("chip", value)}
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-1.5 pt-3">
                <Button
                  onClick={() => {
                    setDraft(clone(config));
                    setStatus("reverted");
                  }}
                >
                  Revert
                </Button>
                <Button
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      geo: defaultGeometry(item),
                    }))
                  }
                >
                  Catalog defaults
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-line px-5 py-3">
          {askAuth ? (
            <AuthForm onAuthed={handleAuthed} />
          ) : (
            <div className="mono text-meta text-faint">
              {status || (stored ? "stored override" : "catalog defaults")}
            </div>
          )}
          <div className="ml-auto flex gap-1.5">
            {stored && <Button onClick={remove}>Delete config</Button>}
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={save}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
