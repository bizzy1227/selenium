const {Builder, By, Key, until} = require('selenium-webdriver');
const winston = require('winston');
const chrome = require('selenium-webdriver/chrome');
// const sendModule = require('../send_form/send_module_3');

const processUrl  = async function(URL, fastMode, driver, capabilities = false) {

  console.log('start: ', URL);

  // '--ignore-certificate-errors', '--ignore-ssl-errors'
  // let driver = await new Builder().forBrowser('chrome')
  // .setChromeOptions(new chrome.Options().addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors']))
  // .build();
  try {
    // await driver.get(URL);
    console.log('before: ', URL);
    driver.sleep(getDelay(fastMode));

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
      // resultObj[URL]= {};
      // resultObj[URL].errors = [];
      for (let [i, err] of errors.entries()) {
        let obj = new Object(err);
        // если нужно скипать WARNING ошибки
        // if (obj.level.name_ === 'WARNING') continue;
        logger.log({
          level: 'error',
          message: obj.message,
          URL: await driver.getCurrentUrl()
        });
        // если нужно скипать WARNING ошибки
        // if (obj.level.name_ === 'WARNING') continue;
        // resultObj[URL].errors.push(obj);
      }
  
      // продолжаем если приоритет ошибок больше WARNING
      // if (resultObj[URL].errors.length !== 0) {
      //   let myJSON;
      
      //   fs.readFile('web_console_errors.json', 'utf8', function readFileCallback(err, data){
      //     if (err){
      //         console.log(err);
      //     } else {
      //       myJSON = JSON.parse(data); //now it an object 
      //       myJSON.sites.push(resultObj);
      //       myJSON = JSON.stringify(myJSON, null, 4);
    
      //       fs.writeFile('web_console_errors.json', myJSON, function(error){
      //         if(error) throw error; // если возникла ошибка
                          
      //         console.log('Запись файла завершена.');
      //       });
      //   }});
      // };
    }

    // найти все ссылки этого же сайта 
    // let links = await driver.findElements(By.css('a'));
    // for(let link of links) {
    //   let href = await link.getAttribute('href');
    //   // нужно сделать set только с уникальными линками (или нет)
    //   // console.log('href: ', href);
    //   if (href === URL + '#') continue;
    //   else if (href === null) continue;
    //   else if (href === URL) continue;
    //   else if (href.match(URL)) processUrl(href, fastMode);
    // }
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
