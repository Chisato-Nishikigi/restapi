const { default: Axios } = require("axios");
const cheerio = require('cheerio');

async function neodl(link) {
    return new Promise((resolve, rejects) => {
        Axios.get(link)
        .then(({ data }) => {
        const $ = cheerio.load(data)
        let datae = []
        $('div.ladoB div.central').each((i, elem) => {
            datae.push(elem)
        })
        const dlclass = datae[0].children[7].attribs.class
        const linkdl = $('a',`.${dlclass}`).attr('href')
        resolve(linkdl)
        }).catch(rejects)
    })
} 

module.exports.neodl = neodl