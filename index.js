const {Builder, By, Key, until} = require('selenium-webdriver');
const fs = require("fs");
const winston = require('winston');

let siteQuery = fs.readFileSync("input.txt", "utf8");

siteQuery = siteQuery.replace(/\r/g, '');
siteQuery = siteQuery.split('\n');
for (let i of siteQuery) {
  let URL = '';
  // проверка на домен и если надо добавляем https://
  if (i.match(/^https:\/\//)) URL = i;
  else URL = 'https://' + i + '/';

  // настройка логера winston
  const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    defaultMeta: { service: URL },
    transports: [
      //
      // - Write all logs with level `error` and below to `error.log`
      // - Write all logs with level `info` and below to `combined.log`
      //
      new winston.transports.File({ filename: 'js_console_errors.log', level: 'error' }),
      // new winston.transports.File({ filename: 'combined.log' }),
    ],
  });

  // добавляем в очередь страницу thanks.php
  processUrl(`${URL}thanks.php`);

  (async function example() {
    processUrl(URL);
  })();

  async function processUrl(URL) {
    console.log('start: ', URL);
    let driver = await new Builder().forBrowser('chrome').build();
    try {
      await driver.get(URL);
      // driver.sleep(10000);

      let resultObj = {};
      let errors = await driver.manage().logs().get('browser');


      // если есть ошибки
      if (errors.length !== 0) {
        resultObj[URL]= {};
        resultObj[URL].errors = [];
        for (let [i, err] of errors.entries()) {
          let obj = new Object(err);
          // если нужно скипать WARNING ошибки
          // if (obj.level.name_ === 'WARNING') continue;
          resultObj[URL].errors.push(obj);
        }
    
        // продолжаем если приоритет ошибок больше WARNING
        if (resultObj[URL].errors.length !== 0) {
          let myJSON;
        
          fs.readFile('web_console_errors.json', 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
              myJSON = JSON.parse(data); //now it an object 
              myJSON.sites.push(resultObj);
              myJSON = JSON.stringify(myJSON, null, 4);
      
              fs.writeFile('web_console_errors.json', myJSON, function(error){
                if(error) throw error; // если возникла ошибка
                            
                console.log('Запись файла завершена.');
              });
          }});
        };
      }

      // найти все ссылки этого же сайта 
      let links = await driver.findElements(By.css('a'));
      for(let link of links) {
        let href = await link.getAttribute('href');
        if (href === null) continue;
        else if (href === URL) continue;
        else if (href.match(URL)) processUrl(href);
      }
    } catch (e) {
      logger.log({
        level: 'error',
        message: e.message
      });
    } finally {
      await driver.quit();
    }
  }
}

