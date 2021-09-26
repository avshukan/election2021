// import tiks from './tiks.json';

const DOTENV_OPTIONS = {};
const { DOTENV_CONFIG_PATH } = process.env;
if (DOTENV_CONFIG_PATH != null) DOTENV_OPTIONS.path = DOTENV_CONFIG_PATH;
require('dotenv').config(DOTENV_OPTIONS);
const tiks = require('./tiks.json');
const uiks = require('./uiks.json');
const emulator = require('./emulator');

(async () => {
    const { closeEmulator, handlePagesQueue } = await emulator();
    const result = [];
    uiks
        // .filter(({ index }) => index === 0)
        .filter((value, index) => index === 0)
        .forEach((value) => {
            console.log(value);
        });
    await closeEmulator();
})();
