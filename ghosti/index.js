const fs = require('fs');
require('dotenv').config();
const SnapshotBlockTest = require('./json-tests/snapshot-block');
const {
  PATH_TO_BLOCKS,
  LOCAL_BLOCKS_PATH,
  SNAPSHOTS_SUITE_ID,
  FETCH_TIMEOUT,
  logSuccess,
  logError
} = require('./constants');
const { fetchWithRetry } = require('./utils');
const GhostInspector = require('ghost-inspector')(process.env.GI_KEY);

const hlxEnv = {
  PROD: 'live',
  STAGE: 'page'
};

const featureBranchEnvironmentBaseUrl = `https://${process.env.BRANCH_NAME || 'main'}--www-landing-pages--bitdefender.hlx.${hlxEnv.PROD}`;

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

(async () => {
  function snapshotIsPassing({ screenshotComparePassing }) {
    return screenshotComparePassing === true;
  }

  function createBatches(arr, batchSize) {
    let batches = [];
    for (let i = 0; i < arr.length; i += batchSize) {
      batches.push(arr.slice(i, i + batchSize));
    }
    return batches;
  }

  function showSnapshotTestsFullLogs(testResults) {
    const mappedTests = testResults.map((test) => test.data).flat();
    const areAllTestsPassing = mappedTests.every(snapshotIsPassing);
    areAllTestsPassing ? logSuccess('All snapshots passed !') : logError('Some snapshots failed !');

    mappedTests.forEach((testResult, index) => {
      const {
        name,
        test: { _id },
        viewportSize: { width, height }
      } = testResult;

      const isPassing = snapshotIsPassing(testResult);

      const title = `${index + 1}.[${isPassing ? 'PASSED' : 'FAILED'}] ${name} on [${width}x${height}]`;

      if (isPassing) {
        logSuccess(title);
      } else {
        logError(title);
        console.log(`Full test details on: https://app.ghostinspector.com/tests/${_id}`, testResult.variables);
      }
    });

    if (!areAllTestsPassing) {
      process.exit(1);
    }
  }

  // try {
  //   const blockSnapshotsToTest = fs.readdirSync(LOCAL_BLOCKS_PATH).filter(blockName => !EXCLUDED_SNAPSHOT_BLOCKS.includes(blockName));
  //   // get snapshots tests
  //   const snapshotSuiteTests = await GhostInspector.getSuiteTests(SNAPSHOTS_SUITE_ID);
  //
  //   const snapshotsPromises = blockSnapshotsToTest
  //     .map((testName) => {
  //       const testAlreadyExists = snapshotSuiteTests.find((originalTest) => originalTest.name === testName);
  //
  //       if (testAlreadyExists) {
  //         return fetch(`https://api.ghostinspector.com/v1/tests/${testAlreadyExists._id}/execute/?apiKey=${process.env.GI_KEY}&startUrl=${featureBranchEnvironmentBaseUrl}/${PATH_TO_BLOCKS}/${testAlreadyExists.name}`).then((res) => res.json());
  //       }
  //
  //       return GhostInspector.importTest(SNAPSHOTS_SUITE_ID, new SnapshotBlockTest({
  //         name: testName,
  //         startUrl: `${featureBranchEnvironmentBaseUrl}/${PATH_TO_BLOCKS}/${testName}`,
  //       }).generate())
  //         .then(({ _id }) => fetch(`https://api.ghostinspector.com/v1/tests/${_id}/execute/?apiKey=${process.env.GI_KEY}`).then((res) => res.json()));
  //     });
  //
  //   const [
  //     snapshotsResult,
  //   ] = await Promise.all([
  //     Promise.all(snapshotsPromises),
  //   ]);
  //
  //   showSnapshotTestsFullLogs(snapshotsResult);
  // } catch (err) {
  //   console.error(err);
  //   process.exit(1);
  // }

  try {
    const blockSnapshotsToTest = fs.readdirSync(LOCAL_BLOCKS_PATH).filter(blockName => !EXCLUDED_SNAPSHOT_BLOCKS.includes(blockName));

    // get snapshots tests
    const snapshotSuiteTests = await GhostInspector.getSuiteTests(SNAPSHOTS_SUITE_ID);

    const batches = createBatches(blockSnapshotsToTest, 5);

    let allTestResults = [];

    for (const batch of batches) {
      const snapshotsPromises = batch.map((testName) => {
        const testAlreadyExists = snapshotSuiteTests.find((originalTest) => originalTest.name === testName);
        if (testAlreadyExists) {
          return fetchWithRetry(`https://api.ghostinspector.com/v1/tests/${testAlreadyExists._id}/execute/?apiKey=${process.env.GI_KEY}&startUrl=${featureBranchEnvironmentBaseUrl}/${PATH_TO_BLOCKS}/${testAlreadyExists.name}`, {
            signal: AbortSignal.timeout(FETCH_TIMEOUT)
          }).then((res) => res.json());
        }
        console.log('New test was imported', testName);
        return GhostInspector.importTest(SNAPSHOTS_SUITE_ID, new SnapshotBlockTest({
          name: testName,
          startUrl: `${featureBranchEnvironmentBaseUrl}/${PATH_TO_BLOCKS}/${testName}`,
        }).generate())
          .then(({ _id }) => fetchWithRetry(`https://api.ghostinspector.com/v1/tests/${_id}/execute/?apiKey=${process.env.GI_KEY}`).then((res) => res.json()));
      });

      // Await the completion of all promises in the current batch before proceeding to the next
      const batchResults = await Promise.all(snapshotsPromises);
      allTestResults.push(...batchResults);
    }

    // Once all batches are processed, show the full logs of the snapshot tests
    showSnapshotTestsFullLogs(allTestResults);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  // await new Promise((res) => setTimeout(res, 1000))
})();
