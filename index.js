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

(async () => {
  const { closeEmulator, getPageInfo } = await emulator();
  // const pages = uiks;
  const pages = uiks.filter((_value, index) => index <= 3);
  const names = {};
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
        names[index] = names[index] ? [...names[index], name] : [name];
        const r = worksheet.getRow(row);
        r.getCell(index + 1).value = value;
      });
      contents.push(content);
      await fsp.writeFile(filename, JSON.stringify(content), 'utf-8');
    }
    if (tikInfo.error) {
      pages.push(page);
    }
  }
  await workbook.xlsx.writeFile('filename.xlsx');
  console.log('names', names);
  console.log('contents', contents);
  await closeEmulator();
})();
