/* eslint-disable no-unused-expressions */
// eslint-disable-next-line import/no-extraneous-dependencies
const resizeTo = require('terra-toolkit/lib/nightwatch/responsive-helpers').resizeTo;

module.exports = resizeTo(['tiny', 'enormous'], {
  'Displays a default divider': (browser) => {
    browser
      .url(`${browser.launchUrl}/#/tests/divider/default-divider`)
      .expect.element('#divider').to.be.present;
  },
});
