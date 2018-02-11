const express = require('express');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const SessionManager = require('./public/js/sessionManager.js');
const timeStamp = require('./public/js/timeStamp.js').timeStamp;

let sessionManager = new SessionManager();

let templates = {};

templates.jsonData = fs.readFileSync('./data/data.json', 'utf8');
templates.quizPage = fs.readFileSync('./public/questionSet', 'utf8');
templates.loginPage = fs.readFileSync('./public/login', 'utf8');

let registeredUsers = [{userName:'divya', password:'123@rd'},{userName:'preeti', password:'123@preet'}];

//+++++++++++++++++++++++++++++++++++++++++++++
const logger = function(fs,req,res,next) {
  let logs = ['--------------------------------------------------------------',
    `${timeStamp()}`,
    `${req.method}`,
    `${req.url}`,
    `${JSON.stringify(req.headers,null,2)}`,
    ''
  ].join('\n');
  console.log(`${req.method}    ${req.url}`);
  fs.appendFile('./data/log.json',logs,()=>{});
  next();
}
//+++++++++++++++++++++++++++++++++++++++++++++
const app = express();

const loadUser = function(req, res,next) {
  let userName = sessionManager.getUserName(req.cookies.sessionid);
  if (userName) req.userName = userName;
  next();
}

let serveLoginPage = function (req,res) {
  res.set('Content-Type','text/html');
  res.send(templates.loginPage.replace('LOGIN_MESSAGE',req.cookies.message||''));
}

let serveQuizPage = function (req,res) {
  let html = templates.quizPage;
  html = html.replace(/question/, getHtmlForm())
  res.set('Content-Type','text/html');
  res.send(html);
}

let redirectLoggedOutUserToLogin = (req, res,next)=>{
  let allowedUrlForLoogedUser = ['/quizSet','/result'];

  let sessionid = req.cookies.sessionid;
  if (allowedUrlForLoogedUser.includes(req.url) && !sessionManager.getUserName(sessionid)) {
    res.redirect('/login');
    return ;
  }
  next();
}

let redirectLoggedUserToQuizPage = (req, res,next) => {
  let sessionid = req.cookies.sessionid;
  if (['/login'].includes(req.url) && sessionManager.getUserName(sessionid)) {
    res.redirect('/quizSet');
    return ;
  }
  next();
}

const getHtmlForm = ()=> {
  let parsedData = JSON.parse(templates.jsonData);
  let count = 1;
  let ques = ``;
  parsedData.set.forEach(q=>{
    ques += `<div><h4>${count}:${q.Q}</h4>
              <p><input type="radio" value="${q.option.A}" name="answer${count}" class="check" CHECK>${q.option.A}</input></p>
              <p><input type="radio" value="${q.option.B}" name="answer${count}" class="check" CHECK>${q.option.B}</input></p>
              <p><input type="radio" value="${q.option.C}" name="answer${count}" class="check" CHECK>${q.option.C}</input></p>
              <p><input type="radio" value="${q.option.D}" name="answer${count}" class="check" CHECK>${q.option.D}</input></p></div><br><br>`
    count++
  })
  return ques;
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(loadUser);
app.use((req,res,next)=>{
  console.log(logger);
  logger(fs,req,res,next);
})
app.use(redirectLoggedUserToQuizPage)
app.use(redirectLoggedOutUserToLogin)

app.get("/login",serveLoginPage);

app.get('/quizSet',serveQuizPage);

app.post('/login',(req,res)=>{
  let user = registeredUsers.find(u=>req.body.userName==u.userName);
  if(user) {
    let sessionid = sessionManager.createSession(req.body.userName);
    res.set('Set-Cookie',[`sessionid=${sessionid}`,`message='';Max-Age=0`]);
    req.userName=req.body.userName;
    serveQuizPage(req,res);
    return;
  }
  res.set('Set-Cookie',`message=login failed;Max-Age=5`);
  res.redirect('/login');
});

app.post('/result', (req, res)=>{
  let sessionid = req.cookies.sessionid
  res.set('Set-Cookie',[`sessionid=${sessionid}`,`message='';Max-Age=5`]);
  let result = 'seccessfully submited'
  res.send(result);
})

app.listen(3000);
console.log("server is listening 3000");
