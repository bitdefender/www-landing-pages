require('dotenv').config();
const { askWithImage } = require('./check-tests-validity');
const SnapshotBlockTest = require('./json-tests/snapshot-block');
const {
  PATH_TO_BLOCKS,
  SNAPSHOTS_SUITE_ID,
  FETCH_TIMEOUT,
  EXCLUDED_SNAPSHOT_BLOCKS,
  MANDATORY_TESTS_SUITE_ID,
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
const GhostInspector = require('ghost-inspector')(GI_KEY);

const featureBranchEnvironmentHostname = `${BRANCH_NAME || 'main'}--www-landing-pages--bitdefender.aem.${hlxEnv.STAGE}`
const featureBranchEnvironmentBaseUrl = `https://${BRANCH_NAME || 'main'}--www-landing-pages--bitdefender.aem.${hlxEnv.PROD}`;

(async () => {
  const snapshotIsPassing = ({ screenshotComparePassing }) => {
    return screenshotComparePassing === true;
  }

  const showSnapshotTestsFullLogs = async (testResults) => {
    const mappedTests = testResults.map((test) => test.data).flat();
    const areAllTestsPassing = mappedTests.every(snapshotIsPassing);
    areAllTestsPassing ? logSuccess('All snapshots passed !') : logError('Some snapshots failed !');

    const testLogs = mappedTests.map(async (testResult) => {
      const {
        name,
        test: { _id },
        viewportSize: { width, height },
        screenshot: { original },
        screenshotCompare: { compareOriginal }
      } = testResult;

      const isPassing = snapshotIsPassing(testResult);

      const title = `[${isPassing ? 'PASSED' : 'FAILED'}] ${name} on [${width}x${height}]`;

      if (isPassing) {
        logSuccess(title);
      } else {
        const verdictMessage = await askWithImage({
          newScreenshotUrl: original.defaultUrl,
          baseScreenshotUrl: compareOriginal.defaultUrl,
          dims: compareOriginal.dims,
        });
        if (verdictMessage.includes('Final verdict: PASS')) {
          logWarning(title);
          console.log(verdictMessage);
          console.log(`Full test details on: https://app.ghostinspector.com/tests/${_id} . You can approve the baseline`);
        } else {
          logError(title);
          console.log(verdictMessage);
          console.log(`Full test details on: https://app.ghostinspector.com/tests/${_id} . Please consult the QA team before approving the baseline`);
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
      const testAlreadyExists = snapshotSuiteTests.find((originalTest) => originalTest.name === testName);
      if (testAlreadyExists) {
        return fetch(`https://api.ghostinspector.com/v1/tests/${testAlreadyExists._id}/execute/?apiKey=${GI_KEY}&startUrl=${featureBranchEnvironmentBaseUrl}/${PATH_TO_BLOCKS}/${testAlreadyExists.name}`, {
          signal: AbortSignal.timeout(FETCH_TIMEOUT)
        }).then((res) => res.json());
      }

      console.log('New test was imported', testName);
      return GhostInspector.importTest(SNAPSHOTS_SUITE_ID, new SnapshotBlockTest({
        name: testName,
        startUrl: `${featureBranchEnvironmentBaseUrl}/${PATH_TO_BLOCKS}/${testName}`,
      }).generate())
        .then(({ _id }) => fetch(`https://api.ghostinspector.com/v1/tests/${_id}/execute/?apiKey=${GI_KEY}`).then((res) => res.json()));
    });

    // Await the completion of all promises in the current batch before proceeding to the next
    return await Promise.all(snapshotsPromises);
  };

  const runMandatoryTests = async () => {
    const mandatoryTests = await GhostInspector.getSuiteTests(MANDATORY_TESTS_SUITE_ID);
    const allMandatoryTestCalls = [];
    mandatoryTests.forEach(test => {
      const url = new URL(test.startUrl);
      url.hostname = featureBranchEnvironmentHostname;

      const testCall = fetch(`https://api.ghostinspector.com/v1/tests/${test._id}/execute/?apiKey=${GI_KEY}&startUrl=${url.toString()}`, {
          signal: AbortSignal.timeout(FETCH_TIMEOUT)
        }).then((res) => res.json())
      allMandatoryTestCalls.push(testCall);
    });

    return await Promise.all(allMandatoryTestCalls);
  };

  try {    
    const allTestResults = (await Promise.all([runComponentTests(), runMandatoryTests()])).flat(1);
    // Once all batches are processed, show the full logs of the snapshot tests
    showSnapshotTestsFullLogs(allTestResults);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
