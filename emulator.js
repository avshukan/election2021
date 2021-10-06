const fs = require('fs');
const now = require('performance-now');
const puppeteer = require('puppeteer');

const emulator = async () => {
  const result = [];
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });

  async function closeEmulator() {
    await browser.close();
    console.log('emulator closed');
  }

  async function getPageInfo(url) {
    console.log('============');
    console.log(url);
    const start = now();
    try {
      console.log('try...');
      await page.goto(url, { waitUntil: 'networkidle2' });
      const data = [];
      const element = await page.evaluate(async () => {
        const { default: capture } = await import('https://esm.sh/html2canvas');
        const { default: { recognize } } = await import('https://esm.sh/tesseract.js');
        const rows = document.querySelectorAll('.table-responsive tr');
        const result = [];
        for (const row of [rows[0], rows[2], rows[22]]) {
          const source = row.children[2];
          const image = await capture(source, { imageTimeout: 1 });
          // console.log( `%c `, `font-size:1px;padding: ${image.height/2}px ${image.width/2}px; background: url(${ image.toDataURL() })` );
          const { data: { text } } = await recognize(image);
          // console.log( text );
          const values = text.split(/\n/g).filter(Boolean);
          const name = row.children[1].textContent.split('.').filter((v, i, a) => (i !== 0) || (i === a.length - 1)).join('').trim();
          const value = values[0];
          result.push([name, value]);
        }
        console.table(result);
        return result;
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
      return {
        status: 'ERROR',
        error,
      };
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
