const now = require('performance-now');
const puppeteer = require('puppeteer');

const emulator = async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1024,
        height: 768,
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
            await page.goto(url, { waitUntil: 'networkidle2' });
            const end = now();
            console.log('Готово! Время выполнения = ', (end - start).toFixed(3), start.toFixed(3), end.toFixed(3));
            // ...
            return {
                status: 'SUCCESS',
                payload: '',
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

    return { closeEmulator, getPageInfo };
};

module.exports = emulator;
