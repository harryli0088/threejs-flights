import { useEffect, useState } from 'react';
import { TextureLoader, Texture } from 'three';
import { useFrame } from '@react-three/fiber';
import { latLonToTile, tileMetersWidth } from '../utils/tiles';
import { useAirportStore } from '../store/airport';


function getZoomFromCameraHeight(y: number): number {
  if (y > 80000) return 9;
  if (y > 40000) return 10;
  if (y > 20000) return 11;
  if (y > 8000)  return 12;
  if (y > 3000)  return 13;
  return 14;
}

const textureCache = new Map<string, Texture>();

function useTileTexture(zoom: number, x: number, y: number) {
  const [texture, setTexture] = useState<Texture | null>(null);
  const key = `${zoom}/${x}/${y}`;

  useEffect(() => {
    if (textureCache.has(key)) {
      setTexture(textureCache.get(key)!);
      return;
    }
    const loader = new TextureLoader();
    const url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;
    loader.load(url, (tex) => {
      textureCache.set(key, tex);
      setTexture(tex);
    });
  }, [key]);

  return texture;
}

interface TerrainTileProps {
  zoom: number;
  tileX: number;
  tileY: number;
  // Position in world space (meters), center of tile
  worldX: number;
  worldZ: number;
  tileSize: number;
}

function TerrainTile({ zoom, tileX, tileY, worldX, worldZ, tileSize }: TerrainTileProps) {
  const texture = useTileTexture(zoom, tileX, tileY);
  if (!texture) return null;

  return (
    <mesh position={[worldX, -10, worldZ]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[tileSize, tileSize]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export function Terrain() {
  const { airport } = useAirportStore();
  const [zoom, setZoom] = useState(11);

  useFrame(({ camera }) => {
    const zoom = getZoomFromCameraHeight(camera.position.y);
    setZoom((prev) => (prev !== zoom ? zoom : prev));
  });

  const tileSize = tileMetersWidth(airport.lat, zoom);
  const centerTile = latLonToTile(airport.lat, airport.lon, zoom);

  // Airport's exact pixel position within the center tile, converted to meters
  // fracX/fracY are 0-1 within the tile; subtract 0.5 to get offset from tile center
  const subTileOffsetX = (centerTile.fracX - 0.5) * tileSize;
  const subTileOffsetZ = (centerTile.fracY - 0.5) * tileSize;

  const radius = 6;
  const tiles = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      // World position = tile offset in tiles * tileSize, then subtract the sub-tile offset
      // so that the airport lat/lon lands exactly at world (0, 0)
      const worldX = dx * tileSize - subTileOffsetX;
      const worldZ = dy * tileSize - subTileOffsetZ;

      tiles.push(
        <TerrainTile
          key={`${zoom}-${centerTile.x + dx}-${centerTile.y + dy}`}
          zoom={zoom}
          tileX={centerTile.x + dx}
          tileY={centerTile.y + dy}
          worldX={worldX}
          worldZ={worldZ}
          tileSize={tileSize}
        />
      );
    }
  }

  return <>{tiles}</>;
}