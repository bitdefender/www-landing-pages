require('dotenv').config();
const GhostInspector = require('ghost-inspector')(process.env.GI_KEY);
const landingPagesTestSuiteId = '64be463282bf299ccb6b9341';

(async () => {
  function logError(message) {
    console.log('\x1b[31m%s\x1b[0m', message);
  }
  function logSuccess(message) {
    console.log('\x1b[32m%s\x1b[0m', message);
  }

  function showFullLogs(isTestSuitePassing, results) {
    isTestSuitePassing ? logSuccess('Test suite passed !') : logError('Test suite failed !');

    results.forEach((testResult, index) => {
      const { passing, name, _id } = testResult;

      const title = `${index + 1}.[${passing ? 'PASSED' : 'FAILED'}] ${name}`

      if (passing) {
        logSuccess(title)
      } else {
        logError(title);
        console.log(`Full test details on: https://app.ghostinspector.com/tests/${_id}`);
      }
    });

    if (!isTestSuitePassing) {
      process.exit(1);
    }
  }

  try {
    const [results, passing] = await GhostInspector.executeSuite(
      landingPagesTestSuiteId, { immediate: 0 }
    );

    showFullLogs(passing, results);
  } catch (err) {
    process.exit(1);
  }
})();