const {Builder, By, Key, until} = require('selenium-webdriver');
const fs = require("fs");
const winston = require('winston');
const chrome = require('selenium-webdriver/chrome');
let proxy = require('selenium-webdriver/proxy');
const webErrorsModule = require('../web_errors/web_errors_module');
let opts = new chrome.Options();
const CONSTS = require('../consts');

let countRedirect = 0;
let logger;

let capabilities = false;
let processWebErrors = false;
let proxyAddress = false;

let mainResult;

const checkSend  = async function(URL, getWebErr, cp, myProxy) {
    
    console.log('in checkSend');
    let driver;
    capabilities = cp;
    console.log('cp =', capabilities);
    processWebErrors = getWebErr;
    proxyAddress = myProxy;

    console.log('run on', capabilities ? 'browser-stack' : 'browser');

    /*
        
        
        1. разобратся почему не запускается checkNeogara если много сайтов + ошибка
        2. Сделать так что бы вспомогательные модули не ломали тест
        3. Придмать как работать с relink
            maxmeimibztzer.info
            maxwesminzpzer.info
            mazxemizer.info
            koduyrurspeha.ru

            https://dailyrfrlesh.ru/b.php
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
        console.log('useProxy', proxyAddress);
        if (proxyAddress) opts.setProxy(proxy.manual({https: proxyAddress}));
        opts.addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors'])
        driver = await new Builder().forBrowser('chrome')
        .setChromeOptions(opts)
        .build();
    }

    try {
        // добавляем параметры для отправки на dev.neogara
        let searchParams = URL.searchParams;
        searchParams.set('action', 'test');
        searchParams.set('pid', 'kag318');
        searchParams.set('group', '1');
        URL.search = searchParams.toString();
        // переходим на ссылку с параметрами дял dev
        await driver.get(URL.href);

        // await driver.get(URL.href);
        // driver.sleep(5000);

        await checkForm(driver, URL);

        return mainResult;

    } catch (e) {
        console.log(e);
        logger.log({
            level: 'error',
            message: e.message,
            URL: URL,
            capabilities: capabilities
        });
        driver.quit();
        mainResult = {error: e.message, capabilities: capabilities, URL: URL.href};
        return mainResult;
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

async function fillForm(driver, inputUrl, i) {
    let oldUrl = inputUrl.href;
    console.log('in fillForm', inputUrl.href);

    // // добавляем параметры для отправки на dev.neogara
    // let searchParams = inputUrl.searchParams;
    // searchParams.set('action', 'test');
    // searchParams.set('pid', 'kag318');
    // searchParams.set('group', '1');
    // inputUrl.search = searchParams.toString();
    // // переходим на ссылку с параметрами дял dev
    // await driver.get(inputUrl.href);

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
    
    inputUrl = new URL(await driver.getCurrentUrl());
    await checkLastUrl(driver, inputUrl.href);
}

async function checkLastUrl(driver, inputUrl) {
    console.log('in checkLastUrl');

    let currentUrl = new URL(inputUrl);

    console.log('crrURL.pathname', currentUrl.pathname);
    console.log('currentUrl.pathname === "/thanks.php"', currentUrl.pathname === '/thanks.php');
    
    if (currentUrl.pathname !== '/thanks.php') {
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
            mainResult ={error: `The limit (${countRedirect}) of clicks on links has been exceeded`, capabilities: capabilities, URL: currentUrl.href};
            return mainResult;
        }
    } else if (currentUrl.pathname === '/thanks.php') {
        // получаем ошибки консоли страницы thanks.php
        if (processWebErrors) await webErrorsModule.processUrl(currentUrl.href, false, driver, capabilities);
        countRedirect = 0;
        console.log('Test send form done', currentUrl.href);
        driver.quit();
        mainResult = true;
        return mainResult;
    } else {
        logger.log({
            level: 'error',
            message: 'Test send form failed',
            URL: currentUrl.href
        });
        driver.quit();
        mainResult = {error: 'Test send form failed', URL: currentUrl.href};
        return mainResult;
    }
}

async function setValue(name, length, element, i) {
    console.log('in setValue');

    if (length > 0) {
        await element[i].clear();
        await element[i].sendKeys(CONSTS.USER_DATA[name]);
    } 

}

async function clickBtn(submit, i) {
    console.log('in clickBtn');
    submit[i].click();
}

// checkSend('https://magxeomizpeper.pl/');

module.exports.checkSend = checkSend;