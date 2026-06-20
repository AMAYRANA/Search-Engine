const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs/promises');

async function getdata(url){
    const response = await axios.get(url,{
        headers: {
            'User-Agent':'mycrawlerbot/1.0'
        },
        timeout:10000
    })
    return response.data;
}

async function parsedata(html){
const $ = cheerio.load(html);
const links =[];

$('a').each((index,element) =>{
    const url = $(element).attr('href')

links.push(url);
})
return links;

}

async function main(){
    const html = await getdata('https://www.netflix.com/in/');
    const links = await parsedata(html);
        console.log(links)

}

main();