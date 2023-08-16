const PriceValidationTest = require("./json-tests/price-validation");
require('dotenv').config();
const GhostInspector = require('ghost-inspector')(process.env.GI_KEY);

const testId = '64c608336f03cb8cdb7d955b';
const genericPriceSuiteId = '64be463282bf299ccb6b9341';
const snapshotsSuiteId = '64c8d884960593b38bb68331';
const featureBranchEnvironmentBaseUrl = `https://${process.env.BRANCH_NAME || 'main'}--helix-poc--enake.hlx.page`;
const activeLandingPagesUrl = 'https://main--helix-poc--enake.hlx.page/active-landingpages.json';

const AWS_REGION_BY_COUNTRY_CODE_MAP = new Map([
  ['de', 'eu-central-1'],
  ['fr', 'eu-west-3'],
  ['it', 'eu-south-1'],
  ['es', 'eu-south-2'],
  ['ro', 'eu-west-1'],
  ['en', 'us-east-1'],
  ['se', 'eu-north-1'],
  ['uk', 'eu-west-2'],
  ['ie', 'eu-west-1'],
  ['se', 'eu-north-1'],
  ['br', 'sa-east-1'],
  ['be', 'eu-central-1'],
  ['pt', 'eu-central-1'],
  ['au', 'ap-southeast-2'],
]);

(async () => {
  function logError(message) {
    console.log('\x1b[31m%s\x1b[0m', message);
  }
  function logSuccess(message) {
    console.log('\x1b[32m%s\x1b[0m', message);
  }
  function showGenericFunctionalTestsFullLogs(testResults) {
    // console.log('testResults', testResults);
    const areAllTestsPassing = testResults.every(([res, passing]) => passing === true);
    areAllTestsPassing ? logSuccess('All tests passed !') : logError('Some tests failed !');

    testResults.forEach(([testResult, passing], index) => {
      if (index === 0) {
        console.log('testResult', testResult);
      }
      const { name, test: { _id } } = testResult;

      const title = `${index + 1}.[${passing ? 'PASSED' : 'FAILED'}] ${name}`

      if (passing) {
        logSuccess(title)
      } else {
        logError(title);
        console.log(`Full test details on: https://app.ghostinspector.com/tests/${_id}`, testResult.variables);
      }
    });

    if (!areAllTestsPassing) {
      process.exit(1);
    }
  }

  function snapshotIsPassing({screenshotComparePassing}) {
    return screenshotComparePassing === true;
  }

  function showSnapshotTestsFullLogs(testResults) {
    const mappedTests = testResults.map(test => test.data);
    const areAllTestsPassing = mappedTests.every(snapshotIsPassing);
    areAllTestsPassing ? logSuccess('All snapshots passed !') : logError('Some snapshots failed !');

    mappedTests.forEach((testResult, index) => {
      const {
        variables: { name },
        test: { _id }
      } = testResult;

      const isPassing = snapshotIsPassing(testResult);

      const title = `${index + 1}.[${isPassing ? 'PASSED' : 'FAILED'}] ${name}`

      if (isPassing) {
        logSuccess(title)
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
    const activeLandingpagesRes = await fetch(activeLandingPagesUrl);
    const activeLandingpages = await activeLandingpagesRes.json();

    const importTestsPromises = activeLandingpages.data.flatMap(({ URI, Products }) => {
      const productsAsList = Products.split(',');
      const countryCode = URI.split('/')[1];
      const region = AWS_REGION_BY_COUNTRY_CODE_MAP.get(countryCode);

      return productsAsList.map((productName, index) => {
        return GhostInspector.importTest(genericPriceSuiteId, new PriceValidationTest({
          name: `${URI} => ${productName.trim()}`,
          productIndex: index,
          startUrl: `${featureBranchEnvironmentBaseUrl}/${URI}`,
          region,
        }).generate());
      });
    });

    const [
      importTestsResult,
      snapshotsResult
    ] = await Promise.all([
      Promise.all(importTestsPromises),
      // Promise.all(snapshotsPromises)
    ]);

    const executionTestsPromises = importTestsResult.map(({_id}) => GhostInspector.executeTest(_id));

    const [
      executionTestsResult
    ] = await Promise.all([
      Promise.all(executionTestsPromises),
      // Promise.all(snapshotsPromises)
    ]);

    showGenericFunctionalTestsFullLogs(executionTestsResult);
    // showSnapshotTestsFullLogs(snapshotsResult);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();