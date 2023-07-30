require('dotenv').config();
const GhostInspector = require('ghost-inspector')(process.env.GI_KEY);

(async () => {
  try {
    const [results, passing, screenshotPassing] = await GhostInspector.executeSuite(
      '64be463282bf299ccb6b9341', { immediate: 0 }
    );
    console.log('Landing pages passing: ', passing);
    if (!passing) {
      process.exit(1);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();