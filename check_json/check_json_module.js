const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const winston = require('winston');

let driver;

const checkJson  = async function(inputURL) {
    console.log('in checkJson');
    // '--headless'
    driver = await new Builder().forBrowser('chrome')
    .setChromeOptions(new chrome.Options().addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors', '--headless']))
    .build();

    logger = winston.createLogger({
        level: 'error',
        format: winston.format.json(),
        defaultMeta: { service: 'headless browser' },
        transports: [
          new winston.transports.File({ filename: 'check_json_errors.log', level: 'error' }),
        ]
    });

    let nodeUrl = new URL(inputURL);

    try {
        
        nodeUrl.pathname = '/settings.json';
        console.log('in json module', nodeUrl.href);
        await driver.get(nodeUrl.href);

        let errorObj = {};

        // получаю и обрабатываю ответ после selfUpdate
        let elements = await driver.findElements(By.css('pre'));
        let result = JSON.parse(await elements[0].getText());
        console.log('result', result);
        if (!result.pid) errorObj.pid = 'is absent';
        if (!result.group) errorObj.group = 'is absent';
        if (!result.yandex) errorObj.yandex = 'is absent';
        
        // если объект не пустой, логируем его
        if (Object.keys(errorObj).length !== 0) {
            logger.log({
                level: 'error',
                message: errorObj,
                URL: nodeUrl.href
            });
            return {hasError: true, result: {err: errorObj, URL: nodeUrl.href}};
        }

        // возвращаю адрес с которого будет отправлен лид для проверки с неогары
        if (result.relink) return {hasError: false, result: result.relink};
        
        return {hasError: false, result: false};

    } catch (e) {
        logger.log({
            level: 'error',
            message: e.message,
            URL: nodeUrl.href
        });
        return {hasError: true, result: {err: e.message, URL: nodeUrl.href}};
    } finally {
        driver.quit();
    }
}

module.exports.checkJson = checkJson;