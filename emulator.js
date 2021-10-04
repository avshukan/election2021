const now = require('performance-now');
const puppeteer = require('puppeteer');

const emulator = async () => {
    const result = [];
    const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
    // const browser = await puppeteer.launch({ headless: false,
    //     args: [
    //         '--disable-gpu',
    //         '--disable-dev-shm-usage',
    //         '--disable-setuid-sandbox',
    //         '--no-first-run',
    //         '--no-sandbox',
    //         '--no-zygote',
    //         '--deterministic-fetch',
    //         '--disable-features=IsolateOrigins',
    //         '--disable-site-isolation-trials',
    //         // '--single-process',
    //     ],
    // });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });
    // await page.setViewport({defaultViewport: null});

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
            await (async ()=> {
                const { default: capture } = await import( 'https://esm.sh/html2canvas' );
                const { default: { recognize } } = await import( 'https://esm.sh/tesseract.js' );
                // const rows = document.querySelectorAll('.table-responsive tr');
                // const rows = await page.$$('table#tablcont tr');
                // const rows = await page.$$('.table-responsive tr');
                const rows = await page.$$eval('.table-responsive tr');
                // const rows = await trs[i].$$eval('td', (nodes) => nodes.map((n) => ({
                //     innerText: n.innerText,
                //     innerHTML: n.innerHTML,
                //     outerHTML: n.outerHTML,
                //     textContent: n.textContent,
                // })));
                // for( const row of rows ) {
                    const row = rows[0];
                    const source = row.children[2];
                    const image = await capture( source, { imageTimeout: 1 } )
                    console.log( `%c `, `font-size:1px;padding: ${image.height/2}px ${image.width/2}px; background: url(${ image.toDataURL() })` );
                    const { data: { text } } = await recognize( image );
                    console.log( text );
                    const values = text.split( /\n/g ).filter( Boolean );
                    data.push([ row.children[1].textContent, ... values ]);
                // }
                // console.table( result )
            })();

            const end = now();
            console.log('Готово! Время выполнения = ', (end - start).toFixed(3), start.toFixed(3), end.toFixed(3));
            result.push({
                status: 'SUCCESS',
                payload: data,
            });
        } catch (error) {
            const end = now();
            console.log('Ошибка! Время ожидания = ', (end - start).toFixed(3), start.toFixed(3), end.toFixed(3));
            result.push({
                status: 'ERROR',
                error,
            });
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
