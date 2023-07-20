import {addScript} from "../../scripts/utils.js";


describe('addScript function', () => {
  let scriptTag;
  const mockCallback = jest.fn();
  const scriptUrl = 'https://example.com/script.js';
  const scriptData = { test: 'value' };

  beforeEach(() => {
    document.body.innerHTML = '';
    scriptTag = null;
    mockCallback.mockClear();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should add a script tag to the document body', () => {
    addScript(scriptUrl);
    scriptTag = document.querySelector(`script[src="${scriptUrl}"]`);
    expect(scriptTag).not.toBeNull();
  });

  it('should add a script tag with the correct src', () => {
    addScript(scriptUrl);
    scriptTag = document.querySelector(`script[src="${scriptUrl}"]`);
    expect(scriptTag.src).toEqual(scriptUrl);
  });

  it('should add a script tag with correct type when type is provided', () => {
    const type = 'async';
    addScript(scriptUrl, {}, type);
    scriptTag = document.querySelector(`script[src="${scriptUrl}"]`);
    expect(scriptTag.getAttribute(type)).toBeTruthy();
  });

  it('should set the correct data attributes when data is provided', () => {
    addScript(scriptUrl, scriptData);
    scriptTag = document.querySelector(`script[src="${scriptUrl}"]`);
    expect(scriptTag.dataset.test).toEqual('value');
  });

  it('should not set data attributes when data is not an object', () => {
    addScript(scriptUrl, 'notAnObject');
    scriptTag = document.querySelector(`script[src="${scriptUrl}"]`);
    expect(scriptTag.dataset.test).toBeUndefined();
  });

  it('should execute the callback function when the script loads', async () => {
    expect.assertions(1);
    addScript(scriptUrl, {}, 'async', mockCallback);
    scriptTag = document.querySelector(`script[src="${scriptUrl}"]`);
    await new Promise(resolve => {
      scriptTag.onload = resolve;
    });
    expect(mockCallback).toHaveBeenCalled();
  });
});
