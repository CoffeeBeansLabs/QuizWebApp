const express = require('express');
const fs = require('fs');
const jsonData = fs.readFileSync('./data/data.json', 'utf8');
const html = fs.readFileSync('./public/questionSet', 'utf8');

const app = express();
const getHtmlForm = ()=> {
  let parsedData = JSON.parse(jsonData);
  let count = 1;
  let ques = ``;
  parsedData.set.forEach(q=>{
    ques += `<p>${count}:${q.Q}</p><p><input onclick="check()" type=checkbox value="${q.option.A}" class="check" CHECK></input>${q.option.A}</p><p><input onclick="check()" type=checkbox value="${q.option.B}" class="check" CHECK></input>${q.option.B}</p>
             <p><input onclick="check()" type=checkbox value="${q.option.C}" class="check" CHECK></input>${q.option.C}</p><p><input onclick="check()" type=checkbox value="${q.option.D}" class="check" CHECK></input>${q.option.D}</p><br>`
    count++
  })
  return ques;
}


app.get('/quizSet', (req, res)=>{
  let data = getHtmlForm();
  let replacedData = html.replace(/question/,data);
  res.send(replacedData);
})

app.post('/result', (req, res)=>{
  let result = 'seccessfully submited'
  res.send(result);
})

app.listen(3000);
console.log("server is listening 3000");
