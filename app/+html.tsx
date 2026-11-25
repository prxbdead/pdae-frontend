import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

/**
 * Static web shell. Keeps the page background in step with the OS scheme so
 * overscroll and first paint never flash white in dark mode.
 */
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
html, body, #root { height: 100%; }
body { background-color: #F5F2FF; margin: 0; }
@media (prefers-color-scheme: dark) {
  body { background-color: #120D24; }
}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
