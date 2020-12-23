const {Builder, By, Key, until} = require('selenium-webdriver');
const fs = require("fs");

let URL = 'https://multiservice.com.ua/remont-smartfonov.html';

(async function example() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get(URL);
    let test = await driver.findElement(By.name('description')).getAttribute('content'); //.sendKeys('webdriver', Key.RETURN);
    // await driver.wait(until.titleIs('webdriver - Google Search'), 20000);
    // await driver.sleep (10000);
    // console.log('test:', test);
    // console.log(await typeof driver.manage().logs().get("browser"));
    let resultObj = {};
    let errors = await driver.manage().logs().get('browser');
    
    resultObj[URL]= {};
    resultObj[URL].errors = [];
    for (let [i, err] of errors.entries()) {
      let obj = new Object(err);
      
      // console.log(resultObj);
      // resultObj.i.site = 'https://multiservice.com.ua/remont-smartfonov.html';
      resultObj[URL].errors.push(obj);
      // console.log(`Error # ${i}: `, err);
    }
    
    const myJSON = JSON.stringify(resultObj, null, 4);
    // console.log(myJSON);

    fs.appendFile('output.json', myJSON, function(error){
      if(error) throw error; // если возникла ошибка
                   
      console.log('Запись файла завершена.');
      // let data = fs.readFileSync('output.json', 'utf8');
      // console.log(data);  // выводим считанные данные
  });
    

    // await driver.manage().logs().get("browser")
    // .then(function(entries) {
    //    entries.forEach(function(entry) {
    //      console.log('[%s] %s', entry.level.name, entry.message);
    //    });
    // });
    
  } finally {
    await driver.quit();
  }
})();