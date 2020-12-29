const {Builder, By, Key, until} = require('selenium-webdriver');
const fs = require("fs");
const winston = require('winston');
const chrome = require('selenium-webdriver/chrome');

let Firstname = 'testUser1';
let Lastname = 'testUser1';
let Email = 'dqwdsadsad@gmail.com';
let Tel = '639987425';

const send = async function(URL) {
    let driver = await new Builder().forBrowser('chrome')
    .setChromeOptions(new chrome.Options().addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors']))
    .build();
    try {
        await driver.get(URL);
        driver.sleep(10000);

        // let tel = await driver.findElement(By.name('phone_number'));
        // console.log(tel);

        if (await driver.findElement(By.id('email'))) {
            let email = driver.findElement(By.id('email'));
            await email.sendKeys(Email, Key.ENTER);
    
            let firstname = driver.findElement(By.id('first_name'));
            await firstname.sendKeys(Firstname, Key.ENTER);
    
            let lastname = driver.findElement(By.id('last_name'));
            await lastname.sendKeys(Lastname, Key.ENTER);
    
            let tel = driver.findElement(By.id('phone'));
            await tel.sendKeys(Tel, Key.ENTER);

            console.log('one move: ', await driver.getCurrentUrl());
        }

        else  {
            let email = await driver.findElement(By.name('email'));
            await email.sendKeys(Email, Key.ENTER);
            email = await driver.findElement(By.id('email'));

            // if  (email.getAttribute('value') !== Email) throw Error('Not saved Email');

            let firstname = driver.findElement(By.id('first_name'));
            await firstname.sendKeys(Firstname, Key.ENTER);
    
            let lastname = driver.findElement(By.id('last_name'));
            await lastname.sendKeys(Lastname, Key.ENTER);
    
            let tel = driver.findElement(By.id('phone'));
            await tel.sendKeys(Tel, Key.ENTER);

            console.log('double move: ', await driver.getCurrentUrl());
        }

        



        // email = await driver.findElement(By.name('email'));
        // console.log('email value from send_module: ', await email.getAttribute('value'));
       
        // return;
    } catch (e) {
        console.log(e);
    } finally {
        await driver.quit();
    }
}

send('https://adsozcrcode.info/');

module.exports.send = send;