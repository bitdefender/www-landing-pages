const SNAPSHOTS_SUITE_ID = '64c8d884960593b38bb68331';
const PATH_TO_BLOCKS = 'sidekick/blocks';
const LOCAL_BLOCKS_PATH = '_src-lp/blocks';
const FETCH_TIMEOUT = 1000 * 60 * 5; // 5 minutes
// todo add sidekick config for those
const EXCLUDED_SNAPSHOT_BLOCKS = [
  'aem-banner',
  'aem-two-cards',
  'b-industry-recognition',
  'cards',
  'columns-two',
  'fragment',
  'header',
  'lp-custom',
  'support',
  'tos',
  'video',
];
const MANDATORY_TESTS_SUITE_ID = '68516672e5aac3e52897827d';
const JIRA_BASE_URL = 'https://bitdefender.atlassian.net';

function logError(message) {
  console.log('\x1b[31m%s\x1b[0m', message);
}
function logSuccess(message) {
  console.log('\x1b[32m%s\x1b[0m', message);
}

function logWarning(message) {
  console.log('\x1b[33m%s\x1b[0m', message);
}

module.exports = {
  SNAPSHOTS_SUITE_ID,
  PATH_TO_BLOCKS,
  LOCAL_BLOCKS_PATH,
  FETCH_TIMEOUT,
  EXCLUDED_SNAPSHOT_BLOCKS,
  MANDATORY_TESTS_SUITE_ID,
  JIRA_BASE_URL,
  logError,
  logSuccess,
  logWarning
}
