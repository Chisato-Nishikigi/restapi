const { default: Axios } = require('axios')
const FormData = require('form-data')
const cheerio = require('cheerio')

const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/


function post(url, formdata) {
    console.log(Object.keys(formdata).map(key => `${key}=${encodeURIComponent(formdata[key])}`).join('&'))
    return fetch(url, {
        method: 'POST',
        headers: {
            accept: "*/*",
            'accept-language': "en-US,en;q=0.9",
            'content-type': "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: Object.keys(formdata).map(key => `${key}=${encodeURIComponent(formdata[key])}`).join('&')
    })
}

function ytv(url) {
    return new Promise((resolve, reject) => {
        if (ytIdRegex.test(url)) {
            let ytId = ytIdRegex.exec(url)
            url = 'https://youtu.be/' + ytId[1]
            post('https://www.y2mate.com/mates/en60/analyze/ajax', {
                url,
                q_auto: 0,
                ajax: 1
            })
                .then(res => res.json())
                .then(res => {
                    console.log('Scraping...')
                    document = (new JSDOM(res.result)).window.document
                    yaha = document.querySelectorAll('td')
                    filesize = yaha[yaha.length - 23].innerHTML
                    id = /var k__id = "(.*?)"/.exec(document.body.innerHTML) || ['', '']
                    thumb = document.querySelector('img').src
                    title = document.querySelector('b').innerHTML

                    post('https://www.y2mate.com/mates/en60/convert', {
                        type: 'youtube',
                        _id: id[1],
                        v_id: ytId[1],
                        ajax: '1',
                        token: '',
                        ftype: 'mp4',
                        fquality: 360
                    })
                        .then(res => res.json())
                        .then(res => {
                            let KB = parseFloat(filesize) * (1000 * /MB$/.test(filesize))
                            resolve({
                                title,
                                thumb,
                                download: /<a.+?href="(.+?)"/.exec(res.result)[1],
                                filesizeFormat: filesize,
                                filesize: KB
                            })
                        }).catch(reject)
                }).catch(reject)
        } else reject('URL INVALID')
    })
}

function yta(url) {
    return new Promise((resolve, reject) => {
        if (ytIdRegex.test(url)) {
            let ytId = ytIdRegex.exec(url)
            url = 'https://youtu.be/' + ytId[1]
            post('https://www.y2mate.com/mates/en60/analyze/ajax', {
                url,
                q_auto: 0,
                ajax: 1
            })
                .then(res => res.json())
                .then(res => {
                    let document = (new JSDOM(res.result)).window.document
                    let type = document.querySelectorAll('td')
                    let filesize = type[type.length - 10].innerHTML
                    let id = /var k__id = "(.*?)"/.exec(document.body.innerHTML) || ['', '']
                    let thumb = document.querySelector('img').src
                    let title = document.querySelector('b').innerHTML

                    post('https://www.y2mate.com/mates/en60/convert', {
                        type: 'youtube',
                        _id: id[1],
                        v_id: ytId[1],
                        ajax: '1',
                        token: '',
                        ftype: 'mp3',
                        fquality: 128
                    })
                        .then(res => res.json())
                        .then(res => {
                            let KB = parseFloat(filesize) * (1000 * /MB$/.test(filesize))
                            resolve({
                                title,
                                thumb,
                                download: /<a.+?href="(.+?)"/.exec(res.result)[1],
                                filesizeFormat: filesize,
                                filesize: KB
                            })
                        }).catch(reject)
                }).catch(reject)
        } else reject('URL INVALID')
    })
}

async function ytsr(query) {
    let link = /youtube\.com\/results\?search_query=/.test(query) ? query : ('https://youtube.com/results?search_query=' + encodeURIComponent(query))
    let res = await fetch(link)
    let html = await res.text()
    let data = new Function('return ' + /var ytInitialData = (.+)/.exec(html)[1])()
    let lists = data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents
    let formatList = {
        query,
        link,
        items: []
    }
    for (let list of lists) {
        let type = {
            videoRenderer: 'video',
            shelfRenderer: 'playlist',
            radioRenderer: 'live',
            channelRenderer: 'channel',
            showingResultsForRenderer: 'typo',
            horizontalCardListRenderer: 'suggestionCard',
        }[Object.keys(list)[0]] || ''
        let content = list[Object.keys(list)[0]] || {}
        if (content) {
            switch (type) {
                case 'typo':
                    formatList.correctQuery = content.correctedQuery.runs[0].text
                    break
                case 'video':
                    formatList.items.push({
                        type,
                        title: content.title.runs[0].text.replace('â€’', '‒'),
                        views: content.viewCountText.simpleText,
                        description: content.descriptionSnippet ? content.descriptionSnippet.runs[0].text.replace('Â ...', ' ...') : '',
                        duration: content.lengthText ? [content.lengthText.simpleText, content.lengthText.accessibility.accessibilityData.label] : ['', ''],
                        thumbnail: content.thumbnail.thumbnails,
                        link: 'https://youtu.be/' + content.videoId,
                        videoId: content.videoId,
                        author: {
                            name: content.ownerText.runs[0].text,
                            link: content.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url,
                            thumbnail: content.channelThumbnailWithLinkRenderer ? content.channelThumbnailWithLinkRenderer.thumbnail.thumbnails : [],
                            verified: content.ownerBadges && /BADGE_STYLE_TYPE_VERIFIED/.test(content.ownerBadges[0].metadataBadgeRenderer.style) ? /BADGE_STYLE_TYPE_VERIFIED_ARTIST/.test(content.ownerBadges[0].metadataBadgeRenderer.style) ? 'artist' : true : false
                        }
                    })
                    break
                case 'channel':
                    formatList.items.push({
                        type,
                        title: content.title ? content.title.simpleText.replace('â€’', '‒') : '',
                        description: content.descriptionSnippet ? content.descriptionSnippet.runs[0].text.replace('Â ...', ' ...') : '',
                        videoCount: content.videoCountText ? content.videoCountText.runs[0].text : '',
                        thumbnail: content.thumbnail.thumbnails,
                        subscriberCount: content.subscriberCountText ? content.subscriberCountText.simpleText.replace('Â ', ' ') : '',
                        link: 'https://youtube.com' + content.navigationEndpoint.commandMetadata.webCommandMetadata.url,
                        verified: content.ownerBadges && /BADGE_STYLE_TYPE_VERIFIED/.test(content.ownerBadges[0].metadataBadgeRenderer.style) ? /BADGE_STYLE_TYPE_VERIFIED_ARTIST/.test(content.ownerBadges[0].metadataBadgeRenderer.style) ? 'artist' : true : false
                    })
                    break
                case 'playlist':
                    formatList.items.push({
                        type,
                        title: content.title.simpleText.replace('â€’', '‒'),
                    })
                    break
            }
        }
    }
    return formatList
}

function baseURI(buffer = Buffer.from([]), metatype = 'text/plain') {
    return `data:${metatype};base64,${buffer.toString('base64')}`
}

function ytdl(url, typeS, qualityS) {
    return new Promise((resolve, reject) => {
        if (!typeS) return reject({ status: false, message: 'pleas input mp4/mp3 type!' })
        if (!qualityS) return reject({ status: false, message: 'please input quality!' })
        const fd = new FormData()
        fd.append('url', url)
        fd.append('q_auto', '0')
        fd.append('ajax', '1')
        Axios({
            method: 'POST',
            url: 'https://www.y2mate.com/mates/en60/analyze/ajax',
            data: fd,
            headers: {
                'content-Type': `multipart/form-data; boundary=${fd._boundary}`,
                'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36'
            }
        }).then(({ data }) => {
            const $ = cheerio.load(data.result)
            const thumb = $('div.thumbnail.cover > a > img').attr('src')//$('a > img').attr('src')
            const scr = $('script').get()[1].children[0].data
            eval(scr)
            const title = k_data_vtitle
            const fd = new FormData()
            fd.append('type', video_service)
            fd.append('_id', k__id)
            fd.append('v_id', k_data_vid)
            fd.append('ajax', '1')
            fd.append('token', '')
            fd.append('ftype', typeS)
            fd.append('fquality', qualityS)
            let filesize = []
            $('tbody > tr > td:nth-child(2)').get().map(rest => {
                filesize.push($(rest).text())
            })
            let quality = []
            $('a[type="button"]').get().map(rest => {
                quality.push({
                    type: $(rest).attr('data-ftype'),
                    quality: $(rest).attr('data-fquality')
                })
            })
            let infoQ = []
            for (let i = 0; i < quality.length; i++) {
                infoQ.push({
                    type: quality[i].type,
                    quality: quality[i].quality,
                    filesize: filesize[i]
                })
            }
            infoQ.splice(infoQ.findIndex(i => i.type == 'm4a' ), 1)
            infoQ.splice(infoQ.findIndex(i => i.type == '3gp' ), 1)
            Axios({
                method: 'POST',
                url: 'https://www.y2mate.com/mates/en68/convert',
                data: fd,
                headers: {
                    'content-Type': `multipart/form-data; boundary=${fd._boundary}`,
                    'origin': 'https://www.y2mate.com',
                    'referer': 'https://www.y2mate.com/id/youtube/qKI0Ur63Rko',
                    'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36',
                    'x-requested-with': 'XMLHttpRequest'
                }
            }).then(({ data }) => {
                const $ = cheerio.load(data.result)
                const url = $('a[type="button"]').attr('href')
                const fsize = infoQ.find(q => q.quality == qualityS && q.type == typeS)
                if (fsize === undefined) return reject({ status: false, message: `Can't find ${qualityS} res with ${typeS}`, listQuality: infoQ })
                // resolve(thumb)
                resolve({
                    title: title,
                    service: video_service,
                    thumb: thumb,
                    download: url,
                    type: fsize.type,
                    quality: fsize.quality,
                    filesize: fsize.filesize,
                    floatsize: fsize.filesize.includes('MB') ? parseFloat(fsize.filesize) * (1000 * /MB$/.test(fsize.filesize)) : Math.floor(fsize.filesize.split(' ')[0]),
                    listQuality: infoQ
                })
            })
        })
    })
}

module.exports.baseURI = baseURI
module.exports.ytsr = ytsr
module.exports.yta = yta
module.exports.ytv = ytv
module.exports.ytdl = ytdl