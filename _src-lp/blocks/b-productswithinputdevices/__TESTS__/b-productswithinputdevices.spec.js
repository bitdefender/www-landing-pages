// eslint-disable-next-line import/extensions
import mockData from './mock-data.json';
// mock everything that is not related to the actual main scope
jest.mock('../../../scripts/lib-franklin.js', () => ({
  ...jest.requireActual('../../../scripts/lib-franklin.js'),
  loadHeader: jest.fn(),
  loadFooter: jest.fn(),
}));

// import { updateTableElement } from '../b-productswithinputdevices.js';

describe('b-productswithinputdevices block', () => {

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('b-productswithinputdevices', () => {

    // init / bootstrap page()
    document.body.innerHTML = mockData.b_productswithinputdevices;
    import('../../../scripts/scripts.js');

    let b_productswithinputdevicesContainer;

    beforeEach(() => {
      b_productswithinputdevicesContainer = document.querySelector('.b-productswithinputdevices-container');
    });

    test('Green tag text should match the one defined in metadata', () => {
      const block = b_productswithinputdevicesContainer.querySelector('.greenTag');
      expect(block.innerText).toBe('NEW');
    });

    test('Metadata property bulinaText should create the block containing following classes', () => {
      const block = b_productswithinputdevicesContainer.querySelector('.prod-percent.green_bck_circle.bigger.has2txt');
      expect(block.innerHTML).toBeTruthy();
    });

    test('Check when clicking the + button that the value updates correctly', () => {
      const plusButton = b_productswithinputdevicesContainer.querySelector('.b-productswithinputdevices fieldset button:nth-child(4)');
      const inputField = b_productswithinputdevicesContainer.querySelector('.b-productswithinputdevices fieldset input');

      plusButton.click();
      expect(inputField.value).toBe('11');
    });

    test('Check when clicking the - button that the value updates correctly', () => {
      const minusButton = b_productswithinputdevicesContainer.querySelector('.b-productswithinputdevices fieldset button');
      const inputField = b_productswithinputdevicesContainer.querySelector('.b-productswithinputdevices fieldset input');
      
      // input field is 11 from the previous test, so we click 2 times to get to 9
      minusButton.click();
      minusButton.click();
      expect(inputField.value).toBe('9');
    });


  });


});
