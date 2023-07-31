require('dotenv').config();
const GhostInspector = require('ghost-inspector')(process.env.GI_KEY);

const testId = '64c608336f03cb8cdb7d955b';

(async () => {
  function logError(message) {
    console.log('\x1b[31m%s\x1b[0m', message);
  }
  function logSuccess(message) {
    console.log('\x1b[32m%s\x1b[0m', message);
  }

  function showFullLogs(areAllTestsPassing, testResults) {
    areAllTestsPassing ? logSuccess('All tests passed !') : logError('Some tests failed !');

    testResults.forEach(([testResult, passing], index) => {
      const { variables: { name }, test: { _id } } = testResult;

      const title = `${index + 1}.[${passing ? 'PASSED' : 'FAILED'}] ${name}`

      if (passing) {
        logSuccess(title)
      } else {
        // console.log('testResult', testResult);
        logError(title);
        console.log(`Full test details on: https://app.ghostinspector.com/tests/${_id}`);
      }
    });

    if (!areAllTestsPassing) {
      process.exit(1);
    }
  }

  try {
    const response = await fetch('https://main--helix-poc--enake.hlx.page/active-landingpages.json');

    const activeLandingpages = await response.json();

    let promises = [];

    activeLandingpages.data.forEach(({URI, Products}) => {
      const productsAsList = Products.split(',');

      productsAsList.forEach((productName, index) => {
        promises.push(GhostInspector.executeTest(
          testId, {
            name: `${URI} => ${productName.trim()}`,
            productIndex: index,
            startUrl: `https://${process.env.BRANCH_NAME}--helix-poc--enake.hlx.page/${URI}`,
          }
        ));
      });
    })

    const result = await Promise.all(promises);

    const areAllTestsPassing = result.every(([res, passing]) => passing === true);

    showFullLogs(areAllTestsPassing, result);
  } catch (err) {
    process.exit(1);
  }
})();