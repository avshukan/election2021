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
  uiks
    // .filter(({ index }) => index === 0)
    .filter((value, index) => index <= 2)
    .forEach(async (value) => {
      const filename = `uik_${value.uikName.split('№')[1]}.json`;
      const url = `${host}/${value.tikHref}`;
      console.log(url);
      const tikInfo = await getPageInfo(url);
      const content = { ...value, ...tikInfo.payload };
      await fsp.writeFile(filename, JSON.stringify(content), 'utf-8');
    });
  // await closeEmulator();
})();
