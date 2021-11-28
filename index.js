const express = require('express')
const app = express()
const gis = require('g-i-s')
const tiktok = require('tiktok-scraper')
const cheerio = require('cheerio')
const FormData = require('form-data')
const { exec } = require('child_process')
const yts = require('yt-search')
const { neodl } = require('./lib/neonime-link')
const { ytdl } = require('./lib/ytdl')
const { getApk, getApkReal, searchApk, sizer } = require('./lib/apk')
const { default: Axios } = require('axios')
const PORT = process.env.PORT || 7000;

try {

    String.prototype.toReal = function () {
        var sec_num = parseInt(this, 10); // don't forget the second param
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        return hours + ':' + minutes + ':' + seconds;
    }

    app.get('/neonime', (req, res) => {
        res.header("Content-Type", 'application/json');
        try {
            if (req.query.urldl != null) {
                neodl(req.query.urldl).then((result) => {
                    res.send(JSON.stringify({
                        status: "true",
                        message: "Scraping By Nafizz.",
                        link: result
                    }, null, 3))
                })
            } else {
                Axios.get('https://disqus.com/api/3.0/discovery/listRecommendations.json?forum=https-neonime-com&limit=24&api_key=E8Uh5l5fHZ6gD8U3KycjAIAk46f68Zw7C6eW8WSjZvCLXebZ7p0r1yrYDrLilk2F')
                    .then(({ data }) => {
                        // res.send(data)
                        let result = []
                        for (let i = 0; i < data.response.length; i++) {
                            const input = data.response[i]
                            result.push({
                                id: input.id,
                                judul: input.title,
                                deskripsi: input.description,
                                thumb: 'https:' + input.images[0].url,
                                createdAt: input.createdAt,
                                jumlah_post: input.posts,
                                url: input.url
                            })
                        }
                        res.send(JSON.stringify({
                            status: "true",
                            message: "Scraping By Nafizz.",
                            result: result
                        }, null, 2))
                    }).catch((e) => {
                        console.log(e)
                        res.send({
                            status: "false",
                            message: "Scraping By Nafizz.",
                        })
                    })
            }


        } catch (error) {
            console.error(error)
            res.send({
                status: "false",
                message: "Scraping By Nafizz.",
            })
        }

    })

    app.use('/ytmp4', (req, res) => {
        res.header("Content-Type", 'application/json');
        if (!req.query.resolution) {
            res.send(JSON.stringify({
                status: false,
                message: 'Created By MRHRTZ',
                handle: 'Please use /ytmp4?resolution=360&url=https://www.youtube.com/watch?v=kXtaWkP08U4 params!'
            }, null, 3))
        } else if (!req.query.url) {
            res.send(JSON.stringify({
                status: false,
                message: 'Created By MRHRTZ',
                handle: 'Please use /ytmp4?resolution=360&url=https://www.youtube.com/watch?v=kXtaWkP08U4 params!'
            }, null, 3))
        } else {
            ytdl(req.query.url, 'mp4', req.query.resolution)
            .then((resuslt) => {
                const result = JSON.stringify({
                    status: true,
                    message: 'Created By MRHRTZ',
                    result: resuslt
                }, null, 3)
                res.send(result)
            }).catch(res.send)
        }
    })


    app.use('/ytmp3', (req, res) => {
        res.header("Content-Type", 'application/json');
        if (!req.query.url) {
            res.send(JSON.stringify({
                status: false,
                message: 'Created By MRHRTZ',
                handle: 'Please use /ytmp3url=https://www.youtube.com/watch?v=kXtaWkP08U4 params!'
            }, null, 3))
        } else {
            ytdl(req.query.url, 'mp3', '128')
            .then((resuslt) => {
                const result = JSON.stringify({
                    status: true,
                    message: 'Created By MRHRTZ',
                    result: resuslt
                }, null, 3)
                res.send(result)
            }).catch(res.send)
        }
    })

    app.use('/ytdl', (req, res) => {
        res.header("Content-Type", 'application/json');
        let yat = ytdl.getInfo(`https://www.youtube.com/watch?v=${req.query.id}`)
            .then((howly) => {
                let empefor = howly.formats
                let chose = '360p'
                let resultMp4 = []
                let resultMp3 = []

                for (let i = 0; i < empefor.length; i++) {
                    if (empefor[i].container == 'mp4' && empefor[i].hasVideo == true && empefor[i].hasAudio == true) {
                        let resultga = empefor[i]
                        resultMp4.push({
                            mimetype: resultga.mimeType,
                            quality: resultga.qualityLabel,
                            url: resultga.url
                        })
                    }

                    if (empefor[i].mimeType == 'audio/webm; codecs=\"opus\"') {
                        let resultAud = empefor[i]
                        resultMp3.push({
                            mimetype: resultAud.mimeType,
                            audioBitrate: resultAud.audioBitrate,
                            audioSampleRate: resultAud.audioSampleRate,
                            audioQuality: resultAud.audioQuality,
                            audioBitrate: resultAud.audioBitrate,
                            url: resultAud.url
                        })
                    }
                }

                const tamnel = howly.videoDetails.thumbnail.thumbnails

                res.send(JSON.stringify({
                    status: "true",
                    message: "Scraping By Nafizz.",
                    title: howly.videoDetails.title,
                    published: howly.videoDetails.publishDate,
                    duration: howly.videoDetails.lengthSeconds.toReal(),
                    desc: howly.videoDetails.description.simpleText,
                    author: howly.videoDetails.author,
                    thumb: tamnel[tamnel.length - 1],
                    video: resultMp4,
                    audio: resultMp3
                }, null, 3))
            }).catch((e) => {
                res.send({
                    status: "false",
                    message: "Created by MRHRTZ",
                    Error: "Must be id!"
                })
            })
    })

    app.use('/ytdlurl', (req, res) => {
        res.header("Content-Type", 'application/json');
        let IdYt = ytdl.getURLVideoID(
            req.query.url)
        let yatu = ytdl.getInfo(IdYt)
            .then((howly) => {
                let empefor = howly.formats
                let chose = '360p'
                let resultMp4 = []
                let resultMp3 = []

                for (let i = 0; i < empefor.length; i++) {
                    if (empefor[i].container == 'mp4' && empefor[i].hasVideo == true && empefor[i].hasAudio == true) {
                        let resultga = empefor[i]
                        resultMp4.push({
                            mimetype: resultga.mimeType,
                            quality: resultga.qualityLabel,
                            url: resultga.url
                        })
                    }

                    if (empefor[i].mimeType == 'audio/webm; codecs=\"opus\"') {
                        let resultAud = empefor[i]
                        resultMp3.push({
                            mimetype: resultAud.mimeType,
                            audioBitrate: resultAud.audioBitrate,
                            audioSampleRate: resultAud.audioSampleRate,
                            audioQuality: resultAud.audioQuality,
                            audioBitrate: resultAud.audioBitrate,
                            url: resultAud.url
                        })
                    }
                }

                const tamnel = howly.videoDetails.thumbnail.thumbnails

                res.send(JSON.stringify({
                    status: "true",
                    message: "Scraping By Nafizz.",
                    title: howly.videoDetails.title,
                    published: howly.videoDetails.publishDate,
                    duration: howly.videoDetails.lengthSeconds.toReal(),
                    desc: howly.videoDetails.description.simpleText,
                    author: howly.videoDetails.author,
                    thumb: tamnel[tamnel.length - 1],
                    video: resultMp4,
                    audio: resultMp3
                }, null, 3))
            }).catch((e) => {
                res.send({
                    status: "false",
                    message: "Created by MRHRTZ",
                    Error: "Must be id!"
                })
            })
    })

    app.use('/ytsearch', (req, res) => {
        res.header("Content-Type", 'application/json');
        const query = req.query.q

        yts(query)
            .then((result) => {

                let data = result.all
                let pertype = []

                for (let i = 0; i < data.length; i++) {
                    if (data[i].type == "video") {
                        pertype.push({
                            id: data[i].videoId,
                            type: data[i].type,
                            author: data[i].author.name,
                            title: data[i].title,
                            ago: data[i].ago,
                            views: data[i].views,
                            desc: data[i].description,
                            duration: data[i].duration.seconds,
                            timestamp: data[i].timestamp,
                            thumb: data[i].thumbnail,
                            url: data[i].url
                        })
                    }
                }

                res.send(JSON.stringify({
                    status: "true",
                    message: "Scraping By Nafizz.",
                    result: pertype
                }, null, 3))
            })
            .catch(err => {
                console.error(err)
                res.send({
                    status: "false",
                    message: "Scraping By Nafizz.",
                    error: "Use q params!"
                })
            });
    })

    app.use('/googleimage', (req, res) => {
        res.header("Content-Type", 'application/json');
        const query = req.query.q
        async function ImageSearch(query) {
            return new Promise((resolve, reject) => {
                gis(query, logResults)
                function logResults(error, results) {
                    if (error) {
                        reject(error)
                    }
                    else {
                        let url = []
                        for (let i = 0; i < results.length; i++) {
                            url.push(decodeURIComponent(JSON.parse(`"${results[i].url}"`)))
                        }
                        resolve(url)
                    }
                }
            })
        }


        ImageSearch(query).then(result => {
            res.send(JSON.stringify({
                status: "true",
                message: "Created by MRHRTZ",
                result: result
            }, null, 2))
        }).catch((e) => {
            res.send({
                status: "false",
                message: "Created by MRHRTZ",
                error: e
            })
        })
    })

    app.use('/tiktod', (req, res) => {


        // tiktod.getVideoMeta('https://www.tiktok.com/@ivan_pribadi_/video/6900504178481745154?lang=id')
        // .then((a) => {
        //   console.log(a.collector[0].videoUrl)
        // })
        // const url = 'https://vt.tiktok.com/ZSsY7d9S/'
        try {

            const url = req.query.url

            if (url == '') res.send({
                status: "false",
                message: "Scraping By Nafizz.",
                error: "Use q params!"
            })

            function tiktod(url) {
                return new Promise((resolve, reject) => {
                    try {
                        tiktok.getVideoMeta(url)
                            .then((result) => {
                                const data = result.collector[0]
                                let Tag = []
                                for (let i = 0; i < data.hashtags.length; i++) {
                                    const name = data.hashtags[i].name
                                    Tag.push(name)
                                }
                                // console.log(data)
                                const id = data.id
                                const text = data.text
                                const date = data.createTime
                                const name = data.authorMeta.name
                                const nick = data.authorMeta.nickName
                                const music = data.musicMeta.musicName
                                const thumb = data.imageUrl
                                const hastag = Tag

                                resolve({
                                    id: id,
                                    name: name,
                                    nickname: nick,
                                    timestamp: date,
                                    thumb: thumb,
                                    text: text,
                                    music: music,
                                    hastag: hastag
                                })
                            })
                            .catch(reject)
                    } catch (error) {
                        console.log(error)
                    }
                })
            }

            tiktod(url).then(resul => {
                const metadata = resul
                const exekute = exec('tiktok-scraper video ' + url + ' -d')

                exekute.stdout.on('data', function (data) {
                    const file = { loc: `${data.replace('Video location: ', '').replace('\n', '')}` }
                    const json = {
                        metadata,
                        file,
                    }
                    res.send({
                        status: "true",
                        message: "Scraping By Nafizz.",
                        result: json
                    })
                })
            })
        } catch (e) {
            res.send({
                status: "false",
                message: "Scraping By Nafizz.",
                error: "Use url params!"
            })
        }
    })

    // app.use('/styletext/:styles/', (req, res) => {


    //     (async () => {

    //     try {

    //         let listed = [
    //             "phub",
    //             "advglow",
    //             "jokerlogo",
    //             "codmw",
    //             "avenger",
    //             "firework",
    //             "bokeh",
    //             "sandbeach",
    //             "senja",
    //             "minion",
    //             "space",
    //             "blood",
    //             "dropwater"
    //        ]

    //     if (req.params.styles == 'params') {
    //         let paramss = []
    //         paramss.push({
    //             pronhub: "/phub?text1=MRHRTZ&text2=NZCHA",
    //             advancedglow: "/advglow?text1=MRHRTZ",
    //             jokerlogo: "/jokerlogo?text1=MRHRTZ",
    //             callofduty: "/codmw?text1=MRHRTZ",
    //             avenger: "/avenger?text1=MRHRTZ&text2=NZCHA",
    //             firework: "/firework?text1=MRHRTZ",
    //             bokeh: "/bokeh?text1=MRHRTZ",
    //             sandbeach: "/sandbeach?text1=MRHRTZ",
    //             senja: "/senja?text1=MRHRTZ",
    //             minion: "/minion?text1=MRHRTZ",
    //             space: "/space?text1=MRHRTZ&text2=NZCHA",
    //             blood: "/blood?text1=MRHRTZ",
    //             dropwater: "/dropwater?text1=MRHRTZ"
    //         })
    //         res.send({
    //             status: "false",
    //             message: "Created By MRHRTZ",
    //             result: paramss

    //         })
    //     }

    //         const select_style = req.params.styles

    //         let style = [
    //             "https://textpro.me/pornhub-style-logo-online-generator-free-977.html",     //phub=2
    //             "https://textpro.me/advanced-glow-text-effect-873.html",                    //advglow=1
    //             "https://textpro.me/create-logo-joker-online-934.html",                     //jokerlogo=1
    //             "https://textpro.me/green-neon-text-effect-874.html",                       //codmw=1
    //             "https://textpro.me/create-3d-avengers-logo-online-974.html",               //avenger=2
    //             "https://textpro.me/firework-sparkle-text-effect-930.html",                 //firework=1
    //             "https://textpro.me/bokeh-text-effect-876.html",                            //bokeh=1
    //             "https://textpro.me/sand-engraved-3d-text-effect-989.html",                 //sandbeach=1
    //             "https://textpro.me/1917-style-text-effect-online-980.html",                //senja=1
    //             "https://textpro.me/minion-text-effect-3d-online-978.html",                 //minion=1
    //             "https://textpro.me/create-space-3d-text-effect-online-985.html",           //space=2
    //             "https://textpro.me/horror-blood-text-effect-online-883.html",              //blood=1
    //             "https://textpro.me/dropwater-text-effect-872.html",                        //dropwater=1
    //         ]


    //     const browser = await puppeteer.launch({
    //         headless: true,
    //         defaultViewport: null,
    //         args: [
    //             '--no-sandbox'
    //         ]
    //     });
    //     const page = await browser.newPage();

    //     if (select_style == 'phub') { //2
    //         await page.goto(style[0]);
    //         await page.type('#text-0', req.query.text1);
    //         await page.type('#text-1', req.query.text2);
    //         await page.click('[name="submit"]')
    //         await page.waitForNavigation()
    //         const bodyHandle = await page.$('body');
    //         const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    //         await bodyHandle.dispose();
    //         const $ = cheerio.load(html)
    //         const result = $('#content-wrapper > section > div > div.col-md-9 > div:nth-child(4) > div > img').attr('src')
    //         const hasil = 'https://textpro.me'+result 
    //         res.send({
    //             status: "true",
    //             message: "Created By MRHRTZ",
    //             result: hasil
    //         })
    //         await browser.close();
    //     } else if (select_style == 'advglow') { //1
    //         await page.goto(style[1]);
    //         await page.type('#text-0', req.query.text1);
    //         await page.click('[name="submit"]')
    //         await page.waitForNavigation()
    //         const bodyHandle = await page.$('body');
    //         const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    //         await bodyHandle.dispose();
    //         const $ = cheerio.load(html)
    //         const result = $('#content-wrapper > section > div > div.col-md-9 > div:nth-child(4) > div > img').attr('src')
    //         const hasil = 'https://textpro.me'+result 
    //         res.send({
    //             status: "true",
    //             message: "Created By MRHRTZ",
    //             result: hasil
    //         })
    //         await browser.close();   
    //     } else if (select_style == 'jokerlogo') { //1
    //         await page.goto(style[2]);
    //         await page.type('#text-0', req.query.text1);
    //         await page.click('[name="submit"]')
    //         await page.waitForNavigation()
    //         const bodyHandle = await page.$('body');
    //         const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    //         await bodyHandle.dispose();
    //         const $ = cheerio.load(html)
    //         const result = $('#content-wrapper > section > div > div.col-md-9 > div:nth-child(4) > div > img').attr('src')
    //         const hasil = 'https://textpro.me'+result 
    //         res.send({
    //             status: "true",
    //             message: "Created By MRHRTZ",
    //             result: hasil
    //         })
    //         await browser.close();
    //     } else if (select_style == 'codmw') { //1
    //         await page.goto(style[3]);
    //         await page.type('#text-0', req.query.text1);
    //         await page.click('[name="submit"]')
    //         await page.waitForNavigation()
    //         const bodyHandle = await page.$('body');
    //         const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    //         await bodyHandle.dispose();
    //         const $ = cheerio.load(html)
    //         const result = $('#content-wrapper > section > div > div.col-md-9 > div:nth-child(4) > div > img').attr('src')
    //         const hasil = 'https://textpro.me'+result 
    //         res.send({
    //             status: "true",
    //             message: "Created By MRHRTZ",
    //             result: hasil
    //         })
    //         await browser.close();
    //     } else if (select_style == 'avenger') { //2
    //         await page.goto(style[4]);
    //         await page.type('#text-0', req.query.text1);
    //         await page.type('#text-1', req.query.text2);
    //         await page.click('[name="submit"]')
    //         await page.waitForNavigation()
    //         const bodyHandle = await page.$('body');
    //         const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    //         await bodyHandle.dispose();
    //         const $ = cheerio.load(html)
    //         const result = $('#content-wrapper > section > div > div.col-md-9 > div:nth-child(4) > div > img').attr('src')
    //         const hasil = 'https://textpro.me'+result 
    //         res.send({
    //             status: "true",
    //             message: "Created By MRHRTZ",
    //             result: hasil
    //         })
    //         await browser.close();
    //     } else if (select_style == 'firework') { //1
    //         await page.goto(style[5]);
    //         await page.type('#text-0', req.query.text1);
    //         await page.click('[name="submit"]')
    //         await page.waitForNavigation()
    //         const bodyHandle = await page.$('body');
    //         const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    //         await bodyHandle.dispose();
    //         const $ = cheerio.load(html)
    //         const result = $('#content-wrapper > section > div > div.col-md-9 > div:nth-child(4) > div > img').attr('src')
    //         const hasil = 'https://textpro.me'+result 
    //         res.send({
    //             status: "true",
    //             message: "Created By MRHRTZ",
    //             result: hasil
    //         })
    //         await browser.close();
    //     } else if (select_style == 'bokeh') { //1
    //         await page.goto(style[6]);
    //         await page.type('#text-0', req.query.text1);
    //         await page.click('[name="submit"]')
    //         await page.waitForNavigation()
    //         const bodyHandle = await page.$('body');
    //         const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    //         await bodyHandle.dispose();
    //         const $ = cheerio.load(html)
    //         const result = $('#content-wrapper > section > div > div.col-md-9 > div:nth-child(4) > div > img').attr('src')
    //         const hasil = 'https://textpro.me'+result 
    //         res.send({
    //             status: "true",
    //             message: "Created By MRHRTZ",
    //             result: hasil
    //         })
    //         await browser.close();
    //     } else if (select_style == 'sandbeach') { //1
    //         await page.goto(style[7]);
    //         await page.type('#text-0', req.query.text1);
    //         await page.click('[name="submit"]')
    //         await page.waitForNavigation()
    //         const bodyHandle = await page.$('body');
    //         const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    //         await bodyHandle.dispose();
    //         const $ = cheerio.load(html)
    //         const result = $('#content-wrapper > section > div > div.col-md-9 > div:nth-child(4) > div > img').attr('src')
    //         const hasil = 'https://textpro.me'+result 
    //         res.send({
    //             status: "true",
    //             message: "Created By MRHRTZ",
    //             result: hasil
    //         })
    //         await browser.close();
    //     } else if (select_style == 'senja') { //1
    //         await page.goto(style[8]);
    //         await page.type('#text-0', req.query.text1);
    //         await page.click('[name="submit"]')
    //         await page.waitForNavigation()
    //         const bodyHandle = await page.$('body');
    //         const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    //         await bodyHandle.dispose();
    //         const $ = cheerio.load(html)
    //         const result = $('#content-wrapper > section > div > div.col-md-9 > div:nth-child(4) > div > img').attr('src')
    //         const hasil = 'https://textpro.me'+result 
    //         res.send({
    //             status: "true",
    //             message: "Created By MRHRTZ",
    //             result: hasil
    //         })
    //         await browser.close();
    //     } else if (select_style == 'minion') { //1
    //         await page.goto(style[9]);
    //         await page.type('#text-0', req.query.text1);
    //         await page.click('[name="submit"]')
    //         await page.waitForNavigation()
    //         const bodyHandle = await page.$('body');
    //         const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    //         await bodyHandle.dispose();
    //         const $ = cheerio.load(html)
    //         const result = $('#content-wrapper > section > div > div.col-md-9 > div:nth-child(4) > div > img').attr('src')
    //         const hasil = 'https://textpro.me'+result 
    //         res.send({
    //             status: "true",
    //             message: "Created By MRHRTZ",
    //             result: hasil
    //         })
    //         await browser.close();
    //     } else if (select_style == 'space') { //2
    //         await page.goto(style[10]);
    //         await page.type('#text-0', req.query.text1);
    //         await page.type('#text-1', req.query.text2);
    //         await page.click('[name="submit"]')
    //         await page.waitForNavigation()
    //         const bodyHandle = await page.$('body');
    //         const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    //         await bodyHandle.dispose();
    //         const $ = cheerio.load(html)
    //         const result = $('#content-wrapper > section > div > div.col-md-9 > div:nth-child(4) > div > img').attr('src')
    //         const hasil = 'https://textpro.me'+result 
    //         res.send({
    //             status: "true",
    //             message: "Created By MRHRTZ",
    //             result: hasil
    //         })
    //         await browser.close();
    //     } else if (select_style == 'blood') { //1
    //         await page.goto(style[11]);
    //         await page.type('#text-0', req.query.text1);
    //         await page.click('[name="submit"]')
    //         await page.waitForNavigation()
    //         const bodyHandle = await page.$('body');
    //         const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    //         await bodyHandle.dispose();
    //         const $ = cheerio.load(html)
    //         const result = $('#content-wrapper > section > div > div.col-md-9 > div:nth-child(4) > div > img').attr('src')
    //         const hasil = 'https://textpro.me'+result 
    //         res.send({
    //             status: "true",
    //             message: "Created By MRHRTZ",
    //             result: hasil
    //         })
    //         await browser.close();
    //     } else if (select_style == 'dropwater') { //1
    //         await page.goto(style[12]);
    //         await page.type('#text-0', req.query.text1);
    //         await page.click('[name="submit"]')
    //         await page.waitForNavigation()
    //         const bodyHandle = await page.$('body');
    //         const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    //         await bodyHandle.dispose();
    //         const $ = cheerio.load(html)
    //         const result = $('#content-wrapper > section > div > div.col-md-9 > div:nth-child(4) > div > img').attr('src')
    //         const hasil = 'https://textpro.me'+result 
    //         res.send({
    //             status: "true",
    //             message: "Created By MRHRTZ",
    //             result: hasil
    //         })
    //         await browser.close();
    //     }

    //     } catch (e){
    //     console.log(e)
    //     res.send({
    //         status: "false",
    //         message: "Created By MRHRTZ",
    //         error: "Please see /styletext/params/ to know text params!"
    //     })
    //     }

    //     })();

    // })

    app.use('/apng-to-webp', (req, res) => {
        res.header("Content-Type", 'application/json');
        if (!req.query.url) {
            res.send({
                status: false,
                message: "Created By MRHRTZ",
                handle: "Please use /apng-to-webp?url= params"
            })
        } else {
            function apng2webpUrl(url) {
                return new Promise((resolve, reject) => {
                    Axios.get(`https://ezgif.com/apng-to-webp?url=${url}`)
                        .then(({ data }) => {
                            const $ = cheerio.load(data)
                            const bodyFormThen = new FormData()
                            const file = $('input[name="file"]').attr('value')
                            const token = $('input[name="token"]').attr('value')
                            const convert = $('input[name="file"]').attr('value')
                            const gotdata = {
                                file: file,
                                token: token,
                                convert: convert
                            }
                            bodyFormThen.append('file', gotdata.file)
                            bodyFormThen.append('token', gotdata.token)
                            bodyFormThen.append('convert', gotdata.convert)
                            Axios({
                                method: 'post',
                                url: 'https://ezgif.com/apng-to-webp/' + gotdata.file,
                                data: bodyFormThen,
                                headers: {
                                    'Content-Type': `multipart/form-data; boundary=${bodyFormThen._boundary}`
                                }
                            }).then(({ data }) => {
                                const $ = cheerio.load(data)
                                // console.log(data)
                                const result = 'https:' + $('div#output > p.outfile > img').attr('src')
                                resolve({
                                    status: true,
                                    message: "Created By MRHRTZ",
                                    result: result
                                })
                            }).catch(reject)
                        })
                        .catch(reject)
                })
            }

            apng2webpUrl(req.query.url)
                .then((rest) => {
                    res.send(JSON.stringify({
                        status: "true",
                        message: "Created By MRHRTZ",
                        result: rest.result
                    }, null, 3))
                }).catch((e) => {
                    console.log(e)
                    res.send({
                        status: false,
                        message: "Created By MRHRTZ"
                    })
                })

        }
    })

    app.use('/igstalk', (req, res) => {
        res.header("Content-Type", 'application/json');
        if (!req.query.username) {
            res.send({
                status: false,
                message: "Created By MRHRTZ",
                handle: "Please provide /igstalk?username= param!"
            })
        } else {
            const sesid = '8008647406%3AZOMAWiE1WXFMS0%3A27'
            function getUser(username) {
                return new Promise((resolve, reject) => {
                    try {
                        Axios.get('https://www.instagram.com/' + username.replace('@', '') + '/?__a=1', {
                            headers: {
                                Cookie: `sessionid=${sesid}`
                            }
                        }).then(({ data }) => {
                            const user = data.graphql.user
                            // console.log(data)
                            // console.log(user.biography)
                            resolve({
                                // link: URL.replace('/?__a=1', ''),
                                id: user.id,
                                biography: user.biography,
                                subscribersCount: user.edge_followed_by.count,
                                subscribtions: user.edge_follow.count,
                                fullName: user.full_name,
                                highlightCount: user.highlight_reel_count,
                                isBusinessAccount: user.is_business_account,
                                isRecentUser: user.is_joined_recently,
                                accountCategory: user.business_category_name,
                                linkedFacebookPage: user.connected_fb_page,
                                isPrivate: user.is_private,
                                isVerified: user.is_verified,
                                profilePic: user.profile_pic_url,
                                profilePicHD: user.profile_pic_url_hd,
                                username: user.username,
                                postsCount: user.edge_owner_to_timeline_media.count,
                                posts: user.edge_owner_to_timeline_media.edges.map(edge => {
                                    let hasCaption = edge.node.edge_media_to_caption.edges[0];
                                    return {
                                        id: edge.node.id,
                                        shortCode: edge.node.shortcode,
                                        url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
                                        dimensions: edge.node.dimensions,
                                        imageUrl: edge.node.display_url,
                                        isVideo: edge.node.is_video,
                                        caption: hasCaption ? hasCaption.node.text : '',
                                        commentsCount: edge.node.edge_media_to_comment.count,
                                        commentsDisabled: edge.node.comments_disabled,
                                        timestamp: edge.node.taken_at_timestamp,
                                        likesCount: edge.node.edge_liked_by.count,
                                        location: edge.node.location,
                                        children: edge.node.edge_sidecar_to_children ? edge.node.edge_sidecar_to_children.edges.map(edge => {
                                            return {
                                                id: edge.node.id,
                                                shortCode: edge.node.shortcode,
                                                dimensions: edge.node.dimensions,
                                                imageUrl: edge.node.display_url,
                                                isVideo: edge.node.is_video,
                                            }
                                        }) : []
                                    }
                                }) || []
                            });
                        })
                    } catch (e) {
                        console.log(e)
                    }
                })
            }

            getUser(req.query.username)
                .then(send => res.send(JSON.stringify({
                    status: true,
                    message: "Created By MRHRTZ",
                    result: send
                }, null, 3))).catch((e) => {
                    console.log(e)
                    res.send({
                        status: false,
                        message: "Created By MRHRTZ"
                    })
                })
        }
    })

    app.use('/webp-to-mp4', (req, res) => {
        res.header("Content-Type", 'application/json');
        if (!req.query.url) {
            res.send({
                status: false,
                message: "Created By MRHRTZ",
                handle: "Please use /webp-to-mp4?url params"
            })
        } else {


            function webp2mp4Url(url) {
                return new Promise((resolve, reject) => {
                    Axios.get(`https://ezgif.com/webp-to-mp4?url=${url}`)
                        .then(({ data }) => {
                            const $ = cheerio.load(data)
                            const bodyFormThen = new FormData()
                            const file = $('input[name="file"]').attr('value')
                            const token = $('input[name="token"]').attr('value')
                            const convert = $('input[name="file"]').attr('value')
                            const gotdata = {
                                file: file,
                                token: token,
                                convert: convert
                            }
                            bodyFormThen.append('file', gotdata.file)
                            bodyFormThen.append('token', gotdata.token)
                            bodyFormThen.append('convert', gotdata.convert)
                            Axios({
                                method: 'post',
                                url: 'https://ezgif.com/webp-to-mp4/' + gotdata.file,
                                data: bodyFormThen,
                                headers: {
                                    'Content-Type': `multipart/form-data; boundary=${bodyFormThen._boundary}`
                                }
                            }).then(({ data }) => {
                                const $ = cheerio.load(data)
                                const result = 'https:' + $('div#output > p.outfile > video > source').attr('src')
                                resolve({
                                    status: true,
                                    message: "Created By MRHRTZ",
                                    result: result
                                })
                            }).catch(reject)
                        })
                        .catch(reject);
                })
            }

            webp2mp4Url(req.query.url)
                .then((rest) => {
                    res.send(JSON.stringify({
                        status: "true",
                        message: "Created By MRHRTZ",
                        result: rest.result
                    }, null, 3))
                }).catch((e) => {
                    console.log(e)
                    res.send({
                        status: false,
                        message: "Created By MRHRTZ"
                    })
                })

        }
    })

    app.use('/stickerline', (req, res) => {
        res.header("Content-Type", 'application/json');
        if (!req.query.url) {
            res.send({
                status: false,
                message: "Created By MRHRTZ",
                handle: "Please provide /stickerline?url= param!"
            })
        } else {
            function slineMetadata(id) {
                return new Promise((resolve, reject) => {
                    Axios.get(`http://dl.stickershop.line.naver.jp/products/0/0/1/${id}/android/productInfo.meta`)
                        .then(({ data }) => {
                            const id = data.packageId
                            const title = data.title.en
                            const author = data.author.en
                            const ani = data.hasAnimation
                            let stickers = []
                            data.stickers.forEach((rest) => {
                                stickers.push(rest)
                            })
                            resolve({
                                id: id,
                                title: title,
                                animate: ani,
                                author: author,
                                stickers: stickers
                            })
                        }).catch(reject)
                })
            }

            function getStikerLine(url) {
                return new Promise((resolve, reject) => {
                    const id = url.match(/[0-9]/g).join('')
                    slineMetadata(id)
                        .then(async (a) => {
                            const id = a.id
                            const author = a.author
                            const title = a.title
                            const stiker = a.stickers
                            let urls = []
                            if (a.animate) {
                                for (let i = 0; i < stiker.length; i++) {
                                    urls.push(`https://sdl-stickershop.line.naver.jp/products/0/0/1/${id}/android/animation/${stiker[i].id}.png`)
                                }
                            } else if (!a.animate) {
                                for (let i = 0; i < stiker.length; i++) {
                                    urls.push(`http://dl.stickershop.line.naver.jp/stickershop/v1/sticker/${stiker[i].id}/android/sticker.png`)
                                }
                            }
                            resolve({
                                status: true,
                                message: "Created By MRHRTZ",
                                result: {
                                    author: author,
                                    id: id,
                                    title: title,
                                    animated: a.animate,
                                    stickers: urls
                                }
                            })
                        }).catch(reject)
                })
            }

            getStikerLine(req.query.url)
                .then(send => res.send(JSON.stringify(send)))
                .catch(e => {
                    console.log(e)
                    res.send({
                        status: false,
                        message: "Created By MRHRTZ"
                    })
                })
        }
    })

    app.use('/brainly', (req, res) => {
        if (!req.query.url) {
            res.send({
                status: false,
                message: "Created By MRHRTZ",
                handle: "Please use /brainly?url=https://brainly.co.id/tugas/8332275 params"
            })
        } else {
            const url = req.query.url
            Axios.get(url, {
                headers: {
                    Cookie: "_ga=GA1.3.1789505300.1603064930; _hjid=f379fff3-a105-4498-ab94-93ae03c123aa; hl=id; Zadanepl_cookie[Token][Guest]=a8a7798c432445420ca2680d81399732b8a248e792763b39d7a3c731968c96cab35d442556f83077; __cfduid=daebd46a0d8f92d75ff3370454b1c73451609635370; _gid=GA1.3.729876905.1609635373; experimentId=9e16147fa6336ccd27f7d820e74a4572e01c959a523c5286a2cdfb101e2053f5; Zadanepl_cookie[infobar]=; inHouseAds=JTdCJTIydG9wbGF5ZXJfcmVnaXN0cmF0aW9uJTIyJTNBJTVCMTYwOTYzNTQ0MSUyQzE2MDk2Mzk3MjElNUQlN0Q%3D; _gali=question-sg-layout-container;"
                }
            })
                .then(({ data }) => {
                    let answer = []
                    const $ = cheerio.load(data)
                    $('div[data-test="answer-box-text"]').get().map((rest) => {
                        answer.push($(rest).text().replace('\n', ''))
                    })
                    let media = []
                    let media_question = []
                    $('div[data-test="question-box-attachments"] > div > div > div > img.brn-qpage-next-attachments-viewer-image-preview__image').get().map((rest) => {
                        if ($(rest).length) {
                            media_question.push($(rest).attr('src'))
                        }
                    })
                    $('div[data-test="answer-box-attachments"] > div > div > div > img.brn-qpage-next-attachments-viewer-image-preview__image').get().map((rest) => {
                        if ($(rest).length) {
                            media.push($(rest).attr('src'))
                        }
                    })
                    const time = $('div.sg-text.sg-text--xsmall.sg-text--gray-secondary > time').attr('datetime')
                    const mapel = $('a[data-test="question-box-subject"]').text().replace(/\n/g, '')
                    const kelas = $('a[data-test="question-box-grade"]').text().replace(/\n/g, '')
                    const pertanyaan = $('h1[data-test="question-box-text"] > span').text().replace('\n', '')
                    let jawaban = []
                    for (let i = 0; i < answer.length; i++) {
                        jawaban.push({
                            teks: answer[i],
                            media: media[i] || []
                        })
                    }
                    const result = {
                        pertanyaan: pertanyaan,
                        foto_pertanyaan: media_question,
                        waktu_dibuat: time,
                        kelas: kelas,
                        mapel: mapel,
                        jawaban: jawaban
                    }
                    res.send(JSON.stringify({
                        status: true,
                        message: "Created By MRHRTZ",
                        result: result
                    }, null, 3))
                })
        }
    })

    app.use('/daftar_stasiun', (req, res) => {
        res.header("Content-Type", 'application/json');
        let stasiun =
            [
                "rcti",
                "nettv",
                "antv",
                "gtv",
                "indosiar",
                "inewstv",
                "kompastv",
                "metrotv",
                "mnctv",
                "rtv",
                "sctv",
                "trans7",
                "transtv",
                "tvone",
                "tvri"
            ]
        res.send(JSON.stringify({
            status: "true",
            message: "Created By MRHRTZ",
            result: stasiun
        }, null, 3))
    })

    app.use('/artinama', (req, res) => {
        res.header("Content-Type", 'application/json');
        try {
            if (!req.query.nama) {
                res.send({
                    status: false,
                    message: "Created By MRHRTZ",
                    handle: "Mohon masukan parameter /artinama?nama="
                })
            }
            const name = req.query.nama
            Axios.get(`https://www.primbon.com/arti_nama.php?nama1=${name}&proses=+Submit%21+`)
                .then(({ data }) => {
                    const $ = cheerio.load(data)
                    const result = $('#body').text().split('Nama:')[0].replace('\n\n\n\nARTI NAMA\n', '')
                    res.send(JSON.stringify({
                        status: true,
                        message: "Created By MRHRTZ",
                        result: result
                    }, null, 3))
                }).catch(e => {
                    console.log(e)
                    res.send({
                        status: "false",
                        message: "Created By MRHRTZ"
                    })
                })
        } catch (e) {
            console.log(e)
            res.send({
                status: "false",
                message: "Created By MRHRTZ"
            })
        }
    })

    app.use('/artimimpi', (req, res) => {
        res.header("Content-Type", 'application/json');
        try {
            if (!req.query.q) {
                res.send({
                    status: false,
                    message: "Created By MRHRTZ",
                    handle: "Gunakan parameter /artimimpi?q= dan hanya kata kunci! contoh belanja"
                })
            }
            function artimimpi(katakunci) {
                return new Promise((resolve, reject) => {
                    Axios.get('https://www.primbon.com/tafsir_mimpi.php?mimpi=' + katakunci + '&submit=+Submit+')
                        .then(({ data }) => {
                            const $ = cheerio.load(data)
                            const detect = $('#body > font > i').text()
                            const isAva = /Tidak ditemukan/g.test(detect) ? false : true
                            if (isAva) {
                                const isi = $('#body').text().split(`Hasil pencarian untuk kata kunci: ${katakunci}`)[1].replace(/\n\n\n\n\n\n\n\n\n/gi, '\n')
                                const res = isi
                                resolve(res)
                            } else {
                                const res = `Data tidak ditemukan! Gunakan kata kunci.`
                                resolve(res)
                            }
                        })
                        .catch(reject)
                })
            }

            artimimpi(req.query.q).then((result) => {
                res.send(JSON.stringify({
                    status: true,
                    message: "Created By MRHRTZ",
                    result: result
                }))
            }).catch(e => {
                console.log(e)
                res.send({
                    status: false,
                    message: "Created By MRHRTZ"
                })
            })

        } catch (error) {
            console.log(error)
            res.send({
                status: "false",
                message: "Created By MRHRTZ"
            })
        }
    })

    app.use('/tebak-gambar', (req, res) => {
        res.header("Content-Type", 'application/json');
        try {
            function tebak_gambar() {
                return new Promise((resolve, reject) => {
                    const url_floor = `https://jawabantebakgambar.net/id-${Math.floor(Math.random() * 2685)}.html`
                    Axios.get(url_floor)
                        .then(({ data }) => {
                            const $ = cheerio.load(data)
                            const img = `https://jawabantebakgambar.net${$('#images > li > a > img').attr('src')}`
                            const jawaban = $('#images > li > a > img').attr('alt').replace('Jawaban ', '')
                            const result = {
                                img: img,
                                jawaban: jawaban
                            }
                            resolve(result)
                        })
                        .catch(reject)
                })
            }

            tebak_gambar().then((result) => {
                res.send(JSON.stringify({
                    status: true,
                    message: "Created By MRHRTZ",
                    result
                }, null, 3))
            }).catch((e) => {
                console.log(e)
                res.send({
                    status: false,
                    message: "Created By MRHRTZ"
                })
            })
        } catch (error) {
            console.log(error)
            res.send({
                status: false,
                message: "Created By MRHRTZ"
            })
        }
    })

    app.use('/joox', (req, res) => {
        res.header("Content-Type", 'application/json');
        try {
            if (!req.query.q) {
                res.send({
                    status: false,
                    message: "Created By MRHRTZ",
                    handle: "Masukan parameter /joox?q=numb"
                })
            }

            function joox(query) {
                return new Promise((resolve, reject) => {
                    const time = Math.floor(new Date() / 1000)
                    Axios.get('http://api.joox.com/web-fcgi-bin/web_search?lang=id&country=id&type=0&search_input=' + query + '&pn=1&sin=0&ein=29&_=' + time)
                        .then(({ data }) => {
                            let result = []
                            let hasil = []
                            let promoses = []
                            let ids = []
                            data.itemlist.forEach(result => {
                                ids.push(result.songid)
                            });
                            for (let i = 0; i < data.itemlist.length; i++) {
                                const get = 'http://api.joox.com/web-fcgi-bin/web_get_songinfo?songid=' + ids[i]
                                promoses.push(
                                    Axios.get(get, {
                                        headers: {
                                            Cookie: 'wmid=142420656; user_type=1; country=id; session_key=2a5d97d05dc8fe238150184eaf3519ad;'
                                        }
                                    })
                                        .then(({ data }) => {
                                            const res = JSON.parse(data.replace('MusicInfoCallback(', '').replace('\n)', ''))
                                            hasil.push({
                                                lagu: res.msong,
                                                album: res.malbum,
                                                penyanyi: res.msinger,
                                                publish: res.public_time,
                                                img: res.imgSrc,
                                                mp3: res.mp3Url
                                            })

                                            Axios.get('http://api.joox.com/web-fcgi-bin/web_lyric?musicid=' + ids[i] + '&lang=id&country=id&_=' + time)
                                                .then(({ data }) => {
                                                    const lirik = JSON.parse(data.replace('MusicJsonCallback(', '').replace('\n)', '')).lyric
                                                    const buff = new Buffer.from(lirik, 'base64')
                                                    const ash = buff.toString('utf-8').replace('Lirik didapat dari pihak ketiga', 'Created By MRHRTZ')
                                                    result.push(ash)
                                                    Promise.all(promoses).then(() => resolve({
                                                        status: true,
                                                        message: "Created By MRHRTZ",
                                                        data: hasil,
                                                        lirik: result
                                                    }))
                                                }).catch(reject)
                                        }).catch(reject)
                                )
                            }
                        }).catch(reject)
                })
            }

            joox(req.query.q).then((has) => {
                res.send(JSON.stringify(has, null, 3))
            })
        } catch (error) {
            console.log(error)
            res.send({
                status: false,
                message: "Created By MRHRTZ"
            })
        }
    })

    app.use('/lk21', (req, res) => {
        res.header("Content-Type", 'application/json');
        try {
            if (!req.query.q) {
                res.send({
                    status: false,
                    message: "Created By MRHRTZ",
                    handle: "Gunakan parameter /lk21?q=joker"
                })
            }

            function lk21(query) {
                return new Promise((resolve, reject) => {
                    const film = query
                    Axios.get('http://167.99.71.200/?s=' + film)
                        .then(({ data }) => {
                            const $ = cheerio.load(data)
                            const url = $('div > div.content-thumbnail.text-center > a').attr('href')
                            Axios.get(url)
                                .then(({ data }) => {
                                    const $ = cheerio.load(data)
                                    const judul = $('div > div.gmr-movie-data.clearfix > div > h1').text()
                                    const desc = $('div > div.entry-content.entry-content-single > p:nth-child(1)').text()
                                    const thumb = $('#movie_player > div.ytp-cued-thumbnail-overlay > div').attr('style')
                                    const link1 = $('#download1').attr('href')
                                    const link2 = $('#download2').attr('href')
                                    const link = []
                                    link.push(link1)
                                    link.push(link2)
                                    const res = {
                                        title: judul,
                                        description: desc,
                                        link: link
                                    }
                                    resolve(res)
                                }).catch(() => {
                                    reject({
                                        status: false,
                                        result: `Tidak bisa menemukan data ${query}`
                                    })
                                })
                        }).catch(() => {
                            reject({
                                status: false,
                                result: `Tidak bisa menemukan data ${query}`
                            })
                        })
                })
            }

            lk21(req.query.q).then(result => {
                res.send(JSON.stringify({
                    status: true,
                    message: "Created By MRHRTZ",
                    result
                }, null, 3))
            }).catch((e) => {
                console.log(e)
                res.send({
                    status: false,
                    message: "Created By MRHRTZ"
                })
            })
        } catch (error) {
            console.log(error)
            res.send({
                status: false,
                message: "Created By MRHRTZ"
            })
        }
    })

    app.use('/jadwaltv', (req, res) => {
        res.header("Content-Type", 'application/json');
        try {
            let stasiun = [
                "rcti",
                "nettv",
                "antv",
                "gtv",
                "indosiar",
                "inewstv",
                "kompastv",
                "metrotv",
                "mnctv",
                "rtv",
                "sctv",
                "trans7",
                "transtv",
                "tvone",
                "tvri"
            ]
            const tv_switch = stasiun[15]
            Axios.get('https://www.jadwaltv.net/channel/' + req.query.channel)
                .then(({ data }) => {
                    const $ = cheerio.load(data)
                    const isitable1 = []
                    const isitable2 = []
                    $('div > div > table:nth-child(3) > tbody > tr').each(function (i, result) {
                        isitable1.push({
                            jam: result.children[0].children[0].data,
                            tayang: result.children[1].children[0].data
                        })
                    })
                    // console.log(isitable1)
                    $('div > div > table:nth-child(5) > tbody > tr').each(function (i, result) {
                        isitable2.push({
                            jam: result.children[0].children[0].data,
                            tayang: result.children[1].children[0].data
                        })
                    })
                    const semuatable = []

                    for (let i = 0; i < isitable1.length; i++) {
                        semuatable.push(isitable1[i])
                    }
                    for (let i = 0; i < isitable2.length; i++) {
                        semuatable.push(isitable2[i])
                    }
                    // console.log(semuatable)


                    res.send(JSON.stringify({
                        status: "true",
                        message: "Created By MRHRTZ",
                        jumlah_channel_tv: stasiun.length,
                        stasiunTv: tv_switch,
                        result: semuatable
                    }, null, 3))
                })
                .catch((e) => {
                    console.log(e)
                    res.send({
                        status: "false",
                        message: "Created By MRHRTZ",
                        error: "404",
                        handle: "Masukan url /daftar_stasiun untuk melihat channel tv yang tersedia!"
                    })
                })
        } catch (e) {
            console.log(e)
            res.send({
                status: "false",
                message: "Created By MRHRTZ",
                error: "204"
            })
        }
    })


    app.use('/ramalan-jodoh', (req, res) => {
        res.header("Content-Type", 'application/json');
        try {
            if (!req.query.nama1) {
                res.send({
                    status: false,
                    message: "Created By MRHRTZ",
                    handle: "Masukan parameter /ramalan-jodoh?nama1=asep&nama2=udin"
                })
            } else if (!req.query.nama2) {
                res.send({
                    status: false,
                    message: "Created By MRHRTZ",
                    handle: "Masukan parameter keduanya! /ramalan-jodoh?nama1=asep&nama2=udin"
                })
            } else {
                const nama1 = req.query.nama1
                const nama2 = req.query.nama2

                Axios.get('https://www.primbon.com/kecocokan_nama_pasangan.php?nama1=' + nama1 + '&nama2=' + nama2 + '&proses=+Submit%21+')
                    .then(({ data }) => {
                        const $ = cheerio.load(data)
                        const progress = 'https://www.primbon.com/' + $('#body > img').attr('src')
                        const isi = $('#body').text().split(nama2)[1].replace('< Hitung Kembali', '').split('\n')[0]
                        const posi = isi.split('Sisi Negatif Anda: ')[0].replace('Sisi Positif Anda: ', '')
                        const nega = isi.split('Sisi Negatif Anda: ')[1]
                        const resu = {
                            result: {
                                status: true,
                                message: "Created By MRHRTZ",
                                nama1: nama1,
                                nama2: nama2,
                                thumb: progress,
                                positif: posi,
                                negatif: nega
                            }
                        }
                        res.send(JSON.stringify(resu, null, 3))
                    })
            }
        } catch (error) {
            console.log(error)
            res.send({
                status: false,
                message: "Created By MRHRTZ"
            })
        }
    })

    app.use('/play', (req, res) => {
        res.header("Content-Type", 'application/json');

        const query = req.query.q

        yts(query)
            .then((result) => {

                let data = result.all
                let pertype = []

                if (data[0].type == "video") {
                    pertype.push({
                        id: data[0].videoId,
                        type: data[0].type,
                        author: data[0].author.name,
                        title: data[0].title,
                        desc: data[0].description,
                        duration: data[0].timestamp,
                        thumb: data[0].thumbnail,
                        url: data[0].url
                    })
                } else {
                    pertype.push({
                        id: data[1].videoId,
                        type: data[1].type,
                        author: data[1].author.name,
                        title: data[1].title,
                        desc: data[1].description,
                        duration: data[1].timestamp,
                        thumb: data[1].thumbnail,
                        url: data[1].url
                    })
                }

                let IdYt = ytdl.getURLVideoID(pertype[0].url)
                let yatyat = ytdl.getInfo(IdYt)
                    .then((howly) => {
                        let empefor = howly.formats
                        let resultMp3 = []

                        for (let i = 0; i < empefor.length; i++) {
                            if (empefor[i].mimeType == 'audio/webm; codecs=\"opus\"') {
                                let resultAud = empefor[i]
                                resultMp3.push({
                                    mimetype: resultAud.mimeType,
                                    audioBitrate: resultAud.audioBitrate,
                                    audioSampleRate: resultAud.audioSampleRate,
                                    audioQuality: resultAud.audioQuality,
                                    audioBitrate: resultAud.audioBitrate,
                                    url: resultAud.url
                                })
                            }
                        }

                        const tamnel = howly.videoDetails.thumbnail.thumbnails
                        let desc = []
                        desc.push(howly.videoDetails.description.simpleText)
                        res.send(JSON.stringify({
                            status: "true",
                            message: "Scraping By Nafizz.",
                            title: howly.videoDetails.title,
                            author: howly.videoDetails.author.name,
                            published: howly.videoDetails.publishDate,
                            duration: howly.videoDetails.lengthSeconds.toReal(),
                            desc: desc,
                            thumb: tamnel[tamnel.length - 1].url,
                            audio: resultMp3[0].url
                        }, null, 3))
                    }).catch((e) => {
                        console.log(e)
                        res.send({
                            status: "false",
                            message: "Created by MRHRTZ",
                            Error: "Must be id!"
                        })
                    })

                //END

            })
            .catch(err => {
                console.error(err)
                res.send({
                    status: "false",
                    message: "Scraping By Nafizz.",
                    error: "Use q params!"
                })
            });
    })
    app.use('/herodetail', (req, res) => {
        res.header("Content-Type", 'application/json');
        if (!req.query.hero) {
            res.send({
                status: false,
                message: "Created By MRHRTZ",
                handle: "Gunakan parameter /mobile-legends/herodetail?hero=akai"
            })
        }

        function herodetail(name) {
            return new Promise((resolve, reject) => {
                var splitStr = name.toLowerCase().split(' ');
                for (var i = 0; i < splitStr.length; i++) {
                    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
                }
                const que = splitStr.join(' ')
                Axios.get('https://mobile-legends.fandom.com/wiki/' + que)
                    .then(({ data }) => {
                        const $ = cheerio.load(data)
                        let mw = []
                        let attrib = []
                        let skill = []
                        const name = $('#mw-content-text > div > div > div > div > div > div > table > tbody > tr > td > table > tbody > tr > td > font > b').text()
                        $('.mw-headline').get().map((res) => {
                            const mwna = $(res).text()
                            mw.push(mwna)
                        })
                        $('#mw-content-text > div > div > div > div > div > div > table > tbody > tr > td').get().map((rest) => {
                            const haz = $(rest).text().replace(/\n/g, '')
                            attrib.push(haz)
                        })
                        $('#mw-content-text > div > div > div > div > div > div > table > tbody > tr > td > div.progressbar-small.progressbar > div').get().map((rest) => {
                            skill.push($(rest).attr('style').replace('width:', ''))
                        })
                        Axios.get('https://mobile-legends.fandom.com/wiki/' + que + '/Story')
                            .then(({ data }) => {
                                const $ = cheerio.load(data)
                                let pre = []
                                $('#mw-content-text > div > p').get().map((rest) => {
                                    pre.push($(rest).text())
                                })
                                const story = pre.slice(3).join('\n')
                                const items = []
                                const character = []
                                $('#mw-content-text > div > aside > section > div').get().map((rest) => {
                                    character.push($(rest).text().replace(/\n\t\n\t\t/g, '').replace(/\n\t\n\t/g, '').replace(/\n/g, ''))
                                })
                                $('#mw-content-text > div > aside > div').get().map((rest) => {
                                    items.push($(rest).text().replace(/\n\t\n\t\t/g, '').replace(/\n\t\n\t/g, '').replace(/\n/g, ''))
                                })
                                const img = $('#mw-content-text > div > aside > figure > a').attr('href')
                                const chara = character.slice(0, 2)
                                const result = {
                                    status: true,
                                    message: "Created By MRHRTZ",
                                    result: {
                                        hero_name: name + ` ( ${mw[0].replace('CV:', ' CV:')} )`,
                                        entrance_quotes: attrib[2].replace('Entrance Quotes', '').replace('\n', ''),
                                        hero_feature: attrib[attrib.length - 1].replace('Hero Feature', ''),
                                        image: img.split('/revision')[0],
                                        items: items,
                                        character: {
                                            chara
                                        },
                                        attributes: {
                                            movement_speed: attrib[12].replace('● Movement Speed', ''),
                                            physical_attack: attrib[13].replace('● Physical Attack', ''),
                                            magic_power: attrib[14].replace('● Magic Power', ''),
                                            attack_speed: attrib[15].replace('● Attack Speed', ''),
                                            physical_defense: attrib[16].replace('● Physical Defense', ''),
                                            magic_defense: attrib[17].replace('● Magic Defense', ''),
                                            basic_atk_crit_rate: attrib[18].replace('● Basic ATK Crit Rate', ''),
                                            hp: attrib[19].replace('● HP', ''),
                                            mana: attrib[20].replace('● Mana', ''),
                                            ability_crit_rate: attrib[21].replace('● Ability Crit Rate', ''),
                                            hp_regen: attrib[22].replace('● HP Regen', ''),
                                            mana_regen: attrib[23].replace('● Mana Regen', '')
                                        },
                                        price: {
                                            battle_point: mw[1].split('|')[0].replace(/ /g, ''),
                                            diamond: mw[1].split('|')[1].replace(/ /g, ''),
                                            hero_fragment: mw[1].split('|')[2] ? mw[1].split('|')[2].replace(/ /g, '') : 'none'
                                        },
                                        role: mw[2],
                                        skill: {
                                            durability: skill[0],
                                            offense: skill[1],
                                            skill_effects: skill[2],
                                            difficulty: skill[3]
                                        },
                                        speciality: mw[3],
                                        laning_recommendation: mw[4],
                                        release_date: mw[5],
                                        background_story: story
                                    }
                                }
                                resolve(result)
                            }).catch((e) => reject({ status: false, message: "Created By MRHRTZ", error: e.message }))
                    }).catch((e) => reject({ status: false, message: "Created By MRHRTZ", error: e.message }))
            })
        }

        herodetail(req.query.hero)
            .then(send => res.send(JSON.stringify(send, null, 3)))
            .catch(e => res.send(e))
    })

    app.use('/herolist', (req, res) => {
        res.header("Content-Type", 'application/json');
        function herolist() {
            return new Promise((resolve, reject) => {
                Axios.get('https://mobile-legends.fandom.com/wiki/Mobile_Legends:_Bang_Bang_Wiki')
                    .then(({ data }) => {
                        const $ = cheerio.load(data)
                        let data_hero = []
                        let url = []
                        $('div > div > span > span > a').get().map((result) => {
                            const name = decodeURIComponent($(result).attr('href').replace('/wiki/', ''))
                            const urln = 'https://mobile-legends.fandom.com' + $(result).attr('href')
                            data_hero.push(name)
                            url.push(urln)
                        })
                        resolve({
                            status: true,
                            message: "Created By MRHRTZ",
                            result: data_hero
                        })
                    }).catch((e) => {
                        reject({
                            status: false,
                            message: "Created By MRHRTZ",
                            error: e.message
                        })
                    })
            })
        }
        herolist()
            .then(send => res.send(JSON.stringify(send, null, 3)))
            .catch(e => res.send(e))
    })


    app.use('/neonime-popular', (req, res) => {
        res.header("Content-Type", 'application/json');
        function neonimePopular() {
            return new Promise((resolve, reject) => {
                Axios.get('https://neonime.vip')
                    .then(({ data }) => {
                        const $ = cheerio.load(data)
                        let thumb = []
                        let title = []
                        let url = []
                        let ress = []
                        $('div.imagens > a').get().map((rest) => {
                            url.push($(rest).attr('href'))
                        })
                        $('div.imagens > a > img').get().map((rest) => {
                            thumb.push($(rest).attr('data-src'))
                        })
                        $('div > div > div > div > span').get().map((rest) => {
                            title.push($(rest).text())
                        })
                        for (let i = 0; i < title.length; i++) {
                            ress.push({
                                title: title[i],
                                mini_thumb: thumb[i],
                                url: url[i]
                            })
                        }
                        resolve({
                            status: true,
                            message: "Created By MRHRTZ",
                            name: "Neonime Popular",
                            result: ress.slice(0, 8)
                        })
                    }).catch((e) => {
                        console.log(e)
                        reject({
                            status: false,
                            message: "Created By MRHRTZ"
                        })
                    })
            })
        }

        neonimePopular()
            .then(send => res.send(JSON.stringify(send, null, 3)))
            .catch(send => res.send(send))
    })

    app.use('/neonime-latest', (req, res) => {
        res.header("Content-Type", 'application/json');
        function neonimeLatest() {
            return new Promise((resolve, reject) => {
                Axios.get('https://neonime.vip')
                    .then(({ data }) => {
                        const $ = cheerio.load(data)
                        let ress = []
                        let url = []
                        let season = []
                        let hasil = []
                        $('div.item.episode-home > span').get().map((ress) => {
                            season.push($(ress).text())
                        })
                        $('div.item.episode-home > a').get().map((ress) => {
                            url.push($(ress).attr('href'))
                        })
                        $('div.item.episode-home > div.image > a > img').get().map((rest) => {
                            ress.push({
                                title: $(rest).attr('alt'),
                                thumb: $(rest).attr('data-src')
                            })
                        })
                        for (let i = 0; i < ress.length; i++) {
                            hasil.push({
                                title: ress[i].title,
                                season: season[i],
                                thumb: ress[i].thumb,
                                url: url[i]
                            })
                        }
                        const result = {
                            status: true,
                            message: "Created By MRHRTZ",
                            name: "Neonime Latest Release",
                            result: hasil
                        }
                        resolve(result)
                    }).catch(() => reject({
                        status: false,
                        message: "Created By MRHRTZ"
                    }))
            })
        }

        neonimeLatest()
            .then(send => res.send(JSON.stringify(send, null, 3)))
            .catch(send => res.send(send))
    })

    app.use('/wattpad-search', async (req, res) => {
        res.header("Content-Type", 'application/json');
        if (!req.query.q) {
            res.send({
                status: false,
                message: "Created By MRHRTZ",
                handle: "Please use /wattpad-search?q=tere liye param!"
            })
        } else {
            function wattpadSearch(query) {
                return new Promise((resolve, reject) => {
                    Axios.get('https://www.wattpad.com/search/' + query)
                        .then(({ data }) => {
                            const $ = cheerio.load(data)
                            let title = []
                            let url = []
                            let id = []
                            let img = []
                            $('#results-stories > div > ul > li > div > a > div.cover.cover-xs.pull-left > img').get().map((rest) => {
                                title.push($(rest).attr('alt'))
                                img.push($(rest).attr('src'))
                            })
                            $('#results-stories > div > ul > li > div > a').get().map((rest) => {
                                url.push('https://www.wattpad.com' + $(rest).attr('href'))
                                id.push($(rest).attr('data-id'))
                            })
                            let results = []
                            for (let i = 0; i < title.length; i++) {
                                const ress = {
                                    id: id[i],
                                    title: title[i],
                                    thumb: img[i],
                                    url: url[i],
                                }
                                results.push(ress)
                            }
                            resolve({
                                status: true,
                                message: "Created By MRHRTZ",
                                result: results
                            })
                        }).catch(() => reject({ status: false, message: "Created By MRHRTZ" }))
                })
            }

            await wattpadSearch(req.query.q)
                .then(send => res.send(JSON.stringify(send, null, 3)))
                .catch(e => res.send(e))
        }
    })

    app.use('/apk-search', (req, res) => {
        res.header("Content-Type", 'application/json');
        if (!req.query.q) {
            res.send(JSON.stringify({
                status: false,
                message: "Created By MRHRTZ",
                handle: "Please use /apk-search?q= param"
            }, null, 3))
        } else {
            searchApk(req.query.q)
                .then(send => res.send(JSON.stringify({
                    status: true,
                    message: "Created By MRHRTZ",
                    result: send
                }, null, 3)))
                .catch(e => res.send(e))
        }
    })

    app.use('/apk-download', (req, res) => {
        res.header("Content-Type", 'application/json');
        if (!req.query.dl_url) {
            res.send(JSON.stringify({
                status: false,
                message: "Created By MRHRTZ",
                handle: "Please use /apk-download?dl_url=https://rexdlfile.com/index.php?id=minecraft-pocket-edition-apk-mod-downloadi param"
            }, null, 3))
        } else {
            getApk(req.query.dl_url)
                .then(send => res.send(JSON.stringify({
                    status: true,
                    message: "Created By MRHRTZ",
                    result: send
                }, null, 3)))
                .catch(e => res.send(e))
        }
    })

    app.use('/wattpad-read', (req, res) => {
        res.header("Content-Type", 'application/json');
        if (!req.query.url) {
            res.send({
                status: false,
                message: "Created By MRHRTZ",
                handle: "Please provide /wattpad-read?url= param!"
            })
        } else {
            async function dapatUrlBaca(urlStory) {
                return new Promise((resolve, reject) => {
                    Axios.get(urlStory, {
                        headers: {
                            cookies: "wp_id=847b4df3-34da-4341-963a-0055ce115542; lang=20; fs__exp=1; locale=id_ID; ff=1; dpr=1; tz=-7; _gid=GA1.2.2021227156.1609366547; _fbp=fb.1.1609366546940.1628275046; __qca=P0-1418787791-1609366545836; G_ENABLED_IDPS=google; hc=1; uuid=07b600e3-bc29-4763-c4b7-b9500032a52a; __utma=122286349.1753646722.1609366545.1609367342.1609367342.1; __utmz=122286349.1609367342.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utmv=122286349.|1=logged=1=1^2=created=20190722=1^3=group=10=1; token=231023083%3A34c6abaa2c4a3adf6b51f497217671ac5036596a55bdf8aac9d4d63f882a5dfe; forceRefresh=1; isStaff=1; te_session_id=1609369147344; AMP_TOKEN=%24NOT_FOUND; signupFrom=story_reading; _ga=GA1.1.1753646722.1609366545; rt_token=5bc37f774d5defed9cedbc8f62c463f9c676f317caaf3382af770ce7c19f38e8; _ga_FNDTZ0MZDQ=GS1.1.1609366544.1.1.1609371182.0;"
                        }
                    }).then(({ data }) => {
                        const $ = cheerio.load(data)
                        resolve({ result: 'https://www.wattpad.com' + $('a.btn.btn-orange.btn-sm.btn-inline.on-story-navigate').attr('href') })
                        resolve(data)
                    })
                })
            }

            async function bacaWattpad(url) {
                res.header("Content-Type", 'application/json');
                return new Promise(async (resolve, reject) => {
                    if (/story/g.test(url)) url = (await dapatUrlBaca(url)).result
                    Axios.get(url, {
                        headers: {
                            cookies: "wp_id=847b4df3-34da-4341-963a-0055ce115542; lang=20; fs__exp=1; locale=id_ID; ff=1; dpr=1; tz=-7; _gid=GA1.2.2021227156.1609366547; _fbp=fb.1.1609366546940.1628275046; __qca=P0-1418787791-1609366545836; G_ENABLED_IDPS=google; hc=1; uuid=07b600e3-bc29-4763-c4b7-b9500032a52a; __utma=122286349.1753646722.1609366545.1609367342.1609367342.1; __utmz=122286349.1609367342.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utmv=122286349.|1=logged=1=1^2=created=20190722=1^3=group=10=1; token=231023083%3A34c6abaa2c4a3adf6b51f497217671ac5036596a55bdf8aac9d4d63f882a5dfe; forceRefresh=1; isStaff=1; te_session_id=1609369147344; AMP_TOKEN=%24NOT_FOUND; signupFrom=story_reading; _ga=GA1.1.1753646722.1609366545; rt_token=5bc37f774d5defed9cedbc8f62c463f9c676f317caaf3382af770ce7c19f38e8; _ga_FNDTZ0MZDQ=GS1.1.1609366544.1.1.1609371182.0;"
                        }
                    })
                        .then(({ data }) => {
                            const $ = cheerio.load(data)
                            const title = $('title').text()
                            const img = $('figure > p > img').get().map((rest) => {
                                if ($(rest).length) {
                                    return $(rest).attr('src').replace('?s=fit&w=720&h=720', '')
                                }
                            })
                            const image = img ? img : img
                            const author = $('div > div > div > header > div.author.hidden-lg > a:nth-child(2)').text()
                            const author_page = 'https://www.wattpad.com' + $('div > div > div > header > div.author.hidden-lg > a').attr('href')
                            const isi = image.length > 0 ? $('pre').text().replace(/                          /g, '').split('Ups! Gambar ini tidak mengikuti Pedoman Konten kami. Untuk melanjutkan publikasi, hapuslah gambar ini atau unggah gambar lain.\n  \n\n\n')[1].replace(/            /g, '') : $('pre').text().replace(/                          /g, '').replace(/                    /g, '').replace(/            /g, '')
                            const url_selanjutnya = $('footer > div.container > div > div > div > a.on-navigate.next-part-link').get().map((rest) => {
                                if ($(rest).length) {
                                    return $(rest).attr('href')
                                }
                            })
                            const next_page = url_selanjutnya.length > 0 ? url_selanjutnya : $('div.next-up-title').text().replace(/  /g, '')
                            const results = {
                                title: title.replace(' - Wattpad', ''),
                                author: {
                                    name: author,
                                    user_page: author_page
                                },
                                image: image,
                                next_page_url: next_page,
                                read_body: isi
                            }
                            resolve({
                                status: true,
                                message: "Created By MRHRTZ",
                                result: results
                            })
                        }).catch(() => reject({ status: false, message: "Created By MRHRTZ" }))
                })
            }
            bacaWattpad(req.query.url)
                .then(send => res.send(JSON.stringify(send, null, 3)))
                .then(e => res.send(e))
        }
    })

    app.use('/film-search', (req, res) => {
        res.header("Content-Type", 'application/json');
        function movie_search(query) {
            return new Promise((resolve, reject) => {
                Axios.get(`https://melongmovie.com/?s=${query}`)
                    .then(({ data }) => {
                        const $ = cheerio.load(data)
                        let id = []
                        let thumb = []
                        let title = []
                        let url = []
                        let status = []
                        $('article.box > div.bx > a > div.limit > img').get().map((rest) => {
                            thumb.push($(rest).attr('src'))
                        })
                        $('article.box > div.bx > a > div.limit > div.overlay').get().map((rest) => {
                            status.push($(rest).text())
                        })
                        $('article.box > div.bx > a').get().map((rest) => {
                            url.push($(rest).attr('href'))
                        })
                        $('article.box > div.bx > a').get().map((rest) => {
                            title.push($(rest).attr('title'))
                        })
                        $('article.box > div.bx > a').get().map((rest) => {
                            id.push($(rest).attr('rel'))
                        })
                        let result = []
                        for (let i in title) {
                            result.push({
                                id: id[i],
                                title: title[i],
                                img: thumb[i],
                                info: status[i],
                                url: url[i]
                            })
                        }
                        resolve(result)
                    })
                    .catch(reject)
            })
        }
        if (!req.query.q) {
            res.send(JSON.stringify({
                status: false,
                message: "Created By MRHRTZ",
                handle: "Please use param /film-search?q=passengers"
            }, null, 3))
        } else {
            movie_search(req.query.q)
                .then(send => res.send(JSON.stringify({
                    status: true,
                    message: "Created By MRHRTZ",
                    result: send
                }, null, 2)))
                .catch(() => res.send({ status: false, message: "Created By MRHRTZ" }))
        }
    })


    app.use('/film-detail', (req, res) => {
        res.header("Content-Type", 'application/json');
        function movie_detail(url) {
            return new Promise((resolve, reject) => {
                 Axios.get(url)
                 .then(({ data }) => {
                      const $ = cheerio.load(data)
                      let data_ = $('ul.data').text().replace(/\n/g,'')
                      let ace = []
                      let files = []
                      let pastelink = []
                      data.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi).map((rest) => {
                           if (rest.includes(`acefile`)) {
                                ace.push(rest)
                           } else if (rest.includes('files.cx')) {
                                files.push(rest)
                           } else if (rest.includes('pastelink')) {
                                pastelink.push(rest)
                           }
                      })
                      const title = $('h1.entry-title').text()
                      const rating = $('div.rtp > div.rtb > span').attr('style').replace('width:','')
                      let thumb = $('div.limage > img').attr('src')
                      const desc = $('div.infodb > div > p').text()
                      const result = {
                           title: title,
                           rating: rating,
                           data: data_,
                           image: thumb,
                           description: desc,
                           download: {
                                acefile: ace,
                                files: files,
                                pastelink: pastelink
                           }
                      }
                      resolve(result)
                 })
                 .catch(reject)
            })
       }
        if (!req.query.url) {
            res.send(JSON.stringify({
                status: false,
                message: "Created By MRHRTZ",
                handle: "Please use param /film-detail?url=https://melongmovie.com/passengers-2016/"
            }, null, 3))
        } else {
            movie_detail(req.query.url)
                .then(send => res.send(JSON.stringify({
                    status: true,
                    message: "Created By MRHRTZ",
                    result: send
                }, null, 2)))
                .catch(() => res.send({ status: false, message: "Created By MRHRTZ" }))
        }
    })


    app.use('*', (req, res) => {
        res.header("Content-Type", 'application/json');
        api_obj = {
            IGSTALK: '/igstalk?username=nfz.01',
            Youtube_Download_MP3: "/ytmp3?url=https://www.youtube.com/watch?v=kXtaWkP08U4",
            Youtube_Download_MP4: "/ytdlmp4?resolution=360&url=https://www.youtube.com/watch?v=kXtaWkP08U4",
            Youtube_Search: "/ytsearch?q=numb",
            Youtube_Auto_Scrap_Audio: "/play?q=playdate",
            Google_Search_Image: "/googleimage?q=mobil",
            Neonime_List: "/neonime",
            Neonime_Latest_Release: "/neonime-latest",
            Neonime_popular: "/neonime-popular",
            Tv_Channel_ID: "/jadwaltv?channel=rcti",
            List_Channel: "/daftar_stasiun",
            Tebak_Gambar: "/tebak-gambar",
            Primbon_Ramalan_Jodoh: "/ramalan-jodoh?nama1=udin&nama2=euis",
            Primbon_artinama: "/artinama?nama=udin",
            Primbon_artimimpi: "/artimimpi?q=belanja",
            LK21: "/lk21?q=joker",
            JOOX_Search: "/joox?q=perlahan",
            ML_List_Hero: "/herolist",
            Brainly: "/brainly?url=https://brainly.co.id/tugas/8332275",
            ML_Detail_Hero: "/herodetail?=Miya",
            Wattpad_Search: "/wattpad-search?q=tere liye",
            Wattpad_Read: "/wattpad-read?url=https://www.wattpad.com/story/106928575-tere-liye-%E2%9C%94",
            APNG_TO_WEBP: "/apng-to-webp?url=",
            WEBP_TO_MP4: "/webp-to-mp4?url=",
            STICKERLINE: "/stickerline?url=https://store.line.me/stickershop/product/9409/id",
            APK_SEARCH: "/apk-search?q=minecraft",
            APK_DOWNLOAD: "/apk-download?dl_url=https://rexdlfile.com/index.php?id=minecraft-pocket-edition-apk-mod-downloadi",
            FILM_SEARCH: "/film-search?q=passengers",
            FILM_DETAIL: "/film-detail?url=https://melongmovie.com/passengers-2016/"
        }

        res.send(JSON.stringify({
            status: true,
            message: "Scraping By Nafizz.",
            result: api_obj
        }, null, 3))
    })

    app.listen(PORT, () => {
        console.log("RUNNING ON PORT : " + PORT)
    })


} catch (e) {
    res.send({
        status: "false",
        message: "See at my github https://github.com/MRHRTZ",
        todo: "Masukan parameter ID Youtube!"
    })
}
