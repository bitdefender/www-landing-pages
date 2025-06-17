require('dotenv').config();
const SnapshotBlockTest = require('./json-tests/snapshot-block');
const {
  PATH_TO_BLOCKS,
  SNAPSHOTS_SUITE_ID,
  FETCH_TIMEOUT,
  EXCLUDED_SNAPSHOT_BLOCKS,
  MANDATORY_TESTS_SUITE_ID,
  logSuccess,
  logError
} = require('./constants');
const GhostInspector = require('ghost-inspector')(process.env.GI_KEY);

const hlxEnv = {
  PROD: 'live',
  STAGE: 'page'
};
const featureBranchEnvironmentBaseUrl = `https://${process.env.BRANCH_NAME || 'main'}--www-landing-pages--bitdefender.aem.${hlxEnv.PROD}`;

(async () => {
  const snapshotIsPassing = ({ screenshotComparePassing }) => {
    return screenshotComparePassing === true;
  }

  const showSnapshotTestsFullLogs = (testResults) => {
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

  const runComponentTests = async () => {
    const blockSnapshotsToTest = JSON.parse(process.env.CHANGED_FILES)
      .filter(snapshotTest => !EXCLUDED_SNAPSHOT_BLOCKS.includes(snapshotTest));

    // get snapshots tests
    const snapshotSuiteTests = await GhostInspector.getSuiteTests(SNAPSHOTS_SUITE_ID);

    const snapshotsPromises = blockSnapshotsToTest.map((testName) => {
      const testAlreadyExists = snapshotSuiteTests.find((originalTest) => originalTest.name === testName);
      if (testAlreadyExists) {
        return fetch(`https://api.ghostinspector.com/v1/tests/${testAlreadyExists._id}/execute/?apiKey=${process.env.GI_KEY}&startUrl=${featureBranchEnvironmentBaseUrl}/${PATH_TO_BLOCKS}/${testAlreadyExists.name}`, {
          signal: AbortSignal.timeout(FETCH_TIMEOUT)
        }).then((res) => res.json());
      }

      console.log('New test was imported', testName);
      return GhostInspector.importTest(SNAPSHOTS_SUITE_ID, new SnapshotBlockTest({
        name: testName,
        startUrl: `${featureBranchEnvironmentBaseUrl}/${PATH_TO_BLOCKS}/${testName}`,
      }).generate())
        .then(({ _id }) => fetch(`https://api.ghostinspector.com/v1/tests/${_id}/execute/?apiKey=${process.env.GI_KEY}`).then((res) => res.json()));
    });

    // Await the completion of all promises in the current batch before proceeding to the next
    return await Promise.all(snapshotsPromises);
  };

  const runMandatoryTests = async () => {
    const mandatoryTests = await GhostInspector.getSuiteTests(MANDATORY_TESTS_SUITE_ID);
    const allMandatoryTestCalls = [];
    mandatoryTests.forEach(test => {
      const url = new URL(test.startUrl);
      url.hostname = featureBranchEnvironmentBaseUrl;

      const testCall = fetch(`https://api.ghostinspector.com/v1/tests/${test._id}/execute/?apiKey=${process.env.GI_KEY}&startUrl=${url.toString()}`, {
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
