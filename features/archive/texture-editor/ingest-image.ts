import type { Fit } from "../../../components/artifact/types";

const MAX_EDGE = 1024;
const QUALITY = 0.75;
const WEBP = "image/webp";

export type IngestedImage = {
  dataUrl: string;
  width: number;
  height: number;
  kilobytes: number;
};

export function canEncodeWebp() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL(WEBP).startsWith(`data:${WEBP}`);
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function encodeWebp(canvas: HTMLCanvasElement) {
  const dataUrl = canvas.toDataURL(WEBP, QUALITY);
  if (!dataUrl.startsWith(`data:${WEBP}`)) {
    throw new Error("webp encoding unsupported");
  }
  return dataUrl;
}

function isDefaultFit(fit: Fit) {
  return fit.s === 1 && fit.x === 0 && fit.y === 0 && fit.r === 0;
}

export async function cropToFace(
  src: string,
  fit: Fit,
  faceWidth: number,
  faceHeight: number,
) {
  if (faceWidth <= 0 || faceHeight <= 0) return src;
  const image = await loadImage(src);
  const { naturalWidth, naturalHeight } = image;
  const imageAspect = naturalWidth / naturalHeight;
  const faceAspect = faceWidth / faceHeight;
  if (isDefaultFit(fit) && Math.abs(imageAspect / faceAspect - 1) < 0.01)
    return src;
  const coverWidth = Math.max(faceWidth, imageAspect * faceHeight);
  const coverHeight = coverWidth / imageAspect;
  const pixelsPerUnit = Math.min(
    naturalWidth / (coverWidth * fit.s),
    MAX_EDGE / Math.max(faceWidth, faceHeight),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(faceWidth * pixelsPerUnit));
  canvas.height = Math.max(1, Math.round(faceHeight * pixelsPerUnit));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.imageSmoothingQuality = "high";
  ctx.translate(
    canvas.width * (0.5 + fit.x / 100),
    canvas.height * (0.5 + fit.y / 100),
  );
  ctx.rotate((fit.r * Math.PI) / 180);
  ctx.scale(fit.s * pixelsPerUnit, fit.s * pixelsPerUnit);
  ctx.drawImage(
    image,
    -coverWidth / 2,
    -coverHeight / 2,
    coverWidth,
    coverHeight,
  );
  return encodeWebp(canvas);
}

export async function ingestImage(file: File): Promise<IngestedImage | null> {
  if (!file.type.startsWith("image/")) return null;
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const scale = Math.min(
      1,
      MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    canvas
      .getContext("2d")
      ?.drawImage(image, 0, 0, canvas.width, canvas.height);
    const dataUrl = encodeWebp(canvas);
    return {
      dataUrl,
      width: canvas.width,
      height: canvas.height,
      kilobytes: Math.round((dataUrl.length * 0.75) / 1024),
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
