import { useState, useMemo, useCallback } from 'react';
import { Box, Text, Group, Loader, Center } from '@mantine/core';
import { ComposableMap, Geographies, Geography, Graticule, ZoomableGroup } from 'react-simple-maps';

interface WorldMapProps {
  selectedCountry: string | null; // null means all
  onCountrySelect: (country: string | null) => void;
  availableCountries: string[]; // Full country names matching map NAME property
}

// Use a pre-hosted TopoJSON (small resolution) to avoid bundling large data.
// This URL is public and commonly used for demos. If you need offline, you can vendor the JSON later.
const TOPO_JSON_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Map from some inconsistent labels to canonical names if needed
const NAME_ALIASES: Record<string, string> = {
  'United States of America': 'United States',
  'United States': 'United States',
};

export function WorldMap({ selectedCountry, onCountrySelect, availableCountries }: WorldMapProps) {
  const [geoData, setGeoData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // View (center coordinates + zoom) handled by ZoomableGroup
  const [view, setView] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [0, 0],
    zoom: 1.2,
  });
  // Projection fixed to Mercator as requested

  useState(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(TOPO_JSON_URL);
        if (!res.ok) throw new Error('Failed to fetch world map');
        const json = await res.json();
        if (active) {
          setGeoData(json);
          setError(null);
        }
      } catch (e: any) {
        if (active) setError(e.message || 'Unknown error');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  });

  const availableSet = useMemo(() => new Set(availableCountries.map(c => c.toLowerCase())), [availableCountries]);

  const canonical = (name: string) => NAME_ALIASES[name] || name;

  const isAvailable = (name: string) => availableSet.has(canonical(name).toLowerCase());

  const resetToAll = useCallback(() => onCountrySelect(null), [onCountrySelect]);

  const handleLegendKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      resetToAll();
    }
  }, [resetToAll]);

  return (
    <Box style={{ background: 'transparent' }}>
      {loading && (
        <Center h={400}>
          <Loader size="sm" color="dark.3" />
        </Center>
      )}
      {error && !loading && (
        <Center h={400}>
          <Text c="dark.3" size="sm">{error}</Text>
        </Center>
      )}
      {!loading && !error && geoData && (
        <Box style={{ 
          width: '100%', 
          height: 400, 
          position: 'relative', 
          overflow: 'hidden',
          background: 'transparent'
        }}>
            <ComposableMap
              projection="geoEqualEarth"
              style={{ 
                width: '100%', 
                height: '100%', 
                background: 'transparent'
              }}
              onClick={() => onCountrySelect(null)}
            >
              <ZoomableGroup
                center={view.coordinates}
                zoom={view.zoom}
                minZoom={1}
                maxZoom={8}
                // Called after drag or wheel interactions finish
                onMoveEnd={(pos: { coordinates: [number, number]; zoom: number }) => setView({ coordinates: pos.coordinates, zoom: pos.zoom })}
              >
                <Graticule stroke="#404040" strokeWidth={0.5} opacity={0.3} />
                <Geographies geography={geoData}>
                  {({ geographies }: { geographies: any[] }) => geographies.map((geo: any) => {
                    const name: string = canonical(geo.properties.name || geo.properties.NAME || '');
                    const available = isAvailable(name);
                    const isIndividuallySelected = selectedCountry === name;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={(e: any) => {
                          e.stopPropagation();
                          if (!available) return;
                          if (isIndividuallySelected) {
                            onCountrySelect(null);
                          } else {
                            onCountrySelect(name);
                          }
                        }}
                        style={{
                          default: {
                            fill: isIndividuallySelected ? '#339af0' : available ? '#525252' : '#262626',
                            outline: 'none',
                            stroke: '#171717',
                            strokeWidth: 0.5,
                            cursor: available ? 'pointer' : 'not-allowed',
                            transition: 'fill 200ms ease'
                          },
                          hover: {
                            fill: isIndividuallySelected ? '#1c7ed6' : available ? '#737373' : '#262626',
                            outline: 'none'
                          },
                          pressed: {
                            fill: '#1c7ed6',
                            outline: 'none'
                          }
                        }}
                      />
                    );
                  })}
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </Box>
        )}

      <Group justify="center" gap="md" mt="md">
        <Group gap={4}>
          <Box 
            w={10} 
            h={10} 
            style={{ 
              background: '#339af0', 
              borderRadius: 3,
              border: '1px solid #1c7ed6'
            }} 
          />
          <Text size="xs" c="dark.1" fw={500}>Selected</Text>
        </Group>
        <Group
          gap={4}
          onClick={resetToAll}
          onKeyDown={handleLegendKey}
          role="button"
          aria-label="Show all photos"
          tabIndex={0}
          style={{ 
            cursor: 'pointer', 
            userSelect: 'none', 
            outline: 'none',
            padding: '2px 4px',
            borderRadius: '6px',
            transition: 'background-color 0.2s ease'
          }}
        >
          <Box 
            w={10} 
            h={10} 
            style={{ 
              background: '#525252', 
              borderRadius: 3,
              border: '1px solid #404040'
            }} 
          />
          <Text 
            size="xs" 
            c="dark.1" 
            fw={selectedCountry === null ? 600 : 400}
            style={{ 
              textDecoration: selectedCountry === null ? 'underline' : 'none'
            }}
          >
            {selectedCountry === null ? 'All (Active)' : 'Available'}
          </Text>
        </Group>
        <Group gap={4}>
          <Box 
            w={10} 
            h={10} 
            style={{ 
              background: '#262626', 
              borderRadius: 3,
              border: '1px solid #171717'
            }} 
          />
          <Text size="xs" c="dark.3">No Photos</Text>
        </Group>
      </Group>
    </Box>
  );
}
