const MAX_EDGE = 1400;
const QUALITY = 0.88;

export type IngestedImage = {
  dataUrl: string;
  width: number;
  height: number;
  kilobytes: number;
};

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
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
    let dataUrl = canvas.toDataURL("image/webp", QUALITY);
    if (!dataUrl.startsWith("data:image/webp")) {
      const fallback = file.type === "image/png" ? "image/png" : "image/jpeg";
      dataUrl = canvas.toDataURL(fallback, QUALITY);
    }
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
