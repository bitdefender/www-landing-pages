require('dotenv').config();
const {
  SNAPSHOTS_SUITE_ID,
  logSuccess,
  logError
} = require('./constants');
const GhostInspector = require('ghost-inspector')(process.env.GI_KEY);

async function fetchViewportResults(testId) {
  const url = `https://api.ghostinspector.com/v1/tests/${testId}/results/?apiKey=${process.env.GI_KEY}`;
  const response = await fetch(url);
  const result = await response.json();

  if (result && result.data) {
    return result.data; // Returns an array of test results (one per viewport)
  }

  throw new Error(`Failed to fetch viewport results for test ${testId}`);
}

(async () => {
  try {
    logSuccess('Updating baseline screenshots in Ghost Inspector...\n------------');

    const snapshotSuiteTests = await GhostInspector.getSuiteTests(SNAPSHOTS_SUITE_ID);
    const failingTests = snapshotSuiteTests.filter(({screenshotComparePassing}) => screenshotComparePassing !== true)

    for (const test of failingTests) {
      logSuccess(`Processing test: ${test.name} (${test._id})`);

      const viewportResults = await fetchViewportResults(test._id);

      for (const result of viewportResults) {
        const viewportWidth = result.viewportSize.width;
        const viewportHeight = result.viewportSize.height;
        logSuccess(`Updating baseline for viewport ${viewportWidth}x${viewportHeight}`);

        const response = await fetch(
          `https://api.ghostinspector.com/v1/tests/${result._id}/accept-screenshot?apiKey=${process.env.GI_KEY}`,
          { method: 'POST' }
        ).then(res => res.json());

        if (response.code === 'SUCCESS') {
          logSuccess(
            `Baseline updated successfully for test: ${test.name}, viewport: ${viewportWidth}x${viewportHeight}`
          );
        } else {
          logError(
            `Failed to update baseline for test: ${test.name}, viewport: ${viewportWidth}x${viewportHeight}`
          );
        }
      }
    }

    logSuccess('---------------\nBaseline update completed.');
  } catch (err) {
    logError('An error occurred while updating baselines:');
    console.error(err);
    process.exit(1);
  }
})();
