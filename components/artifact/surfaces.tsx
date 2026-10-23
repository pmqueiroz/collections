import Image from "next/image";
import { type CSSProperties, type ReactNode, useState } from "react";
import { cx } from "../ui/cx";
import { fitTransform } from "./geometry";
import type { Fit } from "./types";

export function Sheen({
  strength,
  spread = "58%",
}: {
  strength: number;
  spread?: string;
}) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(circle at var(--sx, 32%) var(--sy, 26%), rgba(245,244,240,${strength}) 0%, rgba(245,244,240,0) ${spread})`,
      }}
    />
  );
}

export function FaceImage({
  src,
  fit,
  backing,
}: {
  src: string;
  fit?: Fit;
  backing: string;
}) {
  return (
    <>
      <div className="absolute inset-0" style={{ background: backing }} />
      <FittedImage src={src} fit={fit} />
    </>
  );
}

function coverSize(aspect: number): CSSProperties {
  return {
    left: "50%",
    top: "50%",
    right: "auto",
    bottom: "auto",
    width: `max(100cqw, ${aspect} * 100cqh)`,
    height: `max(100cqh, 100cqw / ${aspect})`,
    maxWidth: "none",
    translate: "-50% -50%",
  };
}

export function FittedImage({
  src,
  fit,
  className,
}: {
  src: string;
  fit?: Partial<Fit>;
  className?: string;
}) {
  const [natural, setNatural] = useState<{ src: string; aspect: number }>();
  const aspect = natural?.src === src ? natural.aspect : null;

  return (
    <div
      className={cx("absolute inset-0", className)}
      style={{ containerType: "size", transform: fitTransform(fit) }}
    >
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        draggable={false}
        className="object-cover"
        style={aspect ? coverSize(aspect) : undefined}
        onLoad={(event) => {
          const { naturalWidth, naturalHeight } = event.currentTarget;
          if (naturalWidth && naturalHeight)
            setNatural({ src, aspect: naturalWidth / naturalHeight });
        }}
      />
    </div>
  );
}

export function MonoText({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cx("font-mono whitespace-nowrap text-muted", className)}
      style={style}
    >
      {children}
    </div>
  );
}
