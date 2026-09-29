// Optional preload for legacy browser suites, isolating them from real accounts.
// NODE_OPTIONS="--require ./scripts/with-preview-auth.cjs" npm run test:preview
const { chromium } = require('@playwright/test');
const { authenticatePreview } = require('./preview-fixture.cjs');
const launch = chromium.launch.bind(chromium);
chromium.launch = async (...args) => {
  const browser = await launch(...args);
  const newPage = browser.newPage.bind(browser);
  browser.newPage = async (...options) => {
    const page = await newPage(...options);
    await authenticatePreview(page);
    return page;
  };
  return browser;
};
