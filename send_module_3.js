const {Builder, By, Key, until} = require('selenium-webdriver');
const fs = require("fs");
const winston = require('winston');
const chrome = require('selenium-webdriver/chrome');

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
    setValue('firstname', firstname.length, firstname, i);

    let lastname = await driver.findElements(By.name('lastname'));
    setValue('lastname', lastname.length, lastname, i);

    let tel = await driver.findElements(By.name('phone_number'));
    setValue('tel', tel.length, tel, i);

    let email = await driver.findElements(By.name('email'));
    setValue('email', email.length, email, i);

    let submit = await driver.findElements(By.xpath(`//*[@type='submit']`));
    await submit[i].click();

    driver.sleep(10000);

    checkLastUrl(driver, URL);
}

async function checkLastUrl(driver, URL) {
    let currentUrl = await driver.getCurrentUrl();
    if (! await currentUrl.match(/thanks.php$/)) {
        countRedirect++;
        if (countRedirect < 3) checkForm(driver, currentUrl);
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

async function setValue(name, length, element, i) {
    const userData = {
        firstname: 'Firstname',
        lastname: 'Lastname',
        email: 'testmail@gmail.com',
        tel: 639113425
    }
    if (length > 0) {
        await element[i].clear();
        await element[i].sendKeys(userData[name]);
    } 

}

checkSend('https://polsfkadziybyzis.pl/');

module.exports.checkSend = checkSend;