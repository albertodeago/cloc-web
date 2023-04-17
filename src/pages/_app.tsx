import { useCronitor } from '@cronitorio/cronitor-rum-nextjs';
import '../styles/reset.css';
import '../styles/theme.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';

import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: 'https://b1a60c0ddda143abb40d90d58b6a6280@o1140912.ingest.sentry.io/6198515',
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

function MyApp({ Component, pageProps }: AppProps) {
  // Load Cronitor only once during the app lifecycle
  useCronitor('02e7a13d26cbf9eadbc361ca2ddd0d7b');

  return <Component {...pageProps} />;
}

export default MyApp;
