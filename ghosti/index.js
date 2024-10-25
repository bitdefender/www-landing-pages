const SnapshotBlockTest = require('./json-tests/snapshot-block');
require('dotenv').config();
const GhostInspector = require('ghost-inspector')(process.env.GI_KEY);

const snapshotsSuiteId = '64c8d884960593b38bb68331';
const featureBranchEnvironmentBaseUrl = `https://${process.env.BRANCH_NAME || 'main'}--www-landing-pages--bitdefender.hlx.page`;
const pathToBlocks = 'sidekick/blocks';

// todo those should come from somewhere else
const blockSnapshotsToTest = [
  'b-banner',
  'b-single-quote',
  'c-reviews',
  'c-icon-box-grid',
  'c-device-protection-box',
  'awards',
  'c-tough-on-threats',
  'b-antiransomware',
  'b-boxes',
  'c-teaser-card',
  'c-carousel-section',
  'c-progress-section',
  'columns',
  'c-productswithvpn2',
  'c-productswithvpn',
  'b-productswithselectors',
  'c-top-comparative-with-text',
  'b-dropdownbox',
  'b-productswithinputdevices',
  'b-big-carousel-quotes',
];

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
    const mappedTests = testResults.map((test) => test.data);
    const areAllTestsPassing = mappedTests.every(snapshotIsPassing);
    areAllTestsPassing ? logSuccess('All snapshots passed !') : logError('Some snapshots failed !');

    mappedTests.forEach((testResult, index) => {
      const {
        name,
        test: { _id },
      } = testResult;

      const isPassing = snapshotIsPassing(testResult);

      const title = `${index + 1}.[${isPassing ? 'PASSED' : 'FAILED'}] ${name}`;

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
    // get snapshots tests
    const snapshotSuiteTests = await GhostInspector.getSuiteTests(snapshotsSuiteId);

    const snapshotsPromises = blockSnapshotsToTest
      .map((testName) => {
        const testAlreadyExists = snapshotSuiteTests.find((originalTest) => originalTest.name === testName);

        if (testAlreadyExists) {
          return fetch(`https://api.ghostinspector.com/v1/tests/${testAlreadyExists._id}/execute/?apiKey=${process.env.GI_KEY}&startUrl=${featureBranchEnvironmentBaseUrl}/${pathToBlocks}/${testAlreadyExists.name}`).then((res) => res.json());
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
