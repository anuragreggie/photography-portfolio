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
import { Notifications } from '@mantine/notifications';
import { theme } from '../styles/theme';

import './app.css';
import './fonts.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

export const links: LinksFunction = () => [
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.svg' },
  // Preload critical fonts for faster text rendering
  { rel: 'preload', href: '/fonts/lora-latin-400.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
  { rel: 'preload', href: '/fonts/lora-latin-600.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
  // Preload hero images for home page (LCP optimization)
  // Desktop (3 columns): preload first 3 images with srcset for retina support
  { rel: 'preload', href: '/images/japan/tokyo-tower-through-leaves-1920w.webp', as: 'image', type: 'image/webp', media: '(min-width: 768px)', imageSrcSet: '/images/japan/tokyo-tower-through-leaves-800w.webp 800w, /images/japan/tokyo-tower-through-leaves-1280w.webp 1280w, /images/japan/tokyo-tower-through-leaves-1920w.webp 1920w', imageSizes: '33vw' },
  { rel: 'preload', href: '/images/japan/shinkansen-driver-v2-1920w.webp', as: 'image', type: 'image/webp', media: '(min-width: 768px)', imageSrcSet: '/images/japan/shinkansen-driver-v2-800w.webp 800w, /images/japan/shinkansen-driver-v2-1280w.webp 1280w, /images/japan/shinkansen-driver-v2-1920w.webp 1920w', imageSizes: '33vw' },
  { rel: 'preload', href: '/images/hong-kong/DSC05828-1920w.webp', as: 'image', type: 'image/webp', media: '(min-width: 768px)', imageSrcSet: '/images/hong-kong/DSC05828-800w.webp 800w, /images/hong-kong/DSC05828-1280w.webp 1280w, /images/hong-kong/DSC05828-1920w.webp 1920w', imageSizes: '33vw' },
  // Mobile (2 columns): preload first 2 images with srcset
  { rel: 'preload', href: '/images/japan/tokyo-tower-through-leaves-800w.webp', as: 'image', type: 'image/webp', media: '(max-width: 767px)', imageSrcSet: '/images/japan/tokyo-tower-through-leaves-400w.webp 400w, /images/japan/tokyo-tower-through-leaves-800w.webp 800w', imageSizes: '50vw' },
  { rel: 'preload', href: '/images/japan/shinkansen-driver-v2-800w.webp', as: 'image', type: 'image/webp', media: '(max-width: 767px)', imageSrcSet: '/images/japan/shinkansen-driver-v2-400w.webp 400w, /images/japan/shinkansen-driver-v2-800w.webp 800w', imageSizes: '50vw' },
];

export const meta: MetaFunction = () => {
  return [
    { title: 'Anurag S' },
    { name: 'description', content: 'Minimalist photography portfolio showcasing artistic vision through elegant imagery' },
    { name: 'color-scheme', content: 'light only' },
    { name: 'theme-color', content: '#fafaf9' },
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
          <Notifications />
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

export function hydrateFallback() {
  return (
    <Center h="100vh">
      <div style={{ textAlign: 'center' }}>
        <Loader size="lg" />
        <Text mt="md" size="lg">Loading...</Text>
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
    stack = error.stack;
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
