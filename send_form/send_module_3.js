const {Builder, By, Key, until} = require('selenium-webdriver');
const fs = require("fs");
const winston = require('winston');
const chrome = require('selenium-webdriver/chrome');
const webErrorsModule = require('../web_errors/web_errors_module');

let countRedirect = 0;
let logger;

let capabilities = false;
let processWebErrors = false;

const checkSend  = async function(URL, getWebErr, cp = false) {
    console.log('in checkSend');
    let driver;
    capabilities = cp;
    processWebErrors = getWebErr;

    console.log('run on', capabilities ? 'browser-stack' : 'browser');

    /*
        1. Проверка неогары
        2. Протестить логи
        3. Настроить работу:
            3.1 Один запуск на все сайты в хэд режиме локально для сбора ошибок
            3.2 Запуск каждого сайта на нужном девайсе (на каждом девайсе)
    */

    /*
        2. Проверить работу скрипта без таймаутов
            2.1 на локальном браузере
            2.2 на browser-stack
        3. Попробовать executeScript (при необходимости)
        4. Обработка прелендов
        5. Обработка сайтов с Клоакой (отслеживать по ссылкам на гугл, тильду)

            maxegvnimsiaer.pl - проблемный сайт (это сайт с клоакой)
            adbcodketet.info
            quanhteulmsystem.ru
            https://paettearon.info/kod.php
    */

    logger = winston.createLogger({
        level: 'error',
        format: winston.format.json(),
        defaultMeta: { service: capabilities ? 'browser-stack' : 'browser' },
        transports: [
          new winston.transports.File({ filename: 'send_form_errors.log', level: 'error' }),
        ]
    });

    if (capabilities) {
        driver = await new Builder().usingServer('http://hub-cloud.browserstack.com/wd/hub')
        .withCapabilities(capabilities).build();
    } else {
        driver = await new Builder().forBrowser('chrome')
        .setChromeOptions(new chrome.Options().addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors']))
        .build();
    }

    try {
        await driver.get(URL);
        // driver.sleep(5000);

        await checkForm(driver, URL);

    } catch (e) {
        console.log(e);
        logger.log({
            level: 'error',
            message: e.message,
            URL: URL
        });
    }


}

async function checkForm(driver, URL) {
    console.log('in checkForm');
    // получаем ошибки консоли
    if (processWebErrors) await webErrorsModule.processUrl(URL, false, driver, capabilities);

    let indexElements = 0;
    let form = await driver.findElements(By.css('form'));
    // console.log(await form[0].isDisplayed());

    // если есть форма
    if (form.length > 0) {
        if (!await form[indexElements].isDisplayed()) indexElements = 1;
        await fillForm(driver, URL, indexElements);
    } 
    else {
    // если нет формы
        let link = await driver.findElement(By.css('a'));
        await link.click();

        // driver.sleep(10000);

        let currentUrl = await driver.getCurrentUrl();
        await checkForm(driver, currentUrl);
    } 
}

async function fillForm(driver, URL, i) {
    console.log('in fillForm');

    let firstname = await driver.findElements(By.name('firstname'));
    await setValue('firstname', firstname.length, firstname, i);

    let lastname = await driver.findElements(By.name('lastname'));
    await setValue('lastname', lastname.length, lastname, i);

    let tel = await driver.findElements(By.name('phone_number'));
    await setValue('tel', tel.length, tel, i);

    let email = await driver.findElements(By.name('email'));
    await setValue('email', email.length, email, i);

    let submit = await driver.findElements(By.xpath(`//*[@type='submit']`));
    await submit[i].click();

    // driver.sleep(10000);

    await checkLastUrl(driver, URL);
}

async function checkLastUrl(driver, URL) {
    console.log('in checkLastUrl');

    let currentUrl = await driver.getCurrentUrl();
    if (! await currentUrl.match(/thanks.php$/)) {
        countRedirect++;
        if (countRedirect < 3) await checkForm(driver, currentUrl);
        else {
            console.log(`The limit (${countRedirect}) of clicks on links has been exceeded`, URL);
            countRedirect = 0;
            logger.log({
                level: 'error',
                message: `The limit (${countRedirect}) of clicks on links has been exceeded`,
                URL: currentUrl
            });
        }
    } else if (await currentUrl.match(/thanks.php$/)) {
        // получаем ошибки консоли страницы thanks.php
        if (processWebErrors) await webErrorsModule.processUrl(URL, false, driver, capabilities);
        countRedirect = 0;
        console.log('Test send form done', URL);
    } else {
        logger.log({
            level: 'error',
            message: 'Test send form failed',
            URL: currentUrl
        });
    }
}

async function setValue(name, length, element, i) {
    console.log('in setValue');
    
    const userData = {
        firstname: 'test',
        lastname: 'test',
        email: 'testmail3@gmail.com',
        tel: 111111111
    }
    if (length > 0) {
        await element[i].clear();
        await element[i].sendKeys(userData[name]);
    } 

}

// checkSend('https://magxeomizpeper.pl/');

module.exports.checkSend = checkSend;