const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

let driver;

const selfUpdate  = async function(inputURL) {
    // '--headless'
    driver = await new Builder().forBrowser('chrome')
    .setChromeOptions(new chrome.Options().addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors', '--headless']))
    .build();

    try {
        let nodeUrl = new URL(inputURL);
        nodeUrl.pathname = '/api/selfUpdate.me';
        console.log('in self module', nodeUrl.href);
        await driver.get(nodeUrl.href);

        // получаю и обрабатываю ответ после selfUpdate
        let elements = await driver.findElements(By.css('pre'));
        let result = await elements[0].getText();
        if (!result.match(/^Archive downloaded/)) throw Error('selfUpdate failed!');

    } catch (e) {
        console.log(e);
    } finally {
        driver.quit();
    }
}

module.exports.selfUpdate = selfUpdate;