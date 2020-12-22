const {Builder, By, Key, until} = require('selenium-webdriver');

(async function example() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://multiservice.com.ua/remont-smartfonov.html');
    let test = await driver.findElement(By.name('description')).getAttribute('content'); //.sendKeys('webdriver', Key.RETURN);
    // await driver.wait(until.titleIs('webdriver - Google Search'), 20000);
    await driver.sleep (10000);
    console.log('test:', test);
    console.log(await driver.manage().logs().get("browser"));
    
    // await driver.manage().logs().get("browser")
    // .then(function(entries) {
    //    entries.forEach(function(entry) {
    //      console.log('[%s] %s', entry.level.name, entry.message);
    //    });
    // });
    console.log('test');
    
  } finally {
    await driver.quit();
  }
})();