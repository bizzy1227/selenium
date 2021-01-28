const fs = require("fs");

const sendModule = require('./send_form/send_module_3');
const webErrorsModule = require('./web_errors/web_errors_module');
const lighthouseModule = require('./lighthouse/lighthouse_module');
const deviceSettings = require('./devices');
const parseNeogara = require('./parsers/neogaraParser');
const countries = ['PL', 'UA', 'RU', 'EN', 'GR', 'GB', 'HR', 'HU', 'HK', 'PH', 'ZA', 'IT', 'ES', 'FR', 'NL', 'CH', 'CA', 'CZ', 'SK', 'KR', 'SI', 'SG', 'DE', 'TR', 'AE', 'IS', 'AU', 'BE', 'GB', 'HK', 'FI', 'NL', 'NO', 'NZ', 'CH', 'CA', 'SE', 'DK', 'DE', 'AU', 'AT', 'IE'];

let myArgs = String(process.argv.slice(2));
myArgs = myArgs.split(',');

// проверка установлен ли флаг на работу с thanks.php
let processThanksPage = false;
if (myArgs.includes('--with-thanks')) processThanksPage = true;

// проверка установлен ли флаг на быструю работу
let fastMode = false;
if (myArgs.includes('--fast')) fastMode = true;

// первый параметр должен быть код страны для проверки
let testCountry = false;
if (countries.includes(myArgs[0])) testCountry = myArgs[0];

let startDate;
let sendFormErrors = [];
const promises = [];
let lastResultObj = {};
let additionalСhecks = 1;

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
  startDate = new Date().toISOString();
  console.log(startDate);
  
  for (let i of siteQuery) {
    let inputURL = '';
    // проверка на домен и если надо добавляем https://
    if (i.match(/^https:\/\//)) inputURL = i;
    else inputURL = 'https://' + i;
  
    let nodeUrl = new URL(inputURL);

    promises.push(processSite(nodeUrl));
    // await sleep();
  }

  const result = await Promise.all(promises);
  let neogaraRes = await checkNeogara(startDate);
  if (Object.keys(lastResultObj).length !== 0) console.log('Has Errors send form', lastResultObj);
  else console.log('Test send form done', lastResultObj);

})();


async function processSite(nodeUrl) {


  // console.log('input', nodeUrl);
  // console.log('host', nodeUrl.host);
  // console.log('hostname', nodeUrl.hostname);
  // console.log('href', nodeUrl.href);
  // console.log('pathname', nodeUrl.pathname);
  // throw Error('stop');

  // добавляем в очередь страницу thanks.php если был установлен флаг --with-thanks
  // if (processThanksPage) {
  //     webErrorsModule.processUrl(`${URL}thanks.php`, fastMode);
  //     await sleep();
  // }
  // webErrorsModule.processUrl(URL, fastMode);
  // lighthouseModule.checkLighthouse(URL);
  // второй необязательный параметр указывает на каком девайсе запустить тест (по дефолту тест начнется локально с запуском браузера)

  // const promises = []
  // promises.push(someFunc1())
  // promises.push(someFunc2())
  // promises.push(someFunc3())
  // const result = await Promisses.All(promises)

  // запуск локально для сбора ошибок консоли
  await sendModule.checkSend(nodeUrl, true);

  // запуск для теста формы с определенной страны
  if (testCountry) {
    additionalСhecks++;
    let device = {
      'os_version' : '10',
      'resolution' : '1920x1080',
      'browserName' : 'Chrome',
      'browser_version' : '87.0',
      'os' : 'Windows',
      'name': 'BStack-[NodeJS] Sample Test', // test name
      'build': 'BStack Build Number 1', // CI/CD job or build name
      'browserstack.user' : 'yaroslavsolovev1',
      'browserstack.key' : 'Y5QWsrsNx9pjNdHkZnKN',
      'browserstack.geoLocation': testCountry
     };
     await sendModule.checkSend(nodeUrl, false, device);
  } 

  // запуск для теста формы для разных девайсов
  for (let device of deviceSettings.DEVICES) {
    await sendModule.checkSend(nodeUrl, false, device);
  }

  // await checkNeogara(startDate, nodeUrl);
}

function sleep() {
    return new Promise(resolve => setTimeout(resolve, getDelay()));
}

function getDelay() {
    if (fastMode) return 1000;
    else return 10000;
}

