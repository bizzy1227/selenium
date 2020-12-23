const {Builder, By, Key, until} = require('selenium-webdriver');
const fs = require("fs");



let siteQuery = fs.readFileSync("input.txt", "utf8");

siteQuery = siteQuery.replace(/\r/g, '');
siteQuery = siteQuery.split('\n');
for (let i of siteQuery) {
  let URL = '';
  // проверка на домен и если надо добавляем https://
  if (i.match(/^https:\/\//)) URL = i;
  else URL = 'https://' + i + '/';

  (async function example() {
    processUrl(URL);
    // let driver = await new Builder().forBrowser('chrome').build();
    // try {
    //   await driver.get(URL);
    //   driver.sleep(10000);

    //   let resultObj = {};
    //   let errors = await driver.manage().logs().get('browser');



    //   if (errors.length === 0) return;

    //   resultObj[URL]= {};
    //   resultObj[URL].errors = [];
    //   for (let [i, err] of errors.entries()) {
    //     let obj = new Object(err);
    //     // если нужно скипать предупреждение
    //     if (obj.level.name_ === 'WARNING') continue;
    //     resultObj[URL].errors.push(obj);
    //   }
  
    //   // ничего не делаем если нет ошибок
    //   if (resultObj[URL].errors.length === 0) return;

    //   let myJSON;
      
    //   fs.readFile('output.json', 'utf8', function readFileCallback(err, data){
    //     if (err){
    //         console.log(err);
    //     } else {
    //       myJSON = JSON.parse(data); //now it an object 
    //       myJSON.sites.push(resultObj);
    //       myJSON = JSON.stringify(myJSON, null, 4);
  
    //       fs.writeFile('output.json', myJSON, function(error){
    //         if(error) throw error; // если возникла ошибка
                        
    //         console.log('Запись файла завершена.');
    //       });
    //   }});
      
      
  
    //   // await driver.manage().logs().get("browser")
    //   // .then(function(entries) {
    //   //    entries.forEach(function(entry) {
    //   //      console.log('[%s] %s', entry.level.name, entry.message);
    //   //    });
    //   // });
      
    // } finally {
    //   await driver.quit();
    // }
  })();

  async function processUrl(URL) {
    console.log(URL);
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
          // если нужно скипать предупреждение
          if (obj.level.name_ === 'WARNING') continue;
          resultObj[URL].errors.push(obj);
        }
    
        // продолжаем если приоритет ошибок больше не WARNING
        if (resultObj[URL].errors.length !== 0) {
          let myJSON;
        
          fs.readFile('output.json', 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
              myJSON = JSON.parse(data); //now it an object 
              myJSON.sites.push(resultObj);
              myJSON = JSON.stringify(myJSON, null, 4);
      
              fs.writeFile('output.json', myJSON, function(error){
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
        // console.log(href);
        if (href === null) continue;
        else if (href === URL) continue;
        else if (href.match(URL)) processUrl(href);
        // console.log(href);
        // console.log(await link.getAttribute('href'));
      }
  
      // await driver.manage().logs().get("browser")
      // .then(function(entries) {
      //    entries.forEach(function(entry) {
      //      console.log('[%s] %s', entry.level.name, entry.message);
      //    });
      // });
      
    } finally {
      await driver.quit();
    }
  }
}

