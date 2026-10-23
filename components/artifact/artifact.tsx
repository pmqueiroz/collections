"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import { cx } from "../ui/cx";
import { Card } from "./card";
import { Coin } from "./coin";
import { clamp } from "./geometry";
import { Note } from "./note";
import { Stamp } from "./stamp";
import type { SurfaceProps } from "./surface-props";
import type { ArtifactKind, ArtifactMode } from "./types";

export type ArtifactProps = Partial<SurfaceProps> & {
  kind: ArtifactKind;
  mode?: ArtifactMode;
  rotating?: boolean;
  flipped?: boolean;
  zoom?: number;
  rpm?: number;
  fit?: number;
  resetKey?: string | number;
  onZoom?: (direction: 1 | -1) => void;
  className?: string;
  style?: CSSProperties;
};

const MESH = { coin: Coin, note: Note, card: Card, stamp: Stamp };

type Motion = {
  rx: number;
  ry: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  orbit: number;
  flip: number;
  flipVelocity: number;
  zoom: number;
  zoomVelocity: number;
  dragX: number;
  dragY: number;
  base: number;
  frame: number;
  last: number;
  wheel: number;
  drag: { x: number; y: number } | null;
  pointers: Map<number, { x: number; y: number }>;
  pinch: number | null;
};

function spring(
  position: number,
  velocity: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
): [number, number] {
  const next =
    velocity + (-stiffness * (position - target) - damping * velocity) * dt;
  return [position + next * dt, next];
}

export function Artifact({
  kind,
  mode = "static",
  rotating = true,
  flipped = false,
  zoom = 1,
  rpm = 2,
  fit = 250,
  resetKey,
  onZoom,
  className,
  style,
  geo = {},
  obv = "",
  rev = "",
  fo,
  fr,
  face = "",
  code = "",
  year = "",
  origin = "",
}: ArtifactProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const live = useRef({ mode, rotating, flipped, zoom, rpm, fit, onZoom });
  live.current = { mode, rotating, flipped, zoom, rpm, fit, onZoom };
  const motion = useRef<Motion>({
    rx: 0,
    ry: 0,
    vx: 0,
    vy: 0,
    tx: 0,
    ty: 0,
    orbit: 0,
    flip: flipped ? 180 : 0,
    flipVelocity: 0,
    zoom,
    zoomVelocity: 0,
    dragX: 0,
    dragY: 0,
    base: 0.8,
    frame: 0,
    last: 0,
    wheel: 0,
    drag: null,
    pointers: new Map(),
    pinch: null,
  });
  const kickRef = useRef<() => void>(() => {});

  useEffect(() => {
    const root = rootRef.current;
    const rig = rigRef.current;
    if (!root || !rig) return;
    const m = motion.current;

    const apply = () => {
      const current = live.current.mode;
      let x = -15;
      let y = 15;
      let scale = m.base;
      if (current === "tilt") {
        x += m.rx;
        y += m.ry;
      }
      if (current === "orbit") {
        x += m.dragX;
        y += m.orbit + m.dragY + m.flip;
        scale *= m.zoom;
      }
      rig.style.transform = `scale(${scale.toFixed(4)}) rotateX(${x.toFixed(3)}deg) rotateY(${y.toFixed(3)}deg)`;
      const sx =
        current === "orbit"
          ? 40 - Math.sin((y * Math.PI) / 180) * 26
          : 32 + m.ry * 1.8;
      const sy =
        26 -
        (current === "tilt"
          ? m.rx * 1.8
          : current === "orbit"
            ? m.dragX * 0.4
            : 0);
      root.style.setProperty("--sx", `${sx.toFixed(1)}%`);
      root.style.setProperty("--sy", `${sy.toFixed(1)}%`);
    };

    const tick = (time: number) => {
      const dt = m.last ? Math.min(0.05, (time - m.last) / 1000) : 0.016;
      m.last = time;
      const props = live.current;
      let moving = false;
      if (props.mode === "tilt") {
        [m.rx, m.vx] = spring(m.rx, m.vx, m.tx, 170, 13, dt);
        [m.ry, m.vy] = spring(m.ry, m.vy, m.ty, 170, 13, dt);
        moving =
          Math.abs(m.rx - m.tx) > 0.01 ||
          Math.abs(m.ry - m.ty) > 0.01 ||
          Math.abs(m.vx) > 0.01 ||
          Math.abs(m.vy) > 0.01;
      } else if (props.mode === "orbit") {
        if (props.rotating && !m.drag) {
          m.orbit += (props.rpm || 2) * 6 * dt;
          moving = true;
        }
        const flipTarget = props.flipped ? 180 : 0;
        const zoomTarget = props.zoom || 1;
        [m.flip, m.flipVelocity] = spring(
          m.flip,
          m.flipVelocity,
          flipTarget,
          70,
          12,
          dt,
        );
        [m.zoom, m.zoomVelocity] = spring(
          m.zoom,
          m.zoomVelocity,
          zoomTarget,
          160,
          24,
          dt,
        );
        moving =
          moving ||
          Math.abs(m.flip - flipTarget) > 0.05 ||
          Math.abs(m.flipVelocity) > 0.05 ||
          Math.abs(m.zoom - zoomTarget) > 0.001 ||
          Math.abs(m.zoomVelocity) > 0.001;
      }
      apply();
      m.frame = moving ? requestAnimationFrame(tick) : 0;
    };

    const kick = () => {
      if (!m.frame) {
        m.last = 0;
        m.frame = requestAnimationFrame(tick);
      }
    };
    kickRef.current = kick;

    const resize = () => {
      const { clientWidth, clientHeight } = root;
      if (clientWidth && clientHeight) {
        m.base =
          Math.min(clientWidth, clientHeight) / (live.current.fit || 250);
        apply();
      }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    resize();

    const pinchSpan = () => {
      const [a, b] = [...m.pointers.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    const onMove = (event: PointerEvent) => {
      const current = live.current.mode;
      const pinching =
        current === "orbit" &&
        m.pinch !== null &&
        m.pointers.size === 2 &&
        m.pointers.has(event.pointerId);
      if (pinching) {
        m.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const span = pinchSpan();
        const ratio = span / (m.pinch ?? span);
        const zoomHandler = live.current.onZoom;
        if ((ratio > 1.1 || ratio < 0.91) && zoomHandler) {
          zoomHandler(ratio > 1 ? 1 : -1);
          m.pinch = span;
        }
      } else if (current === "tilt") {
        const rect = root.getBoundingClientRect();
        const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        m.ty = clamp(nx, -1, 1) * 12;
        m.tx = -clamp(ny, -1, 1) * 12;
        kick();
      } else if (current === "orbit" && m.drag) {
        m.dragY += (event.clientX - m.drag.x) * 0.5;
        m.dragX = clamp(m.dragX - (event.clientY - m.drag.y) * 0.5, -70, 70);
        m.drag = { x: event.clientX, y: event.clientY };
        kick();
      }
    };
    const onLeave = () => {
      if (live.current.mode === "tilt") {
        m.tx = 0;
        m.ty = 0;
        kick();
      }
    };
    const onDown = (event: PointerEvent) => {
      if (live.current.mode !== "orbit") return;
      m.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (m.pointers.size === 2) {
        m.pinch = pinchSpan();
        m.drag = null;
        return;
      }
      m.drag = { x: event.clientX, y: event.clientY };
      try {
        root.setPointerCapture(event.pointerId);
      } catch {}
      root.style.cursor = "grabbing";
    };
    const onUp = (event: PointerEvent) => {
      m.pointers.delete(event.pointerId);
      if (m.pointers.size < 2) m.pinch = null;
      if (!m.drag) return;
      m.drag = null;
      root.style.cursor = "grab";
      kick();
    };
    const onWheel = (event: WheelEvent) => {
      const { mode: current, onZoom: zoomHandler } = live.current;
      if (current !== "orbit" || !zoomHandler) return;
      event.preventDefault();
      m.wheel += event.deltaY;
      if (Math.abs(m.wheel) > 40) {
        zoomHandler(m.wheel < 0 ? 1 : -1);
        m.wheel = 0;
      }
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    root.addEventListener("wheel", onWheel, { passive: false });
    kick();

    return () => {
      cancelAnimationFrame(m.frame);
      m.frame = 0;
      observer.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("wheel", onWheel);
    };
  }, []);

  const resetRef = useRef(resetKey);
  useEffect(() => {
    if (resetRef.current !== resetKey) {
      resetRef.current = resetKey;
      const m = motion.current;
      m.orbit = 0;
      m.dragX = 0;
      m.dragY = 0;
      m.flip = live.current.flipped ? 180 : 0;
      m.flipVelocity = 0;
    }
    kickRef.current();
  });

  const Mesh = MESH[kind];
  const orbit = mode === "orbit";

  return (
    <div
      ref={rootRef}
      className={cx(
        "relative size-full overflow-hidden select-none",
        className,
      )}
      style={{
        touchAction: orbit ? "none" : "auto",
        cursor: orbit ? "grab" : "inherit",
        ...style,
      }}
    >
      <div
        className="pointer-events-none absolute bottom-[9%] left-[18%] right-[18%] h-[9%] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(22,22,21,0.09) 0%, rgba(22,22,21,0) 70%)",
        }}
      />
      <div
        ref={rigRef}
        className="absolute left-1/2 top-1/2 -ml-[120px] -mt-[120px] size-60 transform-3d"
        style={{ transform: "scale(0.8) rotateX(-15deg) rotateY(15deg)" }}
      >
        <Mesh
          geo={geo}
          obv={obv}
          rev={rev}
          fo={fo}
          fr={fr}
          face={face}
          code={code}
          year={year}
          origin={origin}
          flat={mode === "flat"}
        />
      </div>
    </div>
  );
}
