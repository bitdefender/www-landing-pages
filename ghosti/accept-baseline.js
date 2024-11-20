require('dotenv').config();
const {
  SNAPSHOTS_SUITE_ID,
  logSuccess,
  logError
} = require('./constants');
const GhostInspector = require('ghost-inspector')(process.env.GI_KEY);

(async () => {
  // Baseline Update Logic
  if (process.env.ACCEPT_NEW_BASELINE === 'true') {
    try {
      console.log('Updating baseline screenshots in Ghost Inspector...');
      // Trigger the baseline update using Ghost Inspector's API
      const snapshotSuiteTests = await GhostInspector.getSuiteTests(SNAPSHOTS_SUITE_ID);

      // Loop over each test to accept the new baseline
      await Promise.all(snapshotSuiteTests.map(test =>
        fetch(`https://api.ghostinspector.com/v1/tests/${test._id}/accept-screenshot?apiKey=${process.env.GI_KEY}`, {
          method: 'POST'
        })
          .then(res => res.json())
          .then((response) => {
            if (response.code === 'SUCCESS') {
              logSuccess(`Baseline updated successfully for test: ${test.name}`);
            } else {
              logError(`Failed to update baseline for test: ${test.name}`);
            }
          })
      ));

      console.log('Baseline update completed.');
    } catch (err) {
      logError('An error occurred while updating baselines:');
      console.error(err);
      process.exit(1);
    }
  }
})();
