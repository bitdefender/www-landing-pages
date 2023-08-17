const PriceValidationTest = require("./json-tests/price-validation");
const SnapshotBlockTest = require("./json-tests/snapshot-block");
require('dotenv').config();
const GhostInspector = require('ghost-inspector')(process.env.GI_KEY);

const priceValidationSuiteId = '64be463282bf299ccb6b9341';
const snapshotsSuiteId = '64c8d884960593b38bb68331';
const featureBranchEnvironmentBaseUrl = `https://${process.env.BRANCH_NAME || 'main'}--helix-poc--enake.hlx.page`;
const activeLandingPagesUrl = 'https://main--helix-poc--enake.hlx.page/active-landingpages.json';

// todo those should come from other place
const blockSnapshotsToTest = [
  'b-banner-float-p',
  'b-single-quote',
  'b-banner-v3',
  'b-banner-v2',
  'b-banner-v4',
  'b-banner-v5',
  'c-reviews',
  'c-reviews-v2',
  'c-icon-box-grid',
  'c-icon-box-grid-v2',
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
  'c-productswithvpn-v2',
  'b-productswithselectors',
  'b-productswithselectors-v2',
  'c-top-comparative-with-text',
  'b-dropdownbox',
  'b-dropdownbox-new-closed',
  'c-dropdownbox-closed',
  'b-productswithinputdevices',
  'b-big-carousel-quotes',
];

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
    const areAllTestsPassing = testResults.every(([res, passing]) => passing === true);
    areAllTestsPassing ? logSuccess('All tests passed !') : logError('Some tests failed !');

    testResults.forEach(([testResult, passing], index) => {
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
        name,
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
    const [priceValidationSuiteTests, activeLandingpagesRes] = await Promise.all([
      GhostInspector.getSuiteTests(priceValidationSuiteId),
      fetch(activeLandingPagesUrl)
    ]);
    const activeLandingpages = await activeLandingpagesRes.json();

    const priceValidationTestsPromises = activeLandingpages.data.flatMap(({ URI, Products }) => {
      const productsAsList = Products.split(',');
      const countryCode = URI.split('/')[1];
      const region = AWS_REGION_BY_COUNTRY_CODE_MAP.get(countryCode);

      return productsAsList.map((productName, index) => {
        const testName = `${URI} => ${productName.trim()}`;
        const testAlreadyExists = priceValidationSuiteTests.find(originalTest => originalTest.name === testName);

        if (testAlreadyExists) {
          return GhostInspector.executeTest(testAlreadyExists._id, {
            name: testName,
            productIndex: index,
            startUrl: `${featureBranchEnvironmentBaseUrl}/${URI}`,
            region,
          });
        }

        return GhostInspector.importTest(priceValidationSuiteId, new PriceValidationTest({
          name: testName,
          productIndex: index,
          startUrl: `${featureBranchEnvironmentBaseUrl}/${URI}`,
          region,
        }).generate()).then(({_id}) => GhostInspector.executeTest(_id, {
          name: testName,
          productIndex: index,
          startUrl: `${featureBranchEnvironmentBaseUrl}/${URI}`,
          region,
        }));
      });
    });

    // get snapshots tests
    const snapshotSuiteTests = await GhostInspector.getSuiteTests(snapshotsSuiteId);

    const snapshotsPromises =
      blockSnapshotsToTest
        .map(testName => {
          const testAlreadyExists = snapshotSuiteTests.find(originalTest => originalTest.name === testName);

          if (testAlreadyExists) {
            return fetch(`https://api.ghostinspector.com/v1/tests/${testAlreadyExists._id}/execute/?apiKey=${process.env.GI_KEY}&startUrl=${featureBranchEnvironmentBaseUrl}/drafts/blocks/${testAlreadyExists.name}`).then(res => res.json());
          }

          return GhostInspector.importTest(snapshotsSuiteId, new SnapshotBlockTest({
            name: testName,
            startUrl: `${featureBranchEnvironmentBaseUrl}/drafts/blocks/${testName}`
          }).generate())
            .then(({_id}) => fetch(`https://api.ghostinspector.com/v1/tests/${_id}/execute/?apiKey=${process.env.GI_KEY}`).then(res => res.json()))
        });

    const [
      priceValidationTestsResult,
      snapshotsResult
    ] = await Promise.all([
      Promise.all(priceValidationTestsPromises),
      Promise.all(snapshotsPromises)
    ]);

    showGenericFunctionalTestsFullLogs(priceValidationTestsResult);
    showSnapshotTestsFullLogs(snapshotsResult);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();