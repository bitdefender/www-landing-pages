class SnapshotBlockTest {
  #name;
  #startUrl;
  #importTestId;
  constructor({ name, startUrl, importTestId }) {
    this.#name = name;
    this.#startUrl = startUrl;
    this.#importTestId = importTestId;
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
      "region": "",
      "screenshotCompareEnabled": null,
      "screenshotCompareThreshold": 0.1,
      "steps": this.#importTestId ? [
        {
          "command": "execute",
          "condition": null,
          "optional": false,
          "private": false,
          "sequence": 0,
          "target": "",
          "value": this.#importTestId,
          "variableName": ""
        }
      ] : [],
      "testFrequency": 0,
      "testFrequencyAdvanced": [],
      "viewportSize": null
    };
  }
}

module.exports = SnapshotBlockTest;
