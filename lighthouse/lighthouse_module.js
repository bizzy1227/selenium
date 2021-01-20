const fs = require('fs');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const winston = require('winston');

// let URL = 'https://magxeomizpeper.pl/';

const checkLighthouse  = async function(URL) {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {logLevel: 'info', output: 'json', onlyCategories: ['performance'], port: chrome.port};
  const runnerResult = await lighthouse(URL, options);

  const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    defaultMeta: { service: URL },
    transports: [
      new winston.transports.File({ filename: 'lighthouse_report.log', level: 'info' }),
    ]
  });

  logger.log({
    level: 'info',
    message: 'mock',
    performance: runnerResult.lhr.categories.performance.score * 100
  });

  // `.report` is the HTML report as a string
  // const reportHtml = runnerResult.report;
  // fs.writeFileSync('lhreport.json', reportHtml);

  // `.lhr` is the Lighthouse Result as a JS object
  console.log('Report is done for', runnerResult.lhr.finalUrl);
  console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100);

  await chrome.kill();
};

module.exports.checkLighthouse = checkLighthouse;