let totalSeconds = 60*0.5;
let minutes = parseInt(totalSeconds/60);
let seconds = parseInt(totalSeconds%60);
let checkTime=()=>{
  document.getElementById('quiz-time-left').innerText= 'Time Left: '+minutes+" minute "+seconds+" second";
  if (totalSeconds <= 0) {
    setTimeout(document.quiz.submit(), 1);
  }else {
    totalSeconds = totalSeconds-1;
    minutes = parseInt(totalSeconds/60);
    seconds = parseInt(totalSeconds%60);
    setTimeout(()=>checkTime(), 1000);
  }
}
window.onload = checkTime;
