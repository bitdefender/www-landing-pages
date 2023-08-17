class SnapshotBlockTest {
  #name;
  #startUrl;
  constructor({ name, startUrl }) {
    this.#name = name;
    this.#startUrl = startUrl;
  }
  generate() {
    return {
      name: this.#name,
      startUrl: this.#startUrl,
      "viewport": "1920x1080",
      "autoRetry": null,
      "browser": null,
      "dataSource": null,
      "disableVisuals": null,
      "disallowInsecureCertificates": null,
      "failOnJavaScriptError": null,
      "filters": [],
      "finalDelay": null,
      "globalStepDelay": null,
      "httpHeaders": [],
      "importOnly": false,
      "language": null,
      "links": [],
      "maxAjaxDelay": null,
      "maxConcurrentDataRows": null,
      "maxWaitDelay": null,
      "notifications": null,
      "publicStatusEnabled": false,
      "region": "eu-central-1",
      "screenshotCompareEnabled": null,
      "screenshotCompareThreshold": 0.1,
      "steps": [],
      "testFrequency": 0,
      "testFrequencyAdvanced": [],
      "viewportSize": null
    };
  }
}

module.exports = SnapshotBlockTest;