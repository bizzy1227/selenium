const {Builder, By, Key, until} = require('selenium-webdriver');
const fs = require("fs");
const winston = require('winston');
const chrome = require('selenium-webdriver/chrome');

let Firstname = 'Firstname';
let Lastname = 'Lastname';
let Email = 'testmail@gmail.com';
let Tel = 639113425;

let countRedirect = 0;



const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    defaultMeta: { service: URL },
    transports: [
      new winston.transports.File({ filename: 'send_form_errors.log', level: 'error' }),
    ]
});

const checkSend  = async function(URL) {


    let driver = await new Builder().forBrowser('chrome')
        .setChromeOptions(new chrome.Options().addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors']))
        .build();

    try {
        await driver.get(URL);
        driver.sleep(5000);

        checkForm(driver, URL);

    } catch (e) {
        console.log(e);
    }


}

async function checkForm(driver, URL) {
    let indexElements = 0;
    let form = await driver.findElements(By.css('form'));
    // console.log(await form[0].isDisplayed());

    // если есть форма
    if (form.length > 0) {
        if (!await form[indexElements].isDisplayed()) indexElements = 1;
        fillForm(driver, URL, indexElements);
    } 
    else {
    // если нет формы
        let link = await driver.findElement(By.css('a'));
        await link.click();

        driver.sleep(10000);

        let currentUrl = await driver.getCurrentUrl();
        checkForm(driver, currentUrl);
    } 
}

async function fillForm(driver, URL, i) {

    let firstname = await driver.findElements(By.name('firstname'));
    if (firstname.length > 0) {
        await firstname[i].clear();
        await firstname[i].sendKeys(Firstname);
    } 
    
    let lastname = await driver.findElements(By.name('lastname'));
    if (lastname.length > 0) {
        await lastname[i].clear();
        await lastname[i].sendKeys(Lastname);
    }

    let tel = await driver.findElements(By.name('phone_number'));
    if (tel.length > 0) {
        await tel[i].clear();
        await tel[i].sendKeys(Tel);
    }

    let email = await driver.findElements(By.name('email'));
    if (email.length > 0) {
        await email[i].clear();
        await email[i].sendKeys(Email);
    }

    let submit = await driver.findElements(By.xpath(`//*[@type='submit']`));
    await submit[i].click();

    driver.sleep(10000);

    checkLastUrl(driver, URL);
}

async function checkLastUrl(driver, URL) {
    let currentUrl = await driver.getCurrentUrl();
    if (! await currentUrl.match(/thanks.php$/)) {
        countRedirect++;
        if (countRedirect < 3) fillForm(driver, currentUrl);
        else {
            console.log(`The limit (${countRedirect}) of clicks on links has been exceeded`, URL);
            countRedirect = 0;
        }
    } else {
        countRedirect = 0;
        console.log('Test send form done', URL);
    }
    // else {
    //     logger.log({
    //         level: 'error',
    //         message: 'Test send form failed'
    //     });
    // }
}

checkSend('https://adsocmcouode.info/');

module.exports.checkSend = checkSend;