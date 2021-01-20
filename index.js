const fs = require("fs");

const sendModule = require('./send_form/send_module_3');
const webErrorsModule = require('./web_errors/web_errors_module');
const lighthouseModule = require('./lighthouse/lighthouse_module');

let myArgs = String(process.argv.slice(2));
myArgs = myArgs.split(',');

// проверка установлен ли флаг на работу с thanks.php
let processThanksPage = false;
if (myArgs.includes('--with-thanks')) processThanksPage = true;

// проверка установлен ли флаг на быструю работу
let fastMode = false;
if (myArgs.includes('--fast')) fastMode = true;

// получаем список сайтов
let siteQuery = fs.readFileSync("./input.txt", "utf8");
siteQuery = siteQuery.replace(/\r/g, '');
siteQuery = siteQuery.split('\n');

(async function run() {
  for (let i of siteQuery) {
    let URL = '';
    // проверка на домен и если надо добавляем https://
    if (i.match(/^https:\/\//)) URL = i;
    else URL = 'https://' + i + '/';
  
    // добавляем в очередь страницу thanks.php если был установлен флаг --with-thanks
    if (processThanksPage) {
        webErrorsModule.processUrl(`${URL}thanks.php`, fastMode);
        await sleep();
    }
    // webErrorsModule.processUrl(URL, fastMode);
    lighthouseModule.checkLighthouse(URL);
    sendModule.checkSend(URL);
    await sleep();
  }
})();

function sleep() {
    return new Promise(resolve => setTimeout(resolve, getDelay()));
}

function getDelay() {
    if (fastMode) return 1000;
    else return 10000;
}