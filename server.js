const express = require('express');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const SessionManager = require('./public/js/sessionManager.js');
const timeStamp = require('./public/js/timeStamp.js').timeStamp;

let sessionManager = new SessionManager();

let templates = {};

templates.jsonData = fs.readFileSync('./data/data.json', 'utf8');
templates.quizPage = fs.readFileSync('./templates/questionSet', 'utf8');
templates.loginPage = fs.readFileSync('./templates/login', 'utf8');

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
  let user = req.userName+'&'+req.password
  let userNameAndPassword = sessionManager.getUserNameAndPassword(req.cookies.sessionid);
  if (userNameAndPassword) user = userNameAndPassword;
  next();
}

let serveLoginPage = function (req,res) {
  res.set('Content-Type','text/html');
  res.send(templates.loginPage.replace('LOGIN_MESSAGE',req.cookies.message||''));
}

let serveQuizPage = function (req,res) {
  let html = templates.quizPage;
  html = html.replace(/question/, getQuestionInHtml())
  res.set('Content-Type','text/html');
  res.send(html);
}

let redirectLoggedOutUserToLogin = (req, res,next)=>{
  let allowedUrlForLoogedUser = ['/quizSet','/result'];

  let sessionid = req.cookies.sessionid;
  if (allowedUrlForLoogedUser.includes(req.url) && !sessionManager.getUserNameAndPassword(sessionid)) {
    res.redirect('/login');
    return ;
  }
  next();
}

let redirectLoggedUserToQuizPage = (req, res,next) => {
  let sessionid = req.cookies.sessionid;
  if (['/','/login'].includes(req.url) && sessionManager.getUserNameAndPassword(sessionid)) {
    res.redirect('/quizSet');
    return ;
  }
  next();
}

let getScore = (answer)=>{
  let count=1;
  let score=0;
  let parsedData = JSON.parse(templates.jsonData);
  for (var index = 0; index < parsedData.set.length; index++) {
    let q = parsedData.set[index];
    console.log("given question set is",q);
    if (q.ans==answer[count]) {
      score = ++score
    }
    count++
  }
  return `<p>Your Score: ${score}/${parsedData.set.length}</p>`;
}

const getQuestionInHtml = ()=> {
  let parsedData = JSON.parse(templates.jsonData);
  let count = 1;
  let ques = ``;
  parsedData.set.forEach((q)=>{
    ques += `<div><h4>${count}:${q[count]}</h4>
              <p><input type="radio" value="${q.option.A}" id="${count}Q1" name="${count}" class="check">${q.option.A}</input></p>
              <p><input type="radio" value="${q.option.B}" id="${count}Q2" name="${count}" class="check">${q.option.B}</input></p>
              <p><input type="radio" value="${q.option.C}" id="${count}Q3" name="${count}" class="check">${q.option.C}</input></p>
              <p><input type="radio" value="${q.option.D}" id="${count}Q4" name="${count}" class="check">${q.option.D}</input></p></div><br><br>`
    count++
  })

  return ques;
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(loadUser);
app.use(express.static('./public'))
app.use((req,res,next)=>{
  logger(fs,req,res,next);
})
app.use(redirectLoggedUserToQuizPage)
app.use(redirectLoggedOutUserToLogin)

app.get("/", serveLoginPage);

app.get("/login",serveLoginPage);

app.get('/quizSet',serveQuizPage);

app.post('/login',(req,res)=>{
  let user = registeredUsers.find(u=>req.body.userName==u.userName && req.body.password == u.password);
  if(user) {
    let sessionid = sessionManager.createSession(req.body.userName, req.body.password);
    res.set('Set-Cookie',[`sessionid=${sessionid}`,`message='';Max-Age=0`]);
    req.userName=req.body.userName;
    req.password=req.body.password;
    serveQuizPage(req,res);
    return;
  }
  res.set('Set-Cookie',`message=userName or password is incorrect<br>;Max-Age=5`);
  res.redirect('/login');
});

app.post('/result', (req, res)=>{
  let answer = req.body;
  let score = getScore(answer)
  let result = `<p>successfully submited</p><br>${score}`
  res.send(result);
})

app.listen(3000);
console.log("server is listening 3000");
