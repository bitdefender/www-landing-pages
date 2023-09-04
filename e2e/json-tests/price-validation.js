class PriceValidationTest {
  #name;
  #productIndex;
  #startUrl;
  #region;
  constructor({ name, productIndex, startUrl, region }) {
    this.#name = name;
    this.#productIndex = productIndex;
    this.#startUrl = startUrl;
    this.#region = region;
  }
  generate() {
    return {
      name: this.#name,
      startUrl: this.#startUrl,
      region: this.#region,
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
      "screenshotCompareEnabled": false,
      "screenshotCompareThreshold": 0.1,
      "steps": [
        {
          "command": "assertNotText",
          "condition": null,
          "notes": "finish ajax call",
          "optional": false,
          "private": false,
          "sequence": 0,
          "target": ".prod-newprice",
          "value": "",
          "variableName": ""
        },
        {
          "command": "extractEval",
          "condition": null,
          "notes": "extracted productPrice",
          "optional": false,
          "private": false,
          "sequence": 0,
          "target": "",
          "value": `const element = document.querySelectorAll('[data-testid="prod_box"] .red-buy-button')[${this.#productIndex}];

const value = Number(element.dataset.buyPrice);

console.log('initial product price', value);
return value;`,
          "variableName": "productPrice"
        },
        {
          "command": "eval",
          "condition": null,
          "notes": "click on buy link",
          "optional": false,
          "private": false,
          "sequence": 1,
          "target": "",
          "value": `document.querySelectorAll('[data-testid=\"prod_box\"] .red-buy-button')[${this.#productIndex}].click();`,
          "variableName": ""
        },
        {
          "command": "assertEval",
          "condition": null,
          "notes": "assert user was redirected to https://store.bitdefender.com/",
          "optional": false,
          "private": false,
          "sequence": 2,
          "target": "",
          "value": "return window.location.hostname === 'store.bitdefender.com';",
          "variableName": ""
        },
        {
          "command": "assertEval",
          "condition": null,
          "notes": "check if price from landing page is the same with the price from https://store.bitdefender.com/",
          "optional": false,
          "private": false,
          "sequence": 3,
          "target": "",
          "value": "const totalPrice = Number(window.omniture_vars.CART_PRODUCTS[0].ProductTotalPriceWithTaxAndDiscount.toFixed(2))\nconst subtotalPrice = Number(window.omniture_vars.CART_PRODUCTS[0].ProductPriceInDisplayedCurrency.toFixed(2));\n\nconsole.log('totalPrice', totalPrice);\nconsole.log('subtotalPrice', subtotalPrice);\nconsole.log('initialPrice', {{productPrice}});\n\nconst landingPagePriceEqualsShoppingCartTotalPrice = totalPrice === {{productPrice}};\nconst landingPagePriceEqualsShoppingCartSubtotalPrice = subtotalPrice === {{productPrice}};\nconst shoppingCartTotalPriceIsTheSameOrSmallerBy1Cent = totalPrice === Number(({{productPrice}} - 0.01).toFixed(2));\nconst shoppingCartSubtotalPriceIsTheSameOrSmallerBy1Cent = subtotalPrice === Number(({{productPrice}} - 0.01).toFixed(2));\n\n\nreturn landingPagePriceEqualsShoppingCartTotalPrice\n|| landingPagePriceEqualsShoppingCartSubtotalPrice\n|| shoppingCartTotalPriceIsTheSameOrSmallerBy1Cent\n|| shoppingCartSubtotalPriceIsTheSameOrSmallerBy1Cent\n",
          "variableName": ""
        }
      ],
      "testFrequency": 0,
      "testFrequencyAdvanced": [],
      "viewportSize": null
    };
  }
}

module.exports = PriceValidationTest;