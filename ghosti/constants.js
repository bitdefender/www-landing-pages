export const SNAPSHOTS_SUITE_ID = '64c8d884960593b38bb68331';
export const PATH_TO_BLOCKS = 'sidekick/blocks';
export const LOCAL_BLOCKS_PATH = '_src-lp/blocks';
export const FETCH_TIMEOUT = 1000 * 60 * 5; // 5 minutes

export function logError(message) {
  console.log('\x1b[31m%s\x1b[0m', message);
}
export function logSuccess(message) {
  console.log('\x1b[32m%s\x1b[0m', message);
}
