export function latLonToTileFloat(lat: number, lon: number, zoom: number) {
  const n = 2 ** zoom;
  const xFloat = ((lon + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const yFloat = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { xFloat, yFloat };
}

export function latLonToTile(lat: number, lon: number, zoom: number) {
  const { xFloat, yFloat } = latLonToTileFloat(lat, lon, zoom);
  return {
    x: Math.floor(xFloat),
    y: Math.floor(yFloat),
    fracX: xFloat - Math.floor(xFloat),
    fracY: yFloat - Math.floor(yFloat),
  };
}

// Exact meters per tile using ellipsoid circumference
export function tileMetersWidth(lat: number, zoom: number): number {
  const earthCircumference = 2 * Math.PI * 6378137;
  return (earthCircumference * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;
}