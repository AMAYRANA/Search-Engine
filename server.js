const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs/promises');
const { url } = require('inspector');


//defining the queue array and visited set array
 const queue =[];
 const visited = new Set();//making visisted a set not as array bcu i have to continouusly check for values

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

$('a').each((index,element) =>{
    const url = $(element).attr('href')
     if(url){
         const absoluteurl = new URL(url,'https://www.netflix.com/in/');

         const regex = /^http:\/\/|^https:\/\//i.test(absoluteurl);

        if(regex)
         queue.push(absoluteurl.href);
     }

})

}
//3.this block return the links of netflix main page
async function returnlink()
{ 
try{
    const html = await getdata('https://www.netflix.com/in/');
    await crawldata(html);
}
catch(err){
    console.log("error = ",err.message)
} 

}



//4.this block takes the links of the main netflix page converts them into html and take outs their links 
async function crawlagain(link){
   // const links = await newlink();
    //const length = link.length;

    visited.add(link);//pushed the link which is used ,into visited array

    //for(let i=0;i<length;i++){
    try{
    const nxtlink = await getdata(link);//strips the html from link

    const $ = cheerio.load(nxtlink);

$('a').each((index,element) =>{
    const url = $(element).attr('href')
     if(url){
         //const absoluteurl = new URL(url,'https://www.netflix.com/in/');
         const regex = /^http:\/\/|^https:\/\//i.test(url);

        if(regex &&  !queue.includes(url) )
         queue.push(url);
     }

})}
catch(error){
    console.log('error ocoured =',error.message);
    console.log('error ocoured =',error.code);
}
}

async function main(){

    await returnlink();// the the links of the first page of netflix is added to queue


for(let i = 0;i<queue.length;i++){
    if(!visited.has(queue[i])){
        console.log("Queue size:", queue.length);
        await crawlagain(queue[i])
    }
}
console.log(queue);
}
 
main();


//things to do later 
//1.convert queue into a set from an array