// import tiks from './tiks.json';

const DOTENV_OPTIONS = {};
const { DOTENV_CONFIG_PATH } = process.env;
if (DOTENV_CONFIG_PATH != null) DOTENV_OPTIONS.path = DOTENV_CONFIG_PATH;
require('dotenv').config(DOTENV_OPTIONS);
const puppeteer = require('puppeteer');
const excel = require('exceljs');
const fsp = require('fs/promises');
const { resolve } = require('path');

const host = 'http://www.sakhalin.vybory.izbirkom.ru/region/sakhalin/?action=ik&vrn=';
const startId = '2652000608962';

const getIds = async (browser) => {
  const startUrl = `${host}${startId}`;
  const page = await browser.newPage();
  await page.goto(startUrl, { waitUntil: 'networkidle2' });
  const tikIds = await page.$$eval(`[id="${startId}"] ul li`, (el) => el.map((x) => x.getAttribute('id')));
  // tikIds.forEach(async (tik) => {
  //   try {
  //     await page.$$eval(`[id="${tik}"] i`, (el) => el[0].click());
  //     await page.waitForSelector(`li [id="${tik}"][aria-expanded="true"]`);
  //   } catch (e) {
  //     console.log(`tik ${tik} expanded-error`);
  //   }
  // });
  const chain = tikIds.reduce((acc, value) => acc
    .then(async () => {
      await page.$$eval(`[id="${value}"] i`, (el) => el[0].click());
      await page.waitForSelector(`li [id="${value}"][aria-expanded="true"]`);
    })
    .catch(() => console.log(`tik ${value} expanded-error`)), Promise.resolve([]));
  await chain;
  const ids = await page.$$eval('li.jstree-node', (el) => el.map((x) => x.getAttribute('id')));
  page.close();
  return ids;
};

const getAddresses = async (browser) => {
  const ids = await getIds(browser);
  console.log('ids', ids);
  return ids;
};

(async () => {
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
  const result = await getAddresses(browser);
  console.log('result', result);
  browser.close();
})();
