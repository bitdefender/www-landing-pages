// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';
import { fetchGeoIP } from './utils.js';

window.sentryOnLoad = () => {
  /* eslint-disable-next-line no-undef */
  Sentry.init({
    dsn: 'https://31155ca43cab4235b06e5da92992eef0@o4504802466004992.ingest.us.sentry.io/4505244515958784',
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/configuration/options/#sendDefaultPii
    sendDefaultPii: false,
    // Alternatively, use `process.env.npm_package_version` for a dynamic release version
    // if your build tool supports it.
    // release: "my-project-name@2.3.12",
    integrations: [
      /* eslint-disable-next-line no-undef */
      Sentry.browserTracingIntegration(),
      /* eslint-disable-next-line no-undef */
      Sentry.replayIntegration(),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 0.1,
    allowUrls: [/https?:\/\/(www\.)?bitdefender\.com/],
    // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
    // tracePropagationTargets: [
    //   "localhost",
    //   /^https:\/\/yourserver\.io\/api/,
    // ],
    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};

fetchGeoIP();

// Core Web Vitals RUM collection
sampleRUM('cwv');
