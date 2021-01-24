const fs = require("fs");

const sendModule = require('./send_form/send_module_3');
const webErrorsModule = require('./web_errors/web_errors_module');
const lighthouseModule = require('./lighthouse/lighthouse_module');
const deviceSettings = require('./devices');
const parseNeogara = require('./parsers/neogaraParser');

let myArgs = String(process.argv.slice(2));
myArgs = myArgs.split(',');

// проверка установлен ли флаг на работу с thanks.php
let processThanksPage = false;
if (myArgs.includes('--with-thanks')) processThanksPage = true;

// проверка установлен ли флаг на быструю работу
let fastMode = false;
if (myArgs.includes('--fast')) fastMode = true;

let startDate;

// получаем список сайтов
let siteQuery = fs.readFileSync("./input.txt", "utf8");
siteQuery = siteQuery.replace(/\r/g, '');
siteQuery = siteQuery.split('\n');

(async function run() {
  // настрока времени старта
  // Date.prototype.addHours = function(h) {
  //   this.setTime(this.getTime() + (h*60*60*1000));
  //   return this;
  // }
  // startDate = new Date().addHours(2).toISOString();
  
  
  
  
  
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
    // lighthouseModule.checkLighthouse(URL);
    // второй необязательный параметр указывает на каком девайсе запустить тест (по дефолту тест начнется локально с запуском браузера)

    await sendModule.checkSend(URL, true);
    // await sendModule.checkSend(URL, false, deviceSettings.DEVICES[0]);
    for (let device of deviceSettings.DEVICES) {
      await sendModule.checkSend(URL, false, device);
    }
    // await sleep();
  }
  await checkNeogara(startDate);

})();

function sleep() {
    return new Promise(resolve => setTimeout(resolve, getDelay()));
}

function getDelay() {
    if (fastMode) return 1000;
    else return 10000;
}

async function checkNeogara(startDate) {
  console.log('in checkNeogara');
  
  const neogararesults = await parseNeogara.NeogaraGetConversions(startDate);
  // console.log(neogararesults);
  // console.log(siteQuery);
  let lastResultObj = {};

  // создаю поля для каждого сайта из списка
  for (let sqIndex of siteQuery) {
    lastResultObj[sqIndex] = [];
  }
  console.log('lastResultObj empty: ', lastResultObj);
  // для каждого пришедшего мыла с неогары подбираем сайт из нашего списка
  // при совпадении пушим инфу о лиде под соответствующий сайт
  for (let ngIndex of neogararesults) {
    for (let sqIndex of siteQuery) {
      if (ngIndex.ref.indexOf(sqIndex) !== -1 && ngIndex.email === 'testmail4@gmail.com') {
        lastResultObj[sqIndex].push(ngIndex);
      }
    }
  }
  console.log('lastResultObj before check: ', lastResultObj);
  // в конце удаляем те сайты, которые имеют в себе лидов ровно столько сколько было отправлено форм
  // если лидо не ровно - какая-то отправка сфейлилась
  for (let key in lastResultObj) {
    if (lastResultObj[key].length === deviceSettings.DEVICES.length + 1) {
      delete lastResultObj[key];
    }
  }
  console.log('lastResultObj after check: ', lastResultObj);
  if (Object.keys(lastResultObj).length !== 0) console.log('Has Errors send form');
}

// 'browserstack.user' : 'yaroslavsolovev1',
// 'browserstack.key' : 'Y5QWsrsNx9pjNdHkZnKN'