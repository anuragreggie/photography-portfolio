import type { ReactNode } from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import type { LinksFunction, MetaFunction } from 'react-router';
import { MantineProvider, Center, Loader, Text } from '@mantine/core';
import { theme } from '../styles/theme';

import './app.css';
import './fonts.css';
import '@mantine/core/styles.css';

const HOME_GALLERY_PRELOADS = [
  '/images/united-states/DSC08453',
  '/images/japan/DSC02897',
  '/images/uk/DSC07626',
] as const;

function imagePreload(
  path: (typeof HOME_GALLERY_PRELOADS)[number],
  widths: number[],
  fallbackWidth: number,
  imageSizes: string,
  media: string
) {
  return {
    rel: 'preload',
    href: `${path}-${fallbackWidth}w.webp`,
    as: 'image',
    type: 'image/webp',
    media,
    imageSrcSet: widths
      .map((width) => `${path}-${width}w.webp ${width}w`)
      .join(', '),
    imageSizes,
  };
}

export const links: LinksFunction = () => [
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.svg' },
  {
    rel: 'preload',
    href: '/fonts/lora-latin-400.woff2',
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'preload',
    href: '/fonts/lora-latin-600.woff2',
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  },
  ...HOME_GALLERY_PRELOADS.slice(0, 2).map((path) =>
    imagePreload(path, [400, 800], 800, '50vw', '(max-width: 767px)')
  ),
  ...HOME_GALLERY_PRELOADS.map((path) =>
    imagePreload(path, [800, 1280, 1920], 1280, '33vw', '(min-width: 768px)')
  ),
];

export const meta: MetaFunction = () => {
  return [
    { title: 'Anurag S' },
    {
      name: 'description',
      content:
        'Minimalist photography portfolio showcasing artistic vision through elegant imagery',
    },
    { name: 'color-scheme', content: 'light only' },
    { name: 'theme-color', content: '#ffffff' },
    { name: 'supported-color-schemes', content: 'light' },
  ];
};

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-mantine-color-scheme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider theme={theme} forceColorScheme="light">
          {children}
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return (
    <Center h="100vh">
      <div style={{ textAlign: 'center' }}>
        <Loader size="lg" />
        <Text mt="md" size="lg">
          Loading...
        </Text>
      </div>
    </Center>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (error instanceof Error) {
    details = error.message;
    stack = import.meta.env.DEV ? error.stack : undefined;
  }

  return (
    <main style={{ padding: '1rem' }}>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre style={{ overflowX: 'auto' }}>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
