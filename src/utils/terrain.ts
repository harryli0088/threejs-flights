// Mapbox encodes elevation in RGB: height = -10000 + (R*256*256 + G*256 + B) * 0.1
export function decodeMapboxElevation(r: number, g: number, b: number): number {
  return -10000 + (r * 256 * 256 + g * 256 + b) * 0.1;
}

export async function fetchHeightmap(
  zoom: number,
  x: number,
  y: number,
): Promise<Float32Array> {
  const url = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
  
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const { data } = ctx.getImageData(0, 0, img.width, img.height);
  const heights = new Float32Array(img.width * img.height);

  for (let i = 0; i < heights.length; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    heights[i] = decodeMapboxElevation(r, g, b);
  }

  return heights;
}

export async function fetchElevationGrid(
  lat: number,
  lon: number,
  gridSize: number = 64
): Promise<Float32Array> {
  // Sample a gridSize x gridSize grid around the airport
  const spread = 0.3; // degrees
  const points: string[] = [];

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const sampleLat = lat - spread + (i / (gridSize - 1)) * spread * 2;
      const sampleLon = lon - spread + (j / (gridSize - 1)) * spread * 2;
      points.push(`${sampleLat},${sampleLon}`);
    }
  }

  // OpenTopoData allows 100 locations per request
  const chunkSize = 100;
  const heights = new Float32Array(gridSize * gridSize);

  for (let i = 0; i < points.length; i += chunkSize) {
    const chunk = points.slice(i, i + chunkSize).join('|');
    const res = await fetch(
      `https://api.opentopodata.org/v1/srtm90m?locations=${chunk}`
    );
    const data = await res.json();
    data.results.forEach((r: { elevation: number }, idx: number) => {
      heights[i + idx] = r.elevation ?? 0;
    });
    // Rate limit: 1 request/second on free tier
    await new Promise(resolve => setTimeout(resolve, 1100));
  }

  return heights;
}