require('dotenv').config();
const GhostInspector = require('ghost-inspector')(process.env.GI_KEY);
const landingPagesTestSuiteId = '64be463282bf299ccb6b9341';

(async () => {
  try {
    const [results, passing, screenshotPassing] = await GhostInspector.executeSuite(
      landingPagesTestSuiteId, { immediate: 0 }
    );
    console.log('Landing pages passing: ', passing);
    if (!passing) {
      process.exit(1);
    }
  } catch (err) {
    console.error(`Landing pages tests suite failed, check tests output here: https://app.ghostinspector.com/suites/${landingPagesTestSuiteId}, ErrorStackTrace:${err}`);
    process.exit(1);
  }
})();