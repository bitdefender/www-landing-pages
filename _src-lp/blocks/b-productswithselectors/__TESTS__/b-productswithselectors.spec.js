// eslint-disable-next-line import/extensions
import mockData from './mock-data.json';
// mock everything that is not related to the actual main scope
jest.mock('../../../scripts/lib-franklin.js', () => ({
  ...jest.requireActual('../../../scripts/lib-franklin.js'),
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
      const UsersSelectorBox = b_productswithselectors.querySelectorAll('.selectorBox')[0];
    
      // Set the target value on the selector
      UsersSelectorBox.value = '11';
      // Dispatch the change event
      UsersSelectorBox.dispatchEvent(new Event('change'));

      const triggerValue = UsersSelectorBox.value;
      const fileServers1stProd = Math.ceil((Number(triggerValue)) * 0.3);
      const fileServers2ndProd = Math.ceil((Number(triggerValue)) * 0.3);
      const mailboxes = Math.ceil((Number(triggerValue) / 100) * 150);

      const selectors = [
        { index: 2, type: 1, value: triggerValue },
        { index: 3, type: 1, value: triggerValue },
        { index: 4, type: 1, value: triggerValue },
        { index: 2, type: 2, value: fileServers1stProd },
        { index: 3, type: 2, value: fileServers2ndProd },
        { index: 4, type: 2, value: fileServers2ndProd },
        { index: 4, type: 3, value: mailboxes },
      ];

      selectors.forEach((selector) => {
        const { index, type, value } = selector;
        const query = `.b-productswithselectors > div:nth-child(${index}) ul:last-of-type li:nth-child(${type}) strong`;
        const element = b_productswithselectors.querySelector(query);
        if (element) {
          // check if the value has been updated
          expect(element.innerHTML).toBe(`${value}`);
        }
      });
    });
  });
});
