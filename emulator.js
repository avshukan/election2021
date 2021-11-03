const fs = require('fs');
const { resolve } = require('path');
const now = require('performance-now');
const puppeteer = require('puppeteer');
// const { promisesAllByGroup } = require('./promisesAllByGroup');

const emulator = async () => {
  const result = [];
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });

  async function closeEmulator() {
    await browser.close();
    console.log('emulator closed');
  }

  async function hasCaptcha(page) {
    return await page.$('#captchaImg');
  }

  async function solveCaptcha(page) {
    const text = await page.evaluate(async () => {
      const { default: { recognize } } = await import('https://esm.sh/tesseract.js');
      const captcha = document.getElementById('captchaImg');
      const recoginized = await recognize(captcha)
        .then((image) => image.data.text)
        .then((text) => text);
      console.log('recoginized', recoginized);
      return recoginized;
    });
    console.log('text', text);
    if (!text) {
      return text;
    }
    const pass = text.replace(/\s/g, '').replace(/s/g, '6').slice(0, 5);
    console.log('pass', pass);
    await page.type('#captcha', pass);
    await page.click('#send');
    const p = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await Promise.race([
      page.waitForNavigation(),
      p(1000).then(() => page.waitForSelector('#captchaRes:not(:empty)')),
    ]);
  }

  async function getPageInfo(url) {
    console.log('============');
    console.log(url);
    const start = now();
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });
    try {
      console.log(`try ${url} ...`);
      await page.goto(url, { waitUntil: 'networkidle2' });
      let hasCaptchaFlag = await hasCaptcha(page);
      let counter = 0;
      while (hasCaptchaFlag) {
        counter += 1;
        console.log('counter', counter);
        await solveCaptcha(page);
        hasCaptchaFlag = await hasCaptcha(page);
      }
      return { payload: 1 };
      const element = await page.evaluate(async () => {
        const { default: capture } = await import('https://esm.sh/html2canvas');
        const { default: { recognize } } = await import('https://esm.sh/tesseract.js');
        const rows = [...document.querySelectorAll('.table-responsive tr')];
        // for (const row of rows) {
        //   // for (const row of [rows[0], rows[2], rows[22]]) {
        //   const source = row.children[2];
        //   const image = await capture(source, { imageTimeout: 1 });
        //   // console.log( `%c `, `font-size:1px;padding: ${image.height/2}px ${image.width/2}px; background: url(${ image.toDataURL() })` );
        //   const { data: { text } } = await recognize(image);
        //   console.log( text );
        //   const values = text.split(/\n/g).filter(Boolean);
        //   const name = row.children[1].textContent.split('.').filter((v, i, a) => (i !== 0) || (i === a.length - 1)).join('').trim();
        //   const value = values[0];
        //   result.push([name, value]);
        // }

        // const promises = rows
        // .filter((value, index) => index < 9)
        // .map((row, index) => new Promise(async (resolve, reject) => {
        //   try {
        //     const source = row.children[2];
        //     const image = await capture(source, { imageTimeout: 1 });
        //     // console.log( `%c `, `font-size:1px;padding: ${image.height/2}px ${image.width/2}px; background: url(${ image.toDataURL() })` );
        //     const { data: { text } } = await recognize(image);
        //     console.log( text );
        //     const values = text.split(/\n/g).filter(Boolean);
        //     const name = row.children[1].textContent.split('.').filter((v, i, a) => (i !== 0) || (i === a.length - 1)).join('').trim();
        //     const value = values[0];
        //     result.push([index, name, value]);
        //     resolve();
        //     return [index, name, value];
        //   } catch(error) {
        //     console.log(error);
        //     reject();
        //   }
        // }));
        const promisesAllByGroup = (array, promiseFunction, size = 1) => {
          console.log('in promisesAllByGroup');
          const data = [];
          const groupedPromises = array
            .reduce((result, value, index, arr) => {
              console.log('start', index);
              console.log('result', result);
              if ((result.length === size) || (index + 1 == arr.length)) {
                data.push(Promise.all([...result, promiseFunction(value, index)]));
                return [];
              }
              return [...result, promiseFunction(value, index)];
            },
            []);
          return data;
        };

        const getRowData = (row, index) => capture(row.children[2], { imageTimeout: 1 })
          .then((image) => recognize(image))
          .then((recognized) => recognized.data.text)
          .then((text) => {
            console.log(text);
            const values = text.split(/\n/g).filter(Boolean);
            const name = row.children[1].textContent.split('.').filter((v, i, a) => (i !== 0) || (i === a.length - 1)).join('').trim();
            const value = values[0];
            console.log({ index, name, value });
            return { index, name, value };
          })
          .catch((error) => {
            console.log(error);
            throw new Error(error);
          });

        console.log('before');
        console.log('promisesAllByGroup', promisesAllByGroup);
        // const promises = promisesAllByGroup(rows, getRowData, 6);
        const promises = promisesAllByGroup(rows.filter((_value, index) => index < 1), getRowData, 6);
        console.log('after');
        console.log(promises);
        const x = [];
        for (const p of promises) {
          try {
            const bla = await p;
            console.log('bla', bla);
            x.push(...bla);
          } catch (e) {
            console.log('e', e);
          }
        }
        // const all = await Promise.all(promises);
        // const all = await promises;
        return x;
      });
      console.log('element', element);
      const end = now();
      console.log('Готово! Время выполнения = ', (end - start).toFixed(3), start.toFixed(3), end.toFixed(3));
      return {
        status: 'SUCCESS',
        payload: element,
      };
    } catch (error) {
      const end = now();
      console.log('Ошибка! Время ожидания = ', (end - start).toFixed(3), start.toFixed(3), end.toFixed(3));
      console.error(error);
      return {
        status: 'ERROR',
        error,
      };
    } finally {
      // page.close();
    }
  }

  async function getResult() {
    return result;
  }

  return {
    closeEmulator,
    getPageInfo,
    getResult,
  };
};

module.exports = emulator;