// checkNeogara для работы с сайтами в каждой итерации
// async function checkNeogara(startDate, Url) {
//   const neogararesults = await parseNeogara.NeogaraGetConversions(startDate);

//   console.log('neogararesults', neogararesults);

//   console.log('in checkNeogara');
//   let lastResultObj = {};
//   lastResultObj[Url.host] = [];

//   console.log('empty', lastResultObj);

//   for (let ngIndex of neogararesults) {
//     let neogaraUrl = new URL(ngIndex.ref);
//     if (neogaraUrl.host === Url.host && ngIndex.email === 'testmail5@gmail.com') {
//       lastResultObj[Url.href].push(ngIndex);
//     }
//   }

//   console.log('after push', lastResultObj);

//   if (lastResultObj[Url.href].length === deviceSettings.DEVICES.length + 1) {
//     delete lastResultObj[Url.href];
//   }

//   console.log('after deleted', lastResultObj);

//   if (Object.keys(lastResultObj).length !== 0) sendFormErrors.push(lastResultObj);

// }

// checkNeogara для работы с сайтами после всех итераций
async function checkNeogara(startDate) {
  console.log('in checkNeogara', startDate);
  
  const neogararesults = await parseNeogara.NeogaraGetConversions(startDate);
  console.log('neogararesults', typeof neogararesults);
  // console.log(siteQuery);
  
  for (let sqIndex of siteQuery) {
    lastResultObj[sqIndex] = [];
  }

  console.log('lastResultObj empty: ', lastResultObj);
  console.log('teeeest', neogararesults);
  
  let count = neogararesults[0].totals.count;
  let total = neogararesults[0].totals.total;
  // добавляем +1 для следующего запроса
  let page = neogararesults[0].totals.page + 1;
  let pageCount = neogararesults[0].totals.pageCount;


  // console.log('siteQuery.length:', siteQuery.length);
  // console.log('deviceSettings.DEVICES.length:', deviceSettings.DEVICES.length);
  // console.log('additionalСhecks:', additionalСhecks);
  // console.log('total:', total);
  // console.log('count:', count);
  // console.log('page:', page);
  // console.log('pageCount:', pageCount);
  // console.log('res:', siteQuery.length * (deviceSettings.DEVICES.length + additionalСhecks));
  
  // возвращаемся из функции если совпало количество конверсий с количеством запросов
  if (total === siteQuery.length * (deviceSettings.DEVICES.length + additionalСhecks)) {
    console.log('better outcome condition');
    lastResultObj = {};
    return lastResultObj;
  }  

  let allConversions = [];
  // пушим сразу первые данные
  // allConversions.push(neogararesults);
  neogararesults.forEach(conv => allConversions.push(conv));

  console.log('first push convi', allConversions);
  

  // пушим следующие конверсии в массив
  if(pageCount > 1) {
    for (page; page <= pageCount; page++) {
      let newConvs = await parseNeogara.NeogaraGetConversions(startDate, page);
      await newConvs.forEach(conv => allConversions.push(conv));
    }
  }

  console.log('all allConversions', allConversions);
  

  for (let conversion of allConversions) {
    let convNodeUrl = new URL(conversion.ref);
    for (let sqIndex of siteQuery) {
      let queryNodeUrl = new URL(sqIndex);
      if (convNodeUrl.host === queryNodeUrl.host && conversion.email === 'testmail5@gmail.com') {
        lastResultObj[sqIndex].push(conversion);
      }
    }
  }

  console.log('lastResultObj before check: ', lastResultObj);

  // в конце удаляем те сайты, которые имеют в себе лидов ровно столько сколько было отправлено форм
  // если лидо не ровно - какая-то отправка сфейлилась
  for (let key in lastResultObj) {
    if (lastResultObj[key].length === deviceSettings.DEVICES.length + additionalСhecks) {
      delete lastResultObj[key];
    }
  }

  console.log('lastResultObj after delete: ', lastResultObj);

  // if (Object.keys(lastResultObj).length !== 0) sendFormErrors.push(lastResultObj);
  // if (Object.keys(lastResultObj).length !== 0) {

  //   console.log('Has Errors send form');
  // } 
}

// 'browserstack.user' : 'yaroslavsolovev1',
// 'browserstack.key' : 'Y5QWsrsNx9pjNdHkZnKN'