const {Builder, By, Key, until} = require('selenium-webdriver');
const fs = require("fs");
const winston = require('winston');
const chrome = require('selenium-webdriver/chrome');

let Firstname = 'Firstname';
let Lastname = 'Lastname';
let Email = 'testmail@gmail.com';
let Tel = 639113425;

const checkSend  = async function(URL) {

    const logger = winston.createLogger({
        level: 'error',
        format: winston.format.json(),
        defaultMeta: { service: URL },
        transports: [
          new winston.transports.File({ filename: 'send_form_errors.log', level: 'error' }),
        ]
    });

    let driver = await new Builder().forBrowser('chrome')
        .setChromeOptions(new chrome.Options().addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors']))
        .build();

    try {
        await driver.get(URL);
        driver.sleep(10000);

        // пробуем получить мыло по id.
        // Если не выходит то значит мы на странице где нет полной формы
        // и мы попадаем в блок catch
        let email = driver.findElement(By.id('email'));
        await email.sendKeys(Email, Key.ENTER);

        send(driver, logger, URL);
    
    } catch (e) {
        // заполняем email и переходим на страницу с формой отправки
        let email = await driver.findElement(By.name('email'));
        await email.sendKeys(Email, Key.ENTER);
        driver.sleep(10000);

        // провевряем сохранилось ли поле email c прошлой страницы
        email = await driver.findElement(By.id('email'));
        if  (await email.getAttribute('value') !== Email) {
            logger.log({
                level: 'error',
                message: 'Not saved field Email'
            });
        }

        send(driver, logger, URL);
    }
}

async function send(driver, logger, URL) {
    let firstname = driver.findElement(By.id('first_name'));
    await firstname.sendKeys(Firstname, Key.ENTER);

    let lastname = driver.findElement(By.id('last_name'));
    await lastname.sendKeys(Lastname, Key.ENTER);

    let tel = driver.findElement(By.id('phone'));
    await tel.sendKeys(Tel, Key.ENTER);

    let currentUrl = await driver.getCurrentUrl();
    if (await currentUrl.match(/thanks.php$/)) console.log('Test send form done', URL);
    else {
        logger.log({
            level: 'error',
            message: 'Test send form failed'
        });
    }

    await driver.quit();
}

checkSend('https://paettearon.info/');

module.exports.checkSend = checkSend;