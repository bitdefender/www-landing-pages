const GhostInspector = require('ghost-inspector')('d18bdb6707ceb3c84778aa8c91f9cc6ba20b7ecb');

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