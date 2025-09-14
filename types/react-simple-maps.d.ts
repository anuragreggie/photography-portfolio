declare module 'react-simple-maps' {
  import * as React from 'react';
  import type { Feature, FeatureCollection, Geometry } from 'geojson';

  /** A single geography (country/shape) feature returned by react-simple-maps */
  export interface GeographyFeature extends Feature<Geometry, Record<string, any>> {
    rsmKey: string; // library-provided unique key
  }

  export interface GeographyStyle {
    default?: React.CSSProperties & { outline?: string };
    hover?: React.CSSProperties & { outline?: string };
    pressed?: React.CSSProperties & { outline?: string };
  }

  export interface GeographyProps extends Omit<React.SVGProps<SVGPathElement>, 'style'> {
    geography: GeographyFeature | any;
    style?: GeographyStyle;
    onClick?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
  }

  export interface GeographiesRenderProps {
    geographies: GeographyFeature[];
  }

  export interface GeographiesProps {
    geography: string | FeatureCollection | any;
    children: (props: GeographiesRenderProps) => React.ReactNode;
  }

  export interface ComposableMapProps extends React.SVGProps<SVGSVGElement> {
    projection?: string;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
}