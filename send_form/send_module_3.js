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
    console.log('cp =', capabilities);
    processWebErrors = getWebErr;

    console.log('run on', capabilities ? 'browser-stack' : 'browser');

    /*
        1. Обработка сайтов с Клоакой (отслеживать по ссылкам на гугл, тильду. Передавать блэк страницы в обработку)
        2. Протестить логи
            - пообварачивать все функции в try...catch для логирования
        3. добавить selfUpdate дял тестируемых сайтов
        4. проверять поля settings.json
        5. Работа с прокси для проверки стран (возможно решит проблему с клоакой)
        6. Вынести в константы:
            - данные для отправки формы
            - ключи от browserstack
            - ключи от neogara
        7. Попробовать executeScript (при необходимости)
        8. Тест настройки normal page load strategy
            maxmeimibztzer.info
            maxwesminzpzer.info
            mazxemizer.info
            koduyrurspeha.ru
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

        await driver.get(URL.href);
        // driver.sleep(5000);

        await checkForm(driver, URL);

    } catch (e) {
        console.log(e);
        logger.log({
            level: 'error',
            message: e.message,
            URL: URL,
            capabilities: capabilities
        });
        driver.quit();
    }


}

async function checkForm(driver, inputURL) {
    // записываем текущую вкладку
    // const originalWindow = await driver.getWindowHandle();

    console.log('in checkForm');
    // получаем ошибки консоли
    if (processWebErrors) await webErrorsModule.processUrl(inputURL.href, false, driver, capabilities);

    let indexElements = 0;
    let form = await driver.findElements(By.css('form'));
    // console.log(await form[0].isDisplayed());

    // если есть форма
    if (form.length > 0) {
        if (!await form[indexElements].isDisplayed()) indexElements = 1;
        await fillForm(driver, inputURL, indexElements);
    } 
    else {
        // если нет формы
        console.log('in block no form');
        const originalWindow = await driver.getWindowHandle();
        console.log('originalWindow.length',  originalWindow.length);
        let link = await driver.findElement(By.xpath('//a'));
        // проверка открывается ли ссылка в новой вкладке
        let targetLink = await link.getAttribute('target');
        let href = await link.getAttribute('href');
        console.log('href', href);
        console.log('targetLink', targetLink);
        await link.click();
        // await driver.get(href);

        // если открывается ссылка в новой вкладке
        if (targetLink === '_blank') {
            await driver.sleep(5000);
            const windows = await driver.getAllWindowHandles();
            console.log('windows.length', windows.length);
            windows.forEach(async handle => {
                if (handle !== originalWindow) {
                    await driver.switchTo().window(handle);
                }
            });
        }

        // жду когда появится форма (возможно улучшить, что бы ждать загрузку страницы)
        // await driver.wait(until.elementLocated(By.css('form')), 10000);
        await driver.sleep(5000);

        let currentUrl = new URL(await driver.getCurrentUrl());
        await checkForm(driver, currentUrl);
    } 
}

async function fillForm(driver, URL, i) {
    let oldUrl = URL.href;
    console.log('in fillForm');

    let search_params = URL.searchParams;

    search_params.set('action', 'test');
    search_params.set('pid', 'kag318');
    search_params.set('group', '1');

    URL.search = search_params.toString();
    await await driver.get(URL.href);

    let firstname = await driver.findElements(By.name('firstname'));
    await setValue('firstname', firstname.length, firstname, i); 

    let lastname = await driver.findElements(By.name('lastname'));
    await setValue('lastname', lastname.length, lastname, i);

    let tel = await driver.findElements(By.name('phone_number'));
    await setValue('tel', tel.length, tel, i);

    let email = await driver.findElements(By.name('email'));
    await setValue('email', email.length, email, i);

    let submit = await driver.findElements(By.xpath(`//*[@type='submit']`));
    await clickBtn(submit, i);

    
    await driver.sleep(5000);
    // const documentInitialised = async function() {
    //     if (oldUrl !== await driver.getCurrentUrl()) return true;
    //     else return false;
    // }
    // await driver.wait(() => documentInitialised(), 30000);
    
    await checkLastUrl(driver);
}

async function checkLastUrl(driver) {
    console.log('in checkLastUrl');

    let currentUrl = await driver.getCurrentUrl();
    currentUrl = new URL(currentUrl);
    console.log('crrURL.pathname', currentUrl.pathname);
    console.log('currentUrl.pathname === "/thanks.php"', currentUrl.pathname === '/thanks.php');
    
    if (! currentUrl.pathname === '/thanks.php') {
        countRedirect++;
        if (countRedirect < 3) await checkForm(driver, currentUrl);
        else {
            console.log(`The limit (${countRedirect}) of clicks on links has been exceeded`, currentUrl.href);
            countRedirect = 0;
            logger.log({
                level: 'error',
                message: `The limit (${countRedirect}) of clicks on links has been exceeded`,
                URL: currentUrl.href
            });
        }
    } else if (currentUrl.pathname === '/thanks.php') {
        // получаем ошибки консоли страницы thanks.php
        if (processWebErrors) await webErrorsModule.processUrl(currentUrl.href, false, driver, capabilities);
        countRedirect = 0;
        console.log('Test send form done', currentUrl.href);
        driver.quit();
        return;
    } else {
        logger.log({
            level: 'error',
            message: 'Test send form failed',
            URL: currentUrl.href
        });
        driver.quit();
    }
}

async function setValue(name, length, element, i) {
    console.log('in setValue');
    
    const userData = {
        firstname: 'test',
        lastname: 'test',
        email: 'testmail5@gmail.com',
        tel: 111111111
    }
    if (length > 0) {
        await element[i].clear();
        await element[i].sendKeys(userData[name]);
    } 

}

async function clickBtn(submit, i) {
    console.log('in clickBtn');
    submit[i].click();
}

// checkSend('https://magxeomizpeper.pl/');

module.exports.checkSend = checkSend;