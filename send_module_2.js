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
        driver.sleep(5000);

        if (await driver.findElement(By.css('form'))) {
            if (await driver.findElement(By.name('phone_number'))) {
                // отрабатывает если на странице сраху есть форма со всеми полями для проверки send
                let firstname = await driver.findElement(By.name('firstname'));
                await firstname.sendKeys(Firstname);
            
                let lastname = await driver.findElement(By.name('lastname'));
                await lastname.sendKeys(Lastname);
            
                let tel = await driver.findElement(By.name('phone_number'));
                await tel.sendKeys(Tel);
            
                let email = await driver.findElement(By.name('email'));
                await email.sendKeys(Email, Key.ENTER);

                checkLastUrl(driver, logger, URL);
            }
        }
    } catch (e) {
        if (e.message.match(/form"}$/mg)) {
            console.log('site not have form');
            // тут логика для обработки страниц без формы
        }
        // попадаем в условие если на странице есть форма но она не имеет поля телефона
        else if (e.message.match(/name="phone_number"]"}$/mg)) {
            console.log('site not have name phone_number');
            try {
                // в этом блоке try вводим два поля: email и firstname и выполняем отправку (quantinum)
                console.log('in block for quantinum');

                let firstname = await driver.findElement(By.name('firstname'));
                await firstname.sendKeys(Firstname);

                let email = await driver.findElement(By.name('email'));
                await email.sendKeys(Email, Key.ENTER);
   
                driver.sleep(5000);
            
                let lastname = await driver.findElement(By.name('lastname'));
                await lastname.sendKeys(Lastname);
            
                let tel = await driver.findElement(By.name('phone_number'));
                await tel.sendKeys(Tel, Key.ENTER);

                checkLastUrl(driver, logger, URL);
            } catch (e) {
                // попадаем в этот блок если на странице только 1 поле для email (adcode)
                if (e.message.match(/name="firstname"]"}$/mg)) {

                    console.log('in block for adcode');

                    let email = await driver.findElement(By.name('email'));
                    await email.sendKeys(Email, Key.ENTER);

                    driver.sleep(10000);

                    let firstname = await driver.findElement(By.id('first_name'));
                    //*[@id="first_name"]
                    await firstname.sendKeys(Firstname);
                
                    let lastname = await driver.findElement(By.id('last_name'));
                    await lastname.sendKeys(Lastname);
                
                    let tel = await driver.findElement(By.id('phone'));
                    await tel.sendKeys(Tel, Key.ENTER);

                    checkLastUrl(driver, logger, URL);
                } else {
                    console.log(e);
                    logger.log({
                        level: 'error',
                        message: e.message
                    });
                }
            }
        } else {
            console.log(e);
            logger.log({
                level: 'error',
                message: e.message
            });
        }
           
    } finally {
        await driver.quit();
    }
}

async function checkLastUrl(driver, logger, URL) {
    let currentUrl = await driver.getCurrentUrl();
    if (await currentUrl.match(/thanks.php$/)) console.log('Test send form done', URL);
    else {
        logger.log({
            level: 'error',
            message: 'Test send form failed'
        });
    }
}

checkSend('https://paettearon.info/');

module.exports.checkSend = checkSend;