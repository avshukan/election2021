// import tiks from './tiks.json';

const DOTENV_OPTIONS = {};
const { DOTENV_CONFIG_PATH } = process.env;
if (DOTENV_CONFIG_PATH != null) DOTENV_OPTIONS.path = DOTENV_CONFIG_PATH;
require('dotenv').config(DOTENV_OPTIONS);
const tiks = require('./tiks.json');
const uiks = require('./uiks.json');
const emulator = require('./emulator');
const host = 'http://www.vybory.izbirkom.ru';

(async () => {
    const { closeEmulator, getPageInfo, getResult } = await emulator();
    uiks
        // .filter(({ index }) => index === 0)
        .filter((value, index) => index === 0)
        .forEach(async (value) => {
            const url = `${host}/${value.tikHref}`;
            console.log(url);
            await getPageInfo(url);
            const result = await getResult();
            console.log('result', result);
        });
    // await closeEmulator();
})();
