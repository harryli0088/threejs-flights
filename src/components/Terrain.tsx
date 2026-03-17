import { useRef, useState, useMemo } from 'react';
import { TextureLoader, Texture } from 'three';
import { useFrame } from '@react-three/fiber';
import { latLonToTile, tileMetersWidth } from '../utils/tiles';
import { useAirportStore } from '../store/airport';
import React from 'react';

// Determine zoom based on camera height
function getZoomFromCameraHeight(y: number): number {
  if (y > 80000) return 9;
  if (y > 40000) return 10;
  if (y > 20000) return 11;
  if (y > 8000) return 12;
  if (y > 3000) return 13;
  return 14;
}

// Texture cache to avoid reloading
const textureCache = new Map<string, Texture>();

// Hook to load a tile texture and cache it
function useTileTexture(zoom: number, x: number, y: number) {
  const [texture, setTexture] = useState<Texture | null>(null);
  const key = `${zoom}/${x}/${y}`;

  useMemo(() => {
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

// Memoized tile component
interface TerrainTileProps {
  zoom: number;
  tileX: number;
  tileY: number;
  worldX: number;
  worldZ: number;
  tileSize: number;
}
const TerrainTile = React.memo(function TerrainTile({ zoom, tileX, tileY, worldX, worldZ, tileSize }: TerrainTileProps) {
  const texture = useTileTexture(zoom, tileX, tileY);
  if (!texture) return null;

  return (
    <mesh position={[worldX, -10, worldZ]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[tileSize, tileSize]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
});

export function Terrain() {
  const { airport } = useAirportStore();
  const [zoom, setZoom] = useState(11);
  const zoomRef = useRef(zoom);

  // Update zoom based on camera height
  useFrame(({ camera }) => {
    const newZoom = getZoomFromCameraHeight(camera.position.y);
    if (zoomRef.current !== newZoom) {
      zoomRef.current = newZoom;
      setZoom(newZoom);
    }
  });

  const tileSize = tileMetersWidth(airport.lat, zoom);
  const centerTile = latLonToTile(airport.lat, airport.lon, zoom);

  const subTileOffsetX = (centerTile.fracX - 0.5) * tileSize;
  const subTileOffsetZ = (centerTile.fracY - 0.5) * tileSize;

  const radius = 6;

  // Memoize tile generation
  const tiles = useMemo(() => {
    const arr = [];
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const worldX = dx * tileSize - subTileOffsetX;
        const worldZ = dy * tileSize - subTileOffsetZ;

        arr.push(
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
    return arr;
  }, [zoom, centerTile.x, centerTile.y, tileSize, subTileOffsetX, subTileOffsetZ]);

  return <>{tiles}</>;
}