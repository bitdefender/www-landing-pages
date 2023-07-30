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

  function showFullLogs(allTestsPassing, results) {
    allTestsPassing ? logSuccess('All tests passed !') : logError('Some tests failed !');

    results.forEach(([testResult, passing], index) => {
      const { name, test: { _id } } = testResult;

      const title = `${index + 1}.[${passing ? 'PASSED' : 'FAILED'}] ${name}`

      if (passing) {
        logSuccess(title)
      } else {
        logError(title);
        console.log(`Full test details on: https://app.ghostinspector.com/tests/${_id}`);
      }
    });

    if (!allTestsPassing) {
      process.exit(1);
    }
  }

  const landingPagesToTest = [
    'business/de/mr-summer-ready-july-2023',
    'business/de/winback-summer-ready-july-2023',
    'business/en/cross-sell-2023-mobile-launch',
    'business/en/cross-sell-flash-sale-pm-2023',
    'business/en/independenceday',
    'business/en/mr-independence-day-2023',
    'business/en/mr-summer-ready-aug-2023',
    'business/en/mr-summer-ready-july-2023',
    'business/en/ransomwaretrial',
    'business/en/upgrade-2023-summer-ready-aug',
    'business/en/winback-2023-independence-day',
    'business/en/winback-summer-ready-aug-2023',
    'business/en/winback-summer-ready-july-2023',
    'business/es/mr-summer-ready-july-2023',
    'business/es/winback-summer-ready-july-2023',
    'business/fr/mr-summer-ready-july-2023',
    'business/fr/winback-summer-ready-july-2023',
    'business/it/mr-summer-ready-july-2023',
    'business/it/winback-summer-ready-july-2023',
    'business/nl/ransomwaretrial',
    'business/ro/mr-summer-ready-july-2023',
    'business/ro/winback-summer-ready-july-2023',
    'consumer/en/new/cl-offer-opt',
    'consumer/en/new/last-offer',
    'consumer/en/new/ultimate-flv1',
  ];

  try {
    let promises = [];

    landingPagesToTest.forEach(landingPagePath => {
      promises.push(GhostInspector.executeTest(
        testId, { startUrl: `https://${process.env.BRANCH_NAME}--helix-poc--enake.hlx.page/${landingPagePath}` }
      ));
    })

    const result = await Promise.all(promises);

    const passing = result.every(([res, passing]) => passing === true);

    showFullLogs(passing, result);
  } catch (err) {
    process.exit(1);
  }
})();