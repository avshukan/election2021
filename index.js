// import tiks from './tiks.json';

const DOTENV_OPTIONS = {};
const { DOTENV_CONFIG_PATH } = process.env;
if (DOTENV_CONFIG_PATH != null) DOTENV_OPTIONS.path = DOTENV_CONFIG_PATH;
require('dotenv').config(DOTENV_OPTIONS);
const fsp = require('fs/promises');
const tiks = require('./tiks.json');
const uiks = require('./uiks.json');
const emulator = require('./emulator');

const host = 'http://www.vybory.izbirkom.ru';

(async () => {
  const { closeEmulator, getPageInfo, getResult } = await emulator();
  const pages = uiks.filter((value, index) => index <= 5);

  for (let i = 0; i < pages.length; i += 1) {
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log(i);
    const page = pages[i];
    const filename = `uik_${page.uikName.split('№')[1]}.json`;
    const url = `${host}/${page.uikHref}`;
    const tikInfo = await getPageInfo(url);
    const content = { ...page, ...tikInfo.payload };
    await fsp.writeFile(filename, JSON.stringify(content), 'utf-8');
  }
  // await closeEmulator();
})();
