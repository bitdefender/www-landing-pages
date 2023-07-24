require('dotenv').config();
const GhostInspector = require('ghost-inspector')(process.env.GI_KEY);

(async () => {
  // execute a test
  try {
    const [results, passing, screenshotPassing] = await GhostInspector.executeTest(
      '64be47dcca40d9f691783152',
    );
    console.log('Passing: ', passing);
    if (!passing) {
      process.exit(1);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();