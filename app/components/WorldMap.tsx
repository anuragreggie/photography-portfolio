import { useState, useMemo, useCallback } from 'react';
import { Box, Text, Group, Loader, Center } from '@mantine/core';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { motion } from 'framer-motion';

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
          <Center h={360}>
            <Loader size="sm" />
          </Center>
        )}
        {error && !loading && (
          <Center h={360}>
            <Text c="red" size="sm">{error}</Text>
          </Center>
        )}
        {!loading && !error && geoData && (
          <Box style={{ width: '100%', height: 360, position: 'relative' }}>
            <ComposableMap
              projection="geoMercator"
              style={{ width: '100%', height: '100%' }}
              onClick={() => onCountrySelect(null)} // Click empty space to reset
            >
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
                          onCountrySelect(null); // toggle off -> all
                        } else {
                          onCountrySelect(name);
                        }
                      }}
                      style={{
                        default: {
                          fill: isIndividuallySelected ? '#339af0' : available ? '#ffffff' : '#2e3239',
                          outline: 'none',
                          stroke: '#40444b',
                          strokeWidth: 0.5,
                          cursor: available ? 'pointer' : 'not-allowed',
                          transition: 'fill 120ms ease'
                        },
                        hover: {
                          fill: isIndividuallySelected ? '#339af0' : available ? '#e6e8eb' : '#2e3239',
                          outline: 'none'
                        },
                        pressed: {
                          fill: '#339af0',
                          outline: 'none'
                        }
                      }}
                    />
                  );
                })}
              </Geographies>
            </ComposableMap>
          </Box>
        )}
  <Group justify="center" gap="md" mt="sm">
      <Group gap={4}>
        <Box w={14} h={14} style={{ background: '#339af0', borderRadius: 2 }} />
        <Text size="xs" c="dark.2">Selected</Text>
      </Group>
      <Group
        gap={4}
        onClick={resetToAll}
        onKeyDown={handleLegendKey}
        role="button"
        aria-label="Show all photos"
        tabIndex={0}
        style={{ cursor: 'pointer', userSelect: 'none', outline: 'none' }}
      >
        <Box w={14} h={14} style={{ background: '#ffffff', borderRadius: 2, boxShadow: '0 0 0 1px #40444b' }} />
        <Text size="xs" c="dark.2" fw={selectedCountry === null ? 600 : 400}>
          {selectedCountry === null ? 'All (Showing)' : 'Available (All)'}
        </Text>
      </Group>
      <Group gap={4}>
        <Box w={14} h={14} style={{ background: '#2e3239', borderRadius: 2 }} />
        <Text size="xs" c="dark.2">No Photos</Text>
      </Group>
    </Group>
    </Box>
  );
}
