(function(){
var CHAT_URL='https://petcorner-chatbot.vercel.app';
var BOOKING_URL='https://petcornerdubai.com/grooming';
var WHATSAPP_URL='https://wa.me/97144566432';
var ACCENT='#E85D26';
var ACCENT2='#FF8C42';
var MSG_BG='#F4F5F7';

var PROMPTS=[
  'What dog food brands do you have?',
  'Do you offer 15-minute delivery?',
  'Book a grooming appointment',
  'Where are your store locations?',
  'Tell me about vet clinics'
];

var OPENING_MSGS=[
  'Hi! Welcome to Pet Corner! 🐾',
  "I can help with products, grooming, vet clinics, 15-min delivery & more!",
  'What can I help you with today?'
];

var hist=[];
var isOpen=false;
var leadCaptured=false;

var s=document.createElement('style');
s.textContent='#pc-bubble{position:fixed;bottom:24px;right:24px;z-index:2147483647;width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#E85D26,#FF8C42);cursor:pointer;box-shadow:0 4px 20px rgba(232,93,38,.45);display:flex;align-items:center;justify-content:center;transition:transform .2s;border:none;outline:none;}'
+'#pc-bubble:hover{transform:scale(1.08);}'
+'#pc-bubble-icon{font-size:28px;line-height:1;}'
+'#pc-dot{position:absolute;top:-2px;right:-2px;width:16px;height:16px;background:#ef4444;border-radius:50%;border:2px solid white;display:none;}'
+'#pc-win{position:fixed;bottom:100px;right:24px;z-index:2147483647;width:380px;height:610px;border-radius:18px;box-shadow:0 12px 48px rgba(0,0,0,.18);display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,system-ui,sans-serif;background:#fff;}'
+'#pc-win.open{display:flex;}'
+'#pc-head{background:linear-gradient(135deg,#E85D26,#FF8C42);padding:14px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0;}'
+'#pc-head-logo{width:44px;height:44px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.15);font-size:24px;}'
+'#pc-head-info{flex:1;}'
+'#pc-head-name{color:white;font-weight:700;font-size:15px;}'
+'#pc-head-status{color:rgba(255,255,255,.9);font-size:12px;margin-top:3px;display:flex;align-items:center;gap:5px;}'
+'#pc-status-dot{width:7px;height:7px;background:#4ade80;border-radius:50%;display:inline-block;}'
+'#pc-close{background:rgba(255,255,255,.2);border:none;color:white;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;}'
+'#pc-close:hover{background:rgba(255,255,255,.35);}'
+'#pc-book-bar{background:linear-gradient(90deg,rgba(232,93,38,.06),rgba(255,140,66,.1));border-bottom:1px solid rgba(232,93,38,.12);padding:7px 14px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}'
+'#pc-book-bar-text{font-size:12px;color:#666;font-weight:500;}'
+'#pc-book-btn{background:linear-gradient(135deg,#E85D26,#FF8C42);color:white;border:none;border-radius:20px;padding:5px 13px;font-size:12px;font-weight:600;cursor:pointer;}'
+'#pc-book-btn:hover{opacity:.88;}'
+'#pc-msgs{flex:1;overflow-y:auto;padding:14px 14px 8px;display:flex;flex-direction:column;gap:8px;background:#F4F5F7;}'
+'#pc-msgs::-webkit-scrollbar{width:4px;}'
+'#pc-msgs::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:4px;}'
+'.pc-m{max-width:84%;padding:10px 14px;border-radius:18px;font-size:13.5px;line-height:1.55;word-wrap:break-word;}'
+'.pc-m.bot{background:white;color:#1a1a2e;border-bottom-left-radius:4px;box-shadow:0 1px 6px rgba(0,0,0,.07);align-self:flex-start;}'
+'.pc-m.user{background:linear-gradient(135deg,#E85D26,#FF8C42);color:white;border-bottom-right-radius:4px;align-self:flex-end;}'
+'.pc-m.system{background:#fff8f0;color:#c2440a;border:1px solid #ffd5b8;border-radius:10px;align-self:center;font-size:12px;text-align:center;padding:7px 12px;max-width:90%;}'
+'.pc-meta{font-size:10px;color:#bbb;margin-top:1px;align-self:flex-start;padding-left:2px;}'
+'.pc-meta.um{align-self:flex-end;padding-right:2px;padding-left:0;}'
+'#pc-typing{display:flex;gap:5px;padding:12px 16px;background:white;border-radius:18px;border-bottom-left-radius:4px;align-self:flex-start;box-shadow:0 1px 6px rgba(0,0,0,.07);}'
+'#pc-typing span{width:7px;height:7px;border-radius:50%;background:#E85D26;animation:pcb 1.2s infinite;}'
+'#pc-typing span:nth-child(2){animation-delay:.2s;}'
+'#pc-typing span:nth-child(3){animation-delay:.4s;}'
+'@keyframes pcb{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}'
+'#pc-prompts{padding:8px 10px;display:flex;flex-wrap:wrap;gap:6px;background:#F4F5F7;border-top:1px solid rgba(0,0,0,.06);flex-shrink:0;}'
+'.pc-prompt{background:white;border:1.5px solid rgba(232,93,38,.35);color:#E85D26;border-radius:20px;padding:5px 11px;font-size:12px;cursor:pointer;white-space:nowrap;font-weight:500;}'
+'.pc-prompt:hover{background:#E85D26;color:white;border-color:#E85D26;}'
+'#pc-human-bar{background:#fff8f0;border-top:1px solid #ffe0c8;padding:7px 14px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}'
+'#pc-human-bar span{font-size:12px;color:#a0522d;font-weight:500;}'
+'#pc-human-btn{background:white;color:#E85D26;border:1.5px solid #E85D26;border-radius:20px;padding:5px 13px;font-size:12px;font-weight:600;cursor:pointer;}'
+'#pc-human-btn:hover{background:#E85D26;color:white;}'
+'#pc-lead-section{padding:10px 12px;background:white;border-top:1px solid #f0f0f0;flex-shrink:0;}'
+'#pc-lead-title{font-size:11px;color:#999;margin-bottom:6px;text-align:center;}'
+'#pc-lead-row{display:flex;gap:6px;}'
+'#pc-lead-row input{flex:1;border:1.5px solid #e8e0f0;border-radius:20px;padding:7px 12px;font-size:12.5px;outline:none;font-family:inherit;}'
+'#pc-lead-row input:focus{border-color:#E85D26;}'
+'#pc-lead-submit{background:linear-gradient(135deg,#E85D26,#FF8C42);color:white;border:none;border-radius:20px;padding:7px 14px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;}'
+'#pc-footer{padding:10px 12px;background:white;border-top:1px solid #eee;display:flex;gap:8px;align-items:center;flex-shrink:0;}'
+'#pc-input{flex:1;border:1.5px solid #e8e0f0;border-radius:24px;padding:9px 16px;font-size:13.5px;outline:none;font-family:inherit;color:#1a1a2e;background:#fafafa;}'
+'#pc-input:focus{border-color:#E85D26;background:white;}'
+'#pc-send{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#E85D26,#FF8C42);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}'
+'#pc-send:hover{opacity:.88;}'
+'#pc-send svg{width:17px;height:17px;fill:white;}'
+'#pc-brand{text-align:center;font-size:10px;color:#ccc;padding:5px 0 4px;background:white;}';
document.head.appendChild(s);

var bubble=document.createElement('button');
bubble.id='pc-bubble';
bubble.innerHTML='<div id="pc-dot"></div><span id="pc-bubble-icon">🐾</span>';
document.body.appendChild(bubble);

var win=document.createElement('div');
win.id='pc-win';
document.body.appendChild(win);

win.innerHTML='<div id="pc-head"><div id="pc-head-logo">🐾</div><div id="pc-head-info"><div id="pc-head-name">Pet Corner Assistant</div><div id="pc-head-status"><span id="pc-status-dot"></span>Online · AI Agent</div></div><button id="pc-close">&#10005;</button></div>'
+'<div id="pc-book-bar"><span id="pc-book-bar-text">📅 Book a grooming session</span><button id="pc-book-btn">📆 Book a Grooming</button></div>'
+'<div id="pc-msgs"></div>'
+'<div id="pc-prompts" style="display:none"></div>'
+'<div id="pc-human-bar"><span>Need a human agent?</span><button id="pc-human-btn">💬 Ask a Human</button></div>'
+'<div id="pc-lead-section" id="pc-lead-section" style="display:none"><div id="pc-lead-title">Share your contact for faster support (optional)</div><div id="pc-lead-row"><input id="pc-lead-name" type="text" placeholder="Your name"/><input id="pc-lead-phone" type="tel" placeholder="Phone"/><button id="pc-lead-submit">Save</button></div></div>'
+'<div id="pc-footer"><input id="pc-input" type="text" placeholder="Ask about products, delivery, clinics..."/><button id="pc-send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div>'
+'<div id="pc-brand">Powered by Claude AI · Pet Corner</div>';

var msgs=document.getElementById('pc-msgs');
var inp=document.getElementById('pc-input');
var dot=document.getElementById('pc-dot');
var promptsEl=document.getElementById('pc-prompts');

function timeStr(){var d=new Date();return d.getHours()+':'+String(d.getMinutes()).padStart(2,'0');}

function addMsg(t,r,noMeta){
  var el=document.createElement('div');
  el.className='pc-m '+r;
  el.textContent=t;
  msgs.appendChild(el);
  if(!noMeta){var m=document.createElement('div');m.className='pc-meta'+(r==='user'?' um':'');m.textContent=timeStr();msgs.appendChild(m);}
  msgs.scrollTop=msgs.scrollHeight;
}

function addSys(t){var el=document.createElement('div');el.className='pc-m system';el.textContent=t;msgs.appendChild(el);msgs.scrollTop=msgs.scrollHeight;}

function showTyping(){var el=document.createElement('div');el.id='pc-typing';el.innerHTML='<span></span><span></span><span></span>';msgs.appendChild(el);msgs.scrollTop=msgs.scrollHeight;}
function hideTyping(){var el=document.getElementById('pc-typing');if(el)el.remove();}

function showPrompts(){
  promptsEl.innerHTML='';
  PROMPTS.forEach(function(p){
    var btn=document.createElement('button');
    btn.className='pc-prompt';btn.textContent=p;
    btn.onclick=function(){promptsEl.style.display='none';sendMsg(p);};
    promptsEl.appendChild(btn);
  });
  promptsEl.style.display='flex';
}

function sendMsg(t){
  promptsEl.style.display='none';
  addMsg(t,'user');
  hist.push({role:'user',content:t});
  showTyping();
  // Show lead form after 2nd message
  if(hist.length===3 && !leadCaptured){
    var ls=document.getElementById('pc-lead-section');
    if(ls)ls.style.display='block';
  }
  fetch(CHAT_URL+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:hist})})
    .then(function(r){return r.json();})
    .then(function(d){hideTyping();addMsg(d.reply,'bot');hist.push({role:'assistant',content:d.reply});if(hist.length<8)showPrompts();})
    .catch(function(){hideTyping();addMsg('Connection issue. Please try again!','bot');});
}

