const SNAPSHOTS_SUITE_ID = '64c8d884960593b38bb68331';
const PATH_TO_BLOCKS = 'sidekick/blocks';
const LOCAL_BLOCKS_PATH = '_src-lp/blocks';
const FETCH_TIMEOUT = 1000 * 60 * 5; // 5 minutes

function logError(message) {
  console.log('\x1b[31m%s\x1b[0m', message);
}
function logSuccess(message) {
  console.log('\x1b[32m%s\x1b[0m', message);
}

module.exports = {
  SNAPSHOTS_SUITE_ID,
  PATH_TO_BLOCKS,
  LOCAL_BLOCKS_PATH,
  FETCH_TIMEOUT,
  logError,
  logSuccess
}
