const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs/promises');
const { url } = require('inspector');
const natural = require('natural');

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

//this function return the title and text of the page
 function title_text(html)
{
const $ =  cheerio.load(html);

//getting text from title
$([
    'script',
    'style',
    'noscript',
    'svg',
    'canvas',
    'iframe',
    'header',
    'footer',
    'nav',
    'aside',
    'form'
].join(',')).remove();  //removing unwanted selectors in css and js
const title = $('title').text().trim()

//getting text from body
const text = $('body').text().trim();
const result =  new Set(text.toLowerCase(). replace(/[^\w\s]|_/g, "").trim().split(/\s+/));//tokenization

return{ 
    title,
  result
};
};

//removing unecessary words like and ,or, the,is,or,as,an,a,for,by,
function remove_stp(result){
const stopwords = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am",
  "an", "and", "any", "are", "aren't", "as", "at",
  "be", "because", "been", "before", "being", "below", "between",
  "both", "but", "by",
  "can", "can't", "cannot", "could", "couldn't",
  "did", "didn't", "do", "does", "doesn't", "doing", "don't",
  "down", "during",
  "each",
  "few", "for", "from", "further",
  "had", "hadn't", "has", "hasn't", "have", "haven't", "having",
  "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers",
  "herself", "him", "himself", "his", "how", "how's",
  "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is",
  "isn't", "it", "it's", "its", "itself",
  "let's",
  "me", "more", "most", "mustn't", "my", "myself",
  "no", "nor", "not",
  "of", "off", "on", "once", "only", "or", "other", "ought",
  "our", "ours", "ourselves", "out", "over", "own",
  "same", "she", "she'd", "she'll", "she's", "should",
  "shouldn't", "so", "some", "such",
  "than", "that", "that's", "the", "their", "theirs", "them",
  "themselves", "then", "there", "there's", "these", "they",
  "they'd", "they'll", "they're", "they've", "this", "those",
  "through", "to", "too",
  "under", "until", "up",
  "very",
  "was", "wasn't", "we", "we'd", "we'll", "we're", "we've",
  "were", "weren't", "what", "what's", "when", "when's", "where",
  "where's", "which", "while", "who", "who's", "whom", "why",
  "why's", "with", "won't", "would", "wouldn't",
  "you", "you'd", "you'll", "you're", "you've", "your", "yours",
  "yourself", "yourselves"
])
for(const word of result)
{
    if(stopwords.has(word))
    {
        result.delete(word);

    }
}
return result;
}

//Stemming
function stem(result){
const stemmer = natural.PorterStemmer;
const stemmed = new Set();//new set containing the words of text
for(const word of result){
    stemmed.add(stemmer.stem(word));

}
return stemmed;
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

    

    //for(let i=0;i<length;i++){
    try{
    const nxthtml = await getdata(link);//strips the html from link

    visited.add(link);//pushed the link which is used ,into visited array
         const text = title_text(nxthtml)//this has title and text
         let result = text.result;//set of words returned and stored into result
          result = remove_stp(result);//remove stopwords
          result = stem(result);//stem them


    const $ = cheerio.load(nxthtml);            

$('a').each((index,element) =>{
    const url = $(element).attr('href')
     if(url){
         //const absoluteurl = new URL(url,'https://www.netflix.com/in/');
         const regex = /^http:\/\/|^https:\/\//i.test(url);

        if(regex &&  !queue.includes(url) && queue.length<50)
         queue.push(url);
     }

}); 
 return result;
}
catch(error){
    console.log('error ocoured =',error.message);
    console.log('error ocoured =',error.code);
    return new Set();
}
}

const documents = [];
async function main(){

    await returnlink();// the links of the first page of netflix is added to queue


for(let i = 0; i<queue.length && i<
    50;i++){
    if(!visited.has(queue[i])){
        console.log("Queue size:", queue.length);
      let result =  await crawlagain(queue[i])//takes the first link from queue takes its links out and add them into queue and in visitid(set) also and repeat for next link
      for(const word of result){
      documents.push({
       text:word,
        id: i
     });};
      

}}
console.log(queue);
}
 

async function start() {
    await main();
    const index = new Map();
for(const doc of documents){
    if(!index.has(doc.text)){
       index.set(doc.text,[]);
    }
    index.get(doc.text).push(doc.id);
}
console.log(index);


}

start();



//things to do later 
//1.convert queue into a set from an array