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
import { MotionConfig } from 'framer-motion';
import { theme } from '../styles/theme';

import './app.css';
import './fonts.css';
import '@mantine/core/styles.css';

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    href: '/favicon.ico?v=portrait-1',
    type: 'image/x-icon',
    sizes: '16x16 32x32 48x48',
  },
  {
    rel: 'apple-touch-icon',
    href: '/apple-touch-portrait.png',
    sizes: '180x180',
  },
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
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
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