function doSend(){var t=inp.value.trim();if(!t)return;inp.value='';sendMsg(t);}

// Opening messages sequence
setTimeout(function(){
  var delay=0;
  OPENING_MSGS.forEach(function(m,i){
    setTimeout(function(){
      if(i>0){showTyping();setTimeout(function(){hideTyping();addMsg(m,'bot',i<OPENING_MSGS.length-1);if(i===OPENING_MSGS.length-1)showPrompts();},500);}
      else{addMsg(m,'bot',true);}
    },delay);
    delay+=900;
  });
  if(!isOpen)dot.style.display='block';
},800);

document.getElementById('pc-book-btn').addEventListener('click',function(){window.open(BOOKING_URL,'_blank');addSys('Opening grooming booking page for you!');});
document.getElementById('pc-human-btn').addEventListener('click',function(){addSys('Connecting you with a human agent via WhatsApp...');setTimeout(function(){window.open(WHATSAPP_URL,'_blank');},600);});
document.getElementById('pc-close').addEventListener('click',function(){isOpen=false;win.classList.remove('open');});
document.getElementById('pc-send').addEventListener('click',doSend);
inp.addEventListener('keydown',function(e){if(e.key==='Enter')doSend();});

// Lead form submit
var leadSubmit=document.getElementById('pc-lead-submit');
if(leadSubmit){
  leadSubmit.addEventListener('click',function(){
    var nm=document.getElementById('pc-lead-name').value.trim();
    var ph=document.getElementById('pc-lead-phone').value.trim();
    if(nm||ph){
      leadCaptured=true;
      document.getElementById('pc-lead-section').style.display='none';
      addSys('Thanks '+nm+'! Our team may reach out if needed.');
    }
  });
}

bubble.addEventListener('click',function(){isOpen=!isOpen;win.classList.toggle('open',isOpen);dot.style.display='none';if(isOpen)setTimeout(function(){inp.focus();},100);});
})();
