const {Builder, By, Key, until} = require('selenium-webdriver');
const winston = require('winston');
const chrome = require('selenium-webdriver/chrome');
// const sendModule = require('../send_form/send_module_3');

const processUrl  = async function(URL, fastMode, driver, capabilities = false) {
  console.log('in processUrl');

  console.log('start: ', await driver.getCurrentUrl());

  // '--ignore-certificate-errors', '--ignore-ssl-errors'
  // let driver = await new Builder().forBrowser('chrome')
  // .setChromeOptions(new chrome.Options().addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors']))
  // .build();
  try {
    // await driver.get(URL);
    console.log('before: ', await driver.getCurrentUrl());
    // driver.sleep(getDelay(fastMode));

    // sendModule.send(driver);

    let resultObj = {};
    let errors = await driver.manage().logs().get('browser');


    // настройка логера winston
    const logger = winston.createLogger({
      level: 'error',
      format: winston.format.json(),
      defaultMeta: { service: capabilities ? 'browser-stack' : 'browser' },
      transports: [
        new winston.transports.File({ filename: 'web_console_errors.log', level: 'error' }),
      ]
    });


    // если есть ошибки
    if (errors.length !== 0) {

      for (let [i, err] of errors.entries()) {
        let obj = new Object(err);
        // если нужно скипать WARNING ошибки
        // if (obj.level.name_ === 'WARNING') continue;
        logger.log({
          level: 'error',
          message: obj.message,
          URL: await driver.getCurrentUrl()
        });
      }

    }

  } catch (e) {
    console.log(e);
    // настройка логера winston
    const logger = winston.createLogger({
      level: 'warn',
      format: winston.format.json(),
      defaultMeta: { service: capabilities ? 'browser-stack' : 'browser' },
      transports: [
        new winston.transports.File({ filename: 'js_console_errors.log', level: 'warn' }),
      ]
    });
    logger.log({
      level: 'warn',
      message: e.message,
      URL: await driver.getCurrentUrl()
    });
  }
}

function getDelay(fastMode) {
  if (fastMode) return 1000;
  else return 10000;
}

module.exports.processUrl = processUrl;
