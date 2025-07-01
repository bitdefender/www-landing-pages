/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable quotes */
/* eslint-disable no-await-in-loop */
/* eslint-disable arrow-parens */
/* eslint-disable no-restricted-syntax */
const { JSDOM } = require('jsdom');
const fs = require('fs');

// Base URLs
const hostname = 'https://main--www-landing-pages--bitdefender.aem.page';
const jsonUrl = 'https://main--www-landing-pages--bitdefender.aem.page/query-index.json';

/**
 * Function to get class names from HTML
 * @param {string} html
 * @param {string} path
 * @returns {[string[], string[]]}
 */
const extractClassNames = (html, path) => {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const mainElements = document.querySelectorAll('main > div > div[class]');
  const classNames = [];
  const fragmentUrls = [];

  mainElements.forEach(el => {
    if (el.className === 'fragment') {
      const language = path.split('/')[2];
      const linkToFragment = el.querySelector('a').href.replace('lang', language);
      fragmentUrls.push(linkToFragment);
      return;
    }

    classNames.push(el.className);
  });

  return [classNames, fragmentUrls];
};

// Function to fetch page and extract class names
const fetchPageClassNames = async (path) => {
  try {
    const url = `${hostname}${path}`;
    console.log('Get: ', url);
    const response = await fetch(url);
    return extractClassNames(await response.text(), path);
  } catch (error) {
    console.error(`Error fetching ${path}:`, error.message);
    return [];
  }
};

// Function to fetch the data array from the JSON URL
const fetchDataArray = async () => {
  try {
    const response = await fetch(jsonUrl);
    const data = await response.json();
    return data.data; // Assuming the 'data' array is in 'response.data.data'
  } catch (error) {
    console.error(`Error fetching data array:`, error.message);
    return [];
  }
};

/**
 * Fetch the Page from URL and make notes of the classes and components
 * @param {string} url
 * @param {object} classCountMap
 */
const fetchPage = async (url, classCountMap) => {
  const [classNames, fragmentUrls] = await fetchPageClassNames(url);

  classNames.forEach((className) => {
    const componentName = className.split(' ')[0];
    if (componentName in classCountMap) {
      classCountMap[componentName].encounters += 1;
      classCountMap[componentName].paths.push(url);
    } else {
      classCountMap[componentName] = {
        encounters: 1,
        paths: [url],
      };
    }
  });

  for (const fragmentUrl of fragmentUrls) {
    await fetchPage(fragmentUrl, classCountMap);
  }
};

// Main function to process all paths
const processPaths = async () => {
  const classCountMap = {};

  // Fetch data array from the JSON file
  const dataArray = await fetchDataArray();

  // Process each path in the data array
  const pageCalls = dataArray.map(async item => {
    if (item.path.includes('sidekick')) {
      return;
    }

    await fetchPage(item.path, classCountMap);
  });

  await Promise.all(pageCalls);

  const allComponents = fs.readdirSync('./_src-lp/blocks', { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  allComponents.forEach(componentName => {
    if (!classCountMap[componentName]) {
      console.log("Component ", componentName, " is not used");
      return;
    }

    if (classCountMap[componentName].encounters <= 5) {
      console.log("Component ", componentName, " data: ", classCountMap[componentName]);
    }
  });
};

// Run the main function
processPaths();
