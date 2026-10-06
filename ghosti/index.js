require('dotenv').config();
const { askWithImage } = require('./check-tests-validity');
const SnapshotBlockTest = require('./json-tests/snapshot-block');
const {
  PATH_TO_BLOCKS,
  SNAPSHOTS_SUITE_ID,
  FETCH_TIMEOUT,
  EXCLUDED_SNAPSHOT_BLOCKS,
  MANDATORY_TESTS_SUITE_ID,
  TESTS_VIEWPORTS,
  MAX_REQUESTS_PER_SECOND,
  MAX_REQUESTS_PER_PAGE,
  logSuccess,
  logError,
  logWarning
} = require('./constants');
const hlxEnv = {
  PROD: 'live',
  STAGE: 'page'
};
const BRANCH_NAME = process.env.BRANCH_NAME;
const GI_KEY = process.env.GI_KEY;
const CHANGED_FILES = process.env.CHANGED_FILES;
const GI_IMPORT_TEST_ID = process.env.GI_IMPORT_TEST_ID;
const GhostInspector = require('ghost-inspector')(GI_KEY);

const featureBranchEnvironmentHostname = `${BRANCH_NAME || 'main'}--www-landing-pages--bitdefender.aem.${hlxEnv.STAGE}`
const featureBranchEnvironmentBaseUrl = `https://${BRANCH_NAME || 'main'}--www-landing-pages--bitdefender.aem.${hlxEnv.PROD}`;

(async () => {
  const pagesPerSecond = Math.max(1, Math.floor(MAX_REQUESTS_PER_SECOND / MAX_REQUESTS_PER_PAGE));
  let startedPages = 0;
  let pageSlotQueue = Promise.resolve();

  // Shared by all suites so their combined page loads stay under the rate limit
  const waitForPageSlot = () => {
    pageSlotQueue = pageSlotQueue.then(async () => {
      if (startedPages > 0 && startedPages % pagesPerSecond === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      startedPages += 1;
    });
    return pageSlotQueue;
  };

  const executeTestOnViewports = (testId, startUrl) => Promise.all(TESTS_VIEWPORTS.map(async (viewport) => {
    await waitForPageSlot();
    return fetch(`https://api.ghostinspector.com/v1/tests/${testId}/execute/?apiKey=${GI_KEY}&startUrl=${encodeURIComponent(startUrl)}&viewport=${viewport}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT)
    }).then((res) => res.json());
  }));

  const snapshotIsPassing = ({ screenshotComparePassing }) => {
    return screenshotComparePassing === true;
  }

  const showSnapshotTestsFullLogs = async (testResults) => {
    const mappedTests = testResults.map((test) => test.data).flat();
    const areAllTestsPassing = mappedTests.every(snapshotIsPassing);
    areAllTestsPassing ? logSuccess('All snapshots passed !') : logError('Some snapshots failed !');

    const testLogs = mappedTests.map(async (testResult, index) => {
      const {
        name,
        test: { _id },
        viewportSize: { width, height },
        screenshotCompare: { compareOriginal }
      } = testResult;

      const isPassing = snapshotIsPassing(testResult);

      const title = `[${isPassing ? 'PASSED' : 'FAILED'}] ${name} on [${width}x${height}]`;

      if (isPassing) {
        logSuccess(title);
      } else {
        const verdictMessage = await askWithImage({
          baseScreenshotUrl: compareOriginal.defaultUrl,
          dims: compareOriginal.dims,
        });
        if (verdictMessage.includes('Final verdict: PASS')) {
          logWarning(title);
          console.log(verdictMessage);
          console.log(`Full test details on: https://app.ghostinspector.com/tests/${_id} . You can approve the baseline\n\n`);
        } else {
          logError(title);
          console.log(verdictMessage);
          console.log(`Full test details on: https://app.ghostinspector.com/tests/${_id} . Please consult the QA team before approving the baseline\n\n`);
        }
      }
    });

    await Promise.all(testLogs);

    if (!areAllTestsPassing) {
      process.exit(1);
    }
  }

  const runComponentTests = async () => {
    const blockSnapshotsToTest = JSON.parse(CHANGED_FILES)
      .filter(snapshotTest => !EXCLUDED_SNAPSHOT_BLOCKS.includes(snapshotTest));

    if (!blockSnapshotsToTest.length) {
      return [];
    }

    // get snapshots tests
    const snapshotSuiteTests = await GhostInspector.getSuiteTests(SNAPSHOTS_SUITE_ID);

    const snapshotsPromises = blockSnapshotsToTest.map((testName) => {
      const startUrl = `${featureBranchEnvironmentBaseUrl}/${PATH_TO_BLOCKS}/${testName}`;
      const testAlreadyExists = snapshotSuiteTests.find((originalTest) => originalTest.name === testName);
      if (testAlreadyExists) {
        return executeTestOnViewports(testAlreadyExists._id, startUrl);
      }

      console.log('New test was imported', testName);
      return GhostInspector.importTest(SNAPSHOTS_SUITE_ID, new SnapshotBlockTest({
        name: testName,
        startUrl,
        importTestId: GI_IMPORT_TEST_ID,
      }).generate())
        .then(({ _id }) => executeTestOnViewports(_id, startUrl));
    });

    return (await Promise.all(snapshotsPromises)).flat();
  };

  const runMandatoryTests = async () => {
    const mandatoryTests = await GhostInspector.getSuiteTests(MANDATORY_TESTS_SUITE_ID);

    const allMandatoryTestCalls = mandatoryTests.map((test) => {
      const url = new URL(test.startUrl);
      url.hostname = featureBranchEnvironmentHostname;
      return executeTestOnViewports(test._id, url.toString());
    });

    return (await Promise.all(allMandatoryTestCalls)).flat();
  };

  try {
    const allTestResults = (await Promise.all([runComponentTests(), runMandatoryTests()])).flat(1);
    // Once all batches are processed, show the full logs of the snapshot tests
    await showSnapshotTestsFullLogs(allTestResults);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
