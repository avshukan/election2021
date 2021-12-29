// import tiks from './tiks.json';

const DOTENV_OPTIONS = {};
const { DOTENV_CONFIG_PATH } = process.env;
if (DOTENV_CONFIG_PATH != null) DOTENV_OPTIONS.path = DOTENV_CONFIG_PATH;
require('dotenv').config(DOTENV_OPTIONS);
const excel = require('exceljs');
const fsp = require('fs/promises');
const tiks = require('./tiks.json');
const uiks = require('./uiks.json');
const emulator = require('./emulator');

const host = 'http://www.vybory.izbirkom.ru';

const getMode = (array) => {
  const frequency = {}; // array of frequency.
  let maxFrequency = 0; // holds the max frequency.
  let mode = null;
  console.log('array', array);
  // for (const i in array) {
  array.forEach((item) => {
    frequency[item] = (frequency[item] || 0) + 1; // increment frequency.
    if (frequency[item] > maxFrequency) { // is this frequency > max so far ?
      maxFrequency = frequency[item]; // update max.
      mode = item; // update result.
    }
  });
  return mode;
};

const printRow = (row, page, info) => {
  const side = Object.keys(page).sort();
  console.log('side', side);
  side.forEach((item, index) => {
    row.getCell(index + 1).value = page[item];
  });
  info.payload.forEach(({ index, _name, value }) => {
    console.log('index + side.length + 1', +index + +side.length + 1);
    row.getCell(+index + +side.length + 1).value = value;
  });
};

(async () => {
  const { closeEmulator, getPageInfo } = await emulator();
  const pages = uiks;
  // const pages = uiks.filter((_value, index) => index <= 2);
  const allNames = {};
  const contents = [];
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet('sheet');
  let row = 1;
  while (pages.length > 0) {
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    const page = pages.shift();
    const filename = `uik_${page.uikName.split('№')[1]}.json`;
    const url = `${host}/${page.uikHref}`;
    const tikInfo = await getPageInfo(url);
    if (tikInfo.payload) {
      row += 1;
      console.log('payload', tikInfo.payload);
      const content = { ...page };
      tikInfo.payload.forEach(({ index, name, value }) => {
        content[index] = value;
        allNames[index] = allNames[index] ? [...allNames[index], name] : [name];
      });
      printRow(worksheet.getRow(row), page, tikInfo);
      contents.push(content);
      await fsp.writeFile(`files/${filename}`, JSON.stringify(content), 'utf-8');
    }
    if (tikInfo.error) {
      pages.push(page);
    }
  }
  // console.log('allNames', allNames);
  // const names = [];
  // Object.entries(allNames).forEach(([key, value]) => {
  //   names[key] = {
  //     index: key,
  //     name: '',
  //     value: getMode(value),
  //   };
  // });
  // console.log('names', names);
  // await fsp.writeFile('files/names.json', JSON.stringify(names), 'utf-8');
  // const pageNames = {
  //   tikName: 'ТИК',
  //   tikHref: 'Ссылка на ТИК',
  //   uikName: 'УИК',
  //   uikHref: 'Ссылка на УИК',
  // };
  // printRow(worksheet.getRow(1), pageNames, names);
  await workbook.xlsx.writeFile('files/filename.xlsx');
  // console.log('contents', contents);
  await closeEmulator();
})();
