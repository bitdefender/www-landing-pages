const fs = require('fs');
const SnapshotBlockTest = require('./json-tests/snapshot-block');
require('dotenv').config();
const GhostInspector = require('ghost-inspector')(process.env.GI_KEY);

const snapshotsSuiteId = '64c8d884960593b38bb68331';
const featureBranchEnvironmentBaseUrl = `https://${process.env.BRANCH_NAME || 'main'}--www-landing-pages--bitdefender.hlx.page`;
const pathToBlocks = 'sidekick/blocks';
const localBlocksPath = '_src-lp/blocks';
const FETCH_TIMEOUT = 1000 * 60 * 6; // 6 minutes

(async () => {
  function logError(message) {
    console.log('\x1b[31m%s\x1b[0m', message);
  }
  function logSuccess(message) {
    console.log('\x1b[32m%s\x1b[0m', message);
  }

  function snapshotIsPassing({ screenshotComparePassing }) {
    return screenshotComparePassing === true;
  }

  function showSnapshotTestsFullLogs(testResults) {
    const mappedTests = testResults.map((test) => test.data).flat();
    const areAllTestsPassing = mappedTests.every(snapshotIsPassing);
    areAllTestsPassing ? logSuccess('All snapshots passed !') : logError('Some snapshots failed !');

    mappedTests.forEach((testResult, index) => {
      console.log(`test result ${index}`, testResult);
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

  try {
    const blockSnapshotsToTest = fs.readdirSync(localBlocksPath);

    // get snapshots tests
    const snapshotSuiteTests = await GhostInspector.getSuiteTests(snapshotsSuiteId);

    const snapshotsPromises = blockSnapshotsToTest.filter((item, idx) => idx < 2)
      .map((testName) => {
        const testAlreadyExists = snapshotSuiteTests.find((originalTest) => originalTest.name === testName);

        console.log('testAlreadyExists', testAlreadyExists);

        if (testAlreadyExists) {
          return fetch(`https://api.ghostinspector.com/v1/tests/${testAlreadyExists._id}/execute/?apiKey=${process.env.GI_KEY}&startUrl=${featureBranchEnvironmentBaseUrl}/${pathToBlocks}/${testAlreadyExists.name}`, {
            timeout: FETCH_TIMEOUT
          }).then((res) => res.json());
        }

        return GhostInspector.importTest(snapshotsSuiteId, new SnapshotBlockTest({
          name: testName,
          startUrl: `${featureBranchEnvironmentBaseUrl}/${pathToBlocks}/${testName}`,
        }).generate())
          .then(({ _id }) => fetch(`https://api.ghostinspector.com/v1/tests/${_id}/execute/?apiKey=${process.env.GI_KEY}`).then((res) => res.json()));
      });

    const [
      snapshotsResult,
    ] = await Promise.all([
      Promise.all(snapshotsPromises),
    ]);

    showSnapshotTestsFullLogs(snapshotsResult);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
