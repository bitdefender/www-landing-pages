require('dotenv').config();
const GhostInspector = require('ghost-inspector')(process.env.GI_KEY);

const testId = '64c608336f03cb8cdb7d955b';
const snapshotsSuiteId = '64c8d884960593b38bb68331';
const featureBranchEnvironmentBaseUrl = `https://${process.env.BRANCH_NAME}--helix-poc--enake.hlx.page`;

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
      const { variables: { name }, test: { _id } } = testResult;

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

  function showSnapshotTestsFullLogs(testResults) {
    const mappedTests = testResults.map(test => test[0]);
    const areAllTestsPassing =
      mappedTests.every(({screenshotCompareDifference}) => screenshotCompareDifference === null);
    areAllTestsPassing ? logSuccess('All snapshots passed !') : logError('Some snapshots failed !');

    mappedTests.forEach((testResult, index) => {
      const {
        screenshotComparePassing,
        screenshotCompareDifference,
        variables: { name },
        test: { _id }
      } = testResult;

      const isPassing = screenshotCompareDifference === null || screenshotComparePassing === true;

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
    const [suiteTests, activeLandingpagesRes] = await Promise.all([
      GhostInspector.getSuiteTests(snapshotsSuiteId),
      fetch('https://main--helix-poc--enake.hlx.page/active-landingpages.json')
    ]);

    const activeLandingpages = await activeLandingpagesRes.json();

    const genericFunctionalTestPromises = activeLandingpages.data.flatMap(({ URI, Products }) => {
      const productsAsList = Products.split(',');

      return productsAsList.map((productName, index) => {
        return GhostInspector.executeTest(testId, {
          name: `${URI} => ${productName.trim()}`,
          productIndex: index,
          startUrl: `${featureBranchEnvironmentBaseUrl}/${URI}`,
        });
      });
    });

    const snapshotsPromises = suiteTests.filter((item, idx) => idx < 3).map(({_id, name}) => GhostInspector.executeTest(
      _id, {
        name: `Snapshot => ${name}`,
        startUrl: `${featureBranchEnvironmentBaseUrl}/${name}`,
      }
    ));

    const [ genericFunctionalTestResult, snapshotsResult] = await Promise.all([
      Promise.all(genericFunctionalTestPromises),
      Promise.all(snapshotsPromises)
    ]);

    showGenericFunctionalTestsFullLogs(genericFunctionalTestResult);
    showSnapshotTestsFullLogs(snapshotsResult);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();