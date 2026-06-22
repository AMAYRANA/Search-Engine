const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs/promises');

//1.this block converts url into html
async function getdata(url){
     const response = await axios.get(url,{
        headers: {
            'User-Agent':'mycrawlerbot/1.0'
        },
        timeout:10000
    })
    return response.data;
}

//2.this block converts the given html and take out its links  and return it
async function crawldata(html){
const $ = cheerio.load(html);
const links =[];

$('a').each((index,element) =>{
    const url = $(element).attr('href')
     if(url){
         const absoluteurl = new URL(url,'https://www.netflix.com/in/');

         const regex = /^http:\/\/|^https:\/\//i.test(absoluteurl);

        if(regex)
         links.push(absoluteurl.href);
     }

})
return links;

}
//3.this block return the links of netflix main page
async function returnlink(){ 
try{
    const html = await getdata('https://www.netflix.com/in/');
    const links = await crawldata(html);
     return links;
}
catch(err){
    console.log("error = ",err.message)
} // 

}

//4.this block takes the links of the main netflix page converts them into html and take outs their links 
async function crawlagain(newlink){
    const links = await newlink();
    const length = links.length;

    const queue =[];
    for(let i=0;i<length;i++){
    try{
    const nxtlink = await getdata(links[i]);

    const $ = cheerio.load(nxtlink);

$('a').each((index,element) =>{
    const url = $(element).attr('href')
     if(url){
         //const absoluteurl = new URL(url,'https://www.netflix.com/in/');

         const regex = /^http:\/\/|^https:\/\//i.test(url);

        if(regex)
         queue.push(url);
     }

})}
catch(error){
    console.log('error ocoured =',error)
}
    }
    return queue;
}

//5.this block just prints the links
async function main(){
    const links = await returnlink();
    console.log(links);
const queue = await crawlagain(returnlink);

console.log(queue);
console.log('hello')
}

main();
