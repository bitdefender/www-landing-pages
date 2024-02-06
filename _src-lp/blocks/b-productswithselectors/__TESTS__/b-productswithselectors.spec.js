// eslint-disable-next-line import/extensions
import mockData from './mock-data.json';
// mock everything that is not related to the actual main scope
jest.mock('../../../scripts/aem.js', () => ({
  ...jest.requireActual('../../../scripts/aem.js'),
  loadHeader: jest.fn(),
  loadFooter: jest.fn(),
}));

describe('b-productswithselectors block', () => {

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('b-productswithselectors', () => {

    // init / bootstrap page()
    document.body.innerHTML = mockData.b_productswithselectors;
    import('../../../scripts/scripts.js');

    let b_productswithselectors;

    beforeEach(() => {
      b_productswithselectors = document.querySelector('.b-productswithselectors-container');
    });

    test('check if products have been added to the window.productsListCount', () => {
        expect(window.productsListCount).toBeTruthy();
    });

    test('check if the number of servers and mailboxes changes based on number of devices selected', () => {
      const usersSelectorBox = b_productswithselectors.querySelectorAll('.selectorBox')[0];
    
      // Set the target value on the selector
      usersSelectorBox.value = '11';
      // Dispatch the change event
      usersSelectorBox.dispatchEvent(new Event('change'));

      const triggerValue = usersSelectorBox.value;
      const fileServers1stProd = 4;
      const fileServers2ndProd = 4;
      const mailboxes = 17;

      const selectors = [
        { index: 2, listChildNumber: 1, value: triggerValue },
        { index: 3, listChildNumber: 1, value: triggerValue },
        { index: 4, listChildNumber: 1, value: triggerValue },
        { index: 2, listChildNumber: 2, value: fileServers1stProd },
        { index: 3, listChildNumber: 2, value: fileServers2ndProd },
        { index: 4, listChildNumber: 2, value: fileServers2ndProd },
        { index: 4, listChildNumber: 3, value: mailboxes },
      ];

      selectors.forEach((selector) => {
        const { index, listChildNumber, value } = selector;
        const query = `.b-productswithselectors > div:nth-child(${index}) ul:last-of-type li:nth-child(${listChildNumber}) strong`;
        const element = b_productswithselectors.querySelector(query);
        if (element) {
          // check if the value has been updated
          expect(element.innerHTML).toBe(`${value}`);
        }
      });
    });
  });
});
