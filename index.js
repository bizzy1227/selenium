const {Builder, By, Key, until} = require('selenium-webdriver');
const fs = require("fs");
const winston = require('winston');
const chrome = require('selenium-webdriver/chrome');

// проверка установлен ли флаг на работу с thanks.php
let processThanksPage = false;
let myArgs = String(process.argv.slice(2));
myArgs = myArgs.split(',');
if (myArgs.includes('--with-thanks')) processThanksPage = true;


// получаем список сайтов
let siteQuery = fs.readFileSync("input.txt", "utf8");
siteQuery = siteQuery.replace(/\r/g, '');
siteQuery = siteQuery.split('\n');


(async function run() {
  for (let i of siteQuery) {
    let URL = '';
    // проверка на домен и если надо добавляем https://
    if (i.match(/^https:\/\//)) URL = i;
    else URL = 'https://' + i + '/';
  
    // добавляем в очередь страницу thanks.php если был установлен флаг --with-thanks
    if (processThanksPage) {
      processUrl(`${URL}thanks.php`);
      await sleep(10000);
    }
    processUrl(URL);
    await sleep(10000);
  }
})();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processUrl(URL) {

  console.log('start: ', URL);

  // '--ignore-certificate-errors', '--ignore-ssl-errors'
  let driver = await new Builder().forBrowser('chrome')
  .setChromeOptions(new chrome.Options().addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors']))
  .build();
  try {
    await driver.get(URL);
    driver.sleep(10000);

    let resultObj = {};
    let errors = await driver.manage().logs().get('browser');


    // настройка логера winston
    const logger = winston.createLogger({
      level: 'error',
      format: winston.format.json(),
      defaultMeta: { service: URL },
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
        logger.log({
          level: 'error',
          message: obj.message
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
    let links = await driver.findElements(By.css('a'));
    for(let link of links) {
      let href = await link.getAttribute('href');
      // нужно сделать set только с уникальными линками (или нет)
      // console.log('href: ', href);
      if (href === URL + '#') continue;
      else if (href === null) continue;
      else if (href === URL) continue;
      else if (href.match(URL)) processUrl(href);
    }
  } catch (e) {
    // настройка логера winston
    const logger = winston.createLogger({
      level: 'warn',
      format: winston.format.json(),
      defaultMeta: { service: URL },
      transports: [
        new winston.transports.File({ filename: 'js_console_errors.log', level: 'warn' }),
      ]
    });
    logger.log({
      level: 'warn',
      message: e.message
    });
  } finally {
    await driver.quit();
  }
}
