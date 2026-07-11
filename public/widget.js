(function(){
'use strict';
var CHAT_URL='https://petcorner-chatbot.vercel.app';
var BOOKING_URL='https://petcornerdubai.com/grooming';
var WHATSAPP_URL='https://wa.me/97144566432';
var PROACTIVE_DELAY=8000;
var PROACTIVE_MSG='Hi there! Need help finding the perfect product for your pet? I can answer instantly!';

var PROMPTS=[
'What dog food brands do you have?',
'Do you offer 15-minute delivery?',
'Book a grooming appointment',
'Where are your store locations?',
'Tell me about vet clinics',
'Cat food and accessories?',
'Pet pharmacy products'
];
var OPENING_MSGS=[
'Hi! Welcome to Pet Corner! 🐾',
'I can help with products, grooming, vet clinics, 15-min delivery & more!',
'What can I help you with today?'
];

var SESSION_ID=sessionStorage.getItem('pc_sid');
if(!SESSION_ID){SESSION_ID='sid_'+Date.now()+'_'+Math.random().toString(36).substr(2,9);sessionStorage.setItem('pc_sid',SESSION_ID);}
var PAGE_TITLE=document.title||'';
var PAGE_URL=window.location.href||'';

var hist=[],isOpen=false,leadCaptured=false,proactiveDone=false,userMsgCount=0,ratingGiven={};
try{hist=JSON.parse(sessionStorage.getItem('pc_hist')||'[]');}catch(e){hist=[];}
userMsgCount=hist.filter(function(m){return m.role==='user';}).length;

function saveConv(extra){
try{sessionStorage.setItem('pc_hist',JSON.stringify(hist));}catch(e){}
var p={sessionId:SESSION_ID,pageUrl:PAGE_URL,pageTitle:PAGE_TITLE};
if(hist.length)p.messages=hist;
if(extra)Object.assign(p,extra);
fetch(CHAT_URL+'/api/save-conversation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}).catch(function(){});
}

function renderMd(txt){
if(!txt)return '';
txt=txt.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
txt=txt.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
txt=txt.replace(/\*(.+?)\*/g,'<em>$1</em>');
txt=txt.replace(/`(.+?)`/g,'<code style="background:#f4f4f4;padding:1px 4px;border-radius:3px;font-size:12px;font-family:monospace">$1</code>');
txt=txt.replace(/^#{1,3} (.+)$/gm,'<strong style="display:block;margin:4px 0 2px">$1</strong>');
txt=txt.replace(/^[\-\*] (.+)$/gm,'<span style="display:block;padding-left:12px;position:relative"><span style="position:absolute;left:4px">•</span>$1</span>');
txt=txt.replace(/\n{2,}/g,'<br><br>');
txt=txt.replace(/\n/g,'<br>');
return txt;
}

var s=document.createElement('style');
s.textContent=
'#pc-proactive{position:fixed;bottom:100px;right:24px;z-index:2147483646;background:white;border-radius:16px 16px 4px 16px;padding:12px 16px;max-width:240px;box-shadow:0 4px 20px rgba(0,0,0,.15);font-size:13px;color:#333;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,system-ui,sans-serif;display:none;animation:pcSlide .3s ease;cursor:pointer;border:1px solid rgba(232,93,38,.15);line-height:1.5;}'
+'#pc-proactive:hover{box-shadow:0 6px 24px rgba(232,93,38,.25)}'
+'#pc-proactive-x{float:right;margin:-4px -4px 0 8px;color:#bbb;font-size:15px;line-height:1;cursor:pointer;padding:0 2px}'
+'#pc-proactive-x:hover{color:#999}'
+'@keyframes pcSlide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}'
+'#pc-bubble{position:fixed;bottom:24px;right:24px;z-index:2147483647;width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#E85D26,#FF8C42);cursor:pointer;box-shadow:0 4px 20px rgba(232,93,38,.45);display:flex;align-items:center;justify-content:center;transition:transform .2s;border:none;outline:none;}'
+'#pc-bubble:hover{transform:scale(1.08)}'
+'#pc-badge{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;background:#ef4444;border-radius:9px;border:2px solid white;display:none;align-items:center;justify-content:center;font-size:10px;color:white;font-weight:700;font-family:-apple-system,sans-serif;padding:0 3px;box-sizing:border-box;}'
+'#pc-win{position:fixed;bottom:100px;right:24px;z-index:2147483647;width:380px;height:620px;border-radius:18px;box-shadow:0 12px 48px rgba(0,0,0,.18);display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,system-ui,sans-serif;background:#fff;}'
+'#pc-win.open{display:flex}'
+'@media(max-width:500px){#pc-win{right:0!important;bottom:0!important;width:100%!important;height:100%!important;border-radius:0!important}#pc-bubble{bottom:16px;right:16px}#pc-proactive{right:16px}}'
+'#pc-head{background:linear-gradient(135deg,#E85D26,#FF8C42);padding:14px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0;}'
+'#pc-head-logo{width:44px;height:44px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.15)}'
+'#pc-head-info{flex:1}'
+'#pc-head-name{color:white;font-weight:700;font-size:15px}'
+'#pc-head-status{color:rgba(255,255,255,.9);font-size:12px;margin-top:3px;display:flex;align-items:center;gap:5px}'
+'#pc-status-dot{width:7px;height:7px;background:#4ade80;border-radius:50%;animation:pcPulse 2.5s infinite}'
+'@keyframes pcPulse{0%,100%{opacity:1}50%{opacity:.4}}'
+'#pc-head-acts{display:flex;gap:6px}'
+'.pc-head-btn{background:rgba(255,255,255,.2);border:none;color:white;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:background .15s}'
+'.pc-head-btn:hover{background:rgba(255,255,255,.38)}'
+'#pc-book-bar{background:rgba(232,93,38,.06);border-bottom:1px solid rgba(232,93,38,.12);padding:7px 14px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}'
+'#pc-book-btn{background:linear-gradient(135deg,#E85D26,#FF8C42);color:white;border:none;border-radius:20px;padding:5px 13px;font-size:12px;font-weight:600;cursor:pointer;transition:opacity .15s}'
+'#pc-book-btn:hover{opacity:.85}'
+'#pc-msgs{flex:1;overflow-y:auto;padding:14px 14px 8px;display:flex;flex-direction:column;gap:4px;background:#F4F5F7}'
+'#pc-msgs::-webkit-scrollbar{width:4px}'
+'#pc-msgs::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:4px}'
+'.pc-m{max-width:84%;padding:10px 14px;border-radius:18px;font-size:13.5px;line-height:1.6;word-wrap:break-word}'
+'.pc-m.bot{background:white;color:#1a1a2e;border-bottom-left-radius:4px;box-shadow:0 1px 6px rgba(0,0,0,.07);align-self:flex-start}'
+'.pc-m.user{background:linear-gradient(135deg,#E85D26,#FF8C42);color:white;border-bottom-right-radius:4px;align-self:flex-end}'
+'.pc-m.system{background:#fff8f0;color:#c2440a;border:1px solid #ffe0c8;border-radius:10px;align-self:center;font-size:12px;text-align:center;padding:7px 12px;max-width:90%}'
+'.pc-meta{font-size:10px;color:#bbb;margin-top:2px;align-self:flex-start;padding-left:2px;display:flex;align-items:center;gap:6px}'
+'.pc-meta.um{align-self:flex-end;padding-right:2px;padding-left:0}'
+'.pc-rate{display:inline-flex;gap:2px}'
+'.pc-rate-btn{background:none;border:none;cursor:pointer;font-size:12px;padding:1px 3px;border-radius:4px;opacity:.45;transition:opacity .15s,background .15s;line-height:1}'
+'.pc-rate-btn:hover,.pc-rate-btn.active{opacity:1;background:rgba(0,0,0,.06)}'
+'#pc-typing{display:flex;gap:5px;padding:12px 16px;background:white;border-radius:18px;border-bottom-left-radius:4px;align-self:flex-start;box-shadow:0 1px 6px rgba(0,0,0,.07);margin-top:4px}'
+'#pc-typing span{width:7px;height:7px;border-radius:50%;background:#E85D26;animation:pcb 1.2s infinite}'
+'#pc-typing span:nth-child(2){animation-delay:.2s}'
+'#pc-typing span:nth-child(3){animation-delay:.4s}'
+'@keyframes pcb{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}'
+'#pc-prompts{padding:8px 10px;display:flex;flex-wrap:wrap;gap:6px;background:#F4F5F7;border-top:1px solid rgba(0,0,0,.06);flex-shrink:0;max-height:80px;overflow-y:auto}'
+'.pc-prompt{background:white;border:1.5px solid rgba(232,93,38,.35);color:#E85D26;border-radius:20px;padding:5px 11px;font-size:12px;cursor:pointer;white-space:nowrap;font-weight:500;transition:all .15s}'
+'.pc-prompt:hover{background:#E85D26;color:white;border-color:#E85D26}'
+'#pc-human-bar{background:#fff8f0;border-top:1px solid #ffe0c8;padding:7px 14px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}'
+'#pc-human-bar span{font-size:12px;color:#a0522d;font-weight:500}'
+'#pc-human-btn{background:white;color:#E85D26;border:1.5px solid #E85D26;border-radius:20px;padding:5px 13px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}'
+'#pc-human-btn:hover{background:#E85D26;color:white}'
+'#pc-lead-section{padding:10px 12px;background:white;border-top:1px solid #f0f0f0;flex-shrink:0}'
+'#pc-lead-title{font-size:11px;color:#999;margin-bottom:6px;text-align:center}'
+'#pc-lead-row{display:flex;gap:6px}'
+'#pc-lead-row input{flex:1;border:1.5px solid #e8e0f0;border-radius:20px;padding:7px 12px;font-size:12.5px;outline:none;font-family:inherit;min-width:0;transition:border-color .15s}'
+'#pc-lead-row input:focus{border-color:#E85D26}'
+'#pc-lead-sub{background:linear-gradient(135deg,#E85D26,#FF8C42);color:white;border:none;border-radius:20px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}'
+'#pc-footer{padding:10px 12px;background:white;border-top:1px solid #eee;display:flex;gap:8px;align-items:center;flex-shrink:0}'
+'#pc-char-wrap{flex:1;position:relative}'
+'#pc-input{width:100%;box-sizing:border-box;border:1.5px solid #e8e0f0;border-radius:24px;padding:9px 42px 9px 16px;font-size:13.5px;outline:none;font-family:inherit;color:#1a1a2e;background:#fafafa;transition:border-color .15s,background .15s}'
+'#pc-input:focus{border-color:#E85D26;background:white}'
+'#pc-char-cnt{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:10px;color:#ccc;pointer-events:none}'
+'#pc-send{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#E85D26,#FF8C42);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .15s}'
+'#pc-send:hover{opacity:.85}'
+'#pc-send svg{width:17px;height:17px;fill:white}'
+'#pc-brand{text-align:center;font-size:10px;color:#ccc;padding:5px 0 4px;background:white}'
+'#pc-brand a{color:#bbb;text-decoration:none}'
+'#pc-brand a:hover{color:#E85D26}';
document.head.appendChild(s);

var proDiv=document.createElement('div');proDiv.id='pc-proactive';
proDiv.innerHTML='<span id="pc-proactive-x">&#x2715;</span>'+PROACTIVE_MSG;
document.body.appendChild(proDiv);
document.getElementById('pc-proactive-x').addEventListener('click',function(e){e.stopPropagation();proDiv.style.display='none';});
proDiv.addEventListener('click',function(){proDiv.style.display='none';openChat();});

var bubble=document.createElement('button');bubble.id='pc-bubble';
bubble.innerHTML='<div id="pc-badge"></div><span style="font-size:28px">🐾</span>';
document.body.appendChild(bubble);

var win=document.createElement('div');win.id='pc-win';document.body.appendChild(win);
win.innerHTML=
'<div id="pc-head"><div id="pc-head-logo">🐾</div><div id="pc-head-info"><div id="pc-head-name">Pet Corner Assistant</div><div id="pc-head-status"><span id="pc-status-dot"></span>Online · AI Agent</div></div><div id="pc-head-acts"><button class="pc-head-btn" id="pc-min" title="Minimize">&#x2013;</button><button class="pc-head-btn" id="pc-close" title="Close">&#x2715;</button></div></div>'
+'<div id="pc-book-bar"><span style="font-size:12px;color:#666;font-weight:500">📅 Book a grooming session</span><button id="pc-book-btn">📆 Book Now</button></div>'
+'<div id="pc-msgs"></div>'
+'<div id="pc-prompts" style="display:none"></div>'
+'<div id="pc-human-bar"><span>💬 Need a human agent?</span><button id="pc-human-btn">WhatsApp Us</button></div>'
+'<div id="pc-lead-section" style="display:none"><div id="pc-lead-title">✉️ Share your contact for faster support (optional)</div><div id="pc-lead-row"><input id="pc-lead-name" type="text" placeholder="Your name"/><input id="pc-lead-phone" type="tel" placeholder="Phone number"/><button id="pc-lead-sub">&#x2192;</button></div></div>'
+'<div id="pc-footer"><div id="pc-char-wrap"><input id="pc-input" type="text" placeholder="Ask about products, delivery, clinics..." maxlength="400"/><span id="pc-char-cnt"></span></div><button id="pc-send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div>'
+'<div id="pc-brand">Powered by <a href="https://petcorner-chatbot.vercel.app" target="_blank">Claude AI</a></div>';

var msgs=document.getElementById('pc-msgs');
var inp=document.getElementById('pc-input');
var badge=document.getElementById('pc-badge');
var promptsEl=document.getElementById('pc-prompts');
var charCnt=document.getElementById('pc-char-cnt');
var unread=0;

function ts(){var d=new Date();return d.getHours()+':'+String(d.getMinutes()).padStart(2,'0');}

function addMsg(t,r,noMeta,msgId){
var el=document.createElement('div');
el.className='pc-m '+r;
if(r==='bot'){el.innerHTML=renderMd(t);}else{el.textContent=t;}
msgs.appendChild(el);
if(!noMeta){
var m=document.createElement('div');
m.className='pc-meta'+(r==='user'?' um':'');
var rateHtml='';
if(r==='bot'&&msgId!==undefined){
rateHtml='<span class="pc-rate"><button class="pc-rate-btn" data-id="'+msgId+'" data-v="1" title="Helpful">&#x1F44D;</button><button class="pc-rate-btn" data-id="'+msgId+'" data-v="-1" title="Not helpful">&#x1F44E;</button></span>';
}
m.innerHTML='<span>'+ts()+'</span>'+rateHtml;
msgs.appendChild(m);
m.querySelectorAll('.pc-rate-btn').forEach(function(btn){
btn.addEventListener('click',function(){
var id=this.dataset.id;
if(ratingGiven[id])return;
ratingGiven[id]=this.dataset.v;
m.querySelectorAll('.pc-rate-btn').forEach(function(b){b.classList.remove('active');});
this.classList.add('active');
saveConv({rating:{msgId:id,value:this.dataset.v}});
});
});
}
if(!isOpen&&r==='bot'){unread++;badge.style.display='flex';badge.textContent=unread>9?'9+':unread;}
msgs.scrollTop=msgs.scrollHeight;
return el;
}

function addSys(t){var el=document.createElement('div');el.className='pc-m system';el.textContent=t;msgs.appendChild(el);msgs.scrollTop=msgs.scrollHeight;}
function showTyping(){var el=document.createElement('div');el.id='pc-typing';el.innerHTML='<span></span><span></span><span></span>';msgs.appendChild(el);msgs.scrollTop=msgs.scrollHeight;}
function hideTyping(){var el=document.getElementById('pc-typing');if(el)el.remove();}

function showPrompts(){
promptsEl.innerHTML='';
PROMPTS.forEach(function(p){
var btn=document.createElement('button');btn.className='pc-prompt';btn.textContent=p;
btn.onclick=function(){promptsEl.style.display='none';sendMsg(p);};
promptsEl.appendChild(btn);
});
promptsEl.style.display='flex';
}

function sendMsg(t){
promptsEl.style.display='none';
addMsg(t,'user');
hist.push({role:'user',content:t});
userMsgCount++;
showTyping();
if(userMsgCount===3&&!leadCaptured){document.getElementById('pc-lead-section').style.display='block';}
saveConv();
fetch(CHAT_URL+'/api/chat',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({messages:hist,pageUrl:PAGE_URL,pageTitle:PAGE_TITLE})
})
.then(function(r){return r.json();})
.then(function(d){
hideTyping();
var idx=hist.length;
addMsg(d.reply,'bot',false,idx);
hist.push({role:'assistant',content:d.reply});
saveConv();
if(hist.length<16)showPrompts();
})
.catch(function(){hideTyping();addMsg('Connection issue — please try again!','bot');});
}

function doSend(){var t=inp.value.trim();if(!t)return;inp.value='';charCnt.textContent='';sendMsg(t);}

inp.addEventListener('input',function(){var l=inp.value.length;charCnt.textContent=l>300?l+'/400':'';});
inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();doSend();}});

function startSession(){
saveConv({event:'session_started'});
if(hist.length){
hist.forEach(function(m,i){addMsg(m.content,m.role==='user'?'user':'bot',false,m.role==='assistant'?i:undefined);});
showPrompts();
return;
}
var delay=0;
OPENING_MSGS.forEach(function(m,i){
setTimeout(function(){
if(i>0){showTyping();setTimeout(function(){hideTyping();addMsg(m,'bot',i<OPENING_MSGS.length-1);if(i===OPENING_MSGS.length-1)showPrompts();},600);}
else{addMsg(m,'bot',true);}
},delay);
delay+=1000;
});
}

setTimeout(function(){
if(!proactiveDone&&!isOpen){
proDiv.style.display='block';proactiveDone=true;
badge.style.display='flex';badge.textContent='1';unread=1;
setTimeout(function(){if(!isOpen)proDiv.style.display='none';},12000);
}
},PROACTIVE_DELAY);

var sessionStarted=false;
function openChat(){
isOpen=true;win.classList.add('open');
badge.style.display='none';unread=0;proDiv.style.display='none';
setTimeout(function(){inp.focus();},100);
if(!sessionStarted){sessionStarted=true;startSession();}
}

document.getElementById('pc-book-btn').addEventListener('click',function(){window.open(BOOKING_URL,'_blank');addSys('Opening grooming booking page!');saveConv({event:'booking_clicked'});});
document.getElementById('pc-human-btn').addEventListener('click',function(){addSys('Connecting you via WhatsApp...');saveConv({event:'human_handover'});setTimeout(function(){window.open(WHATSAPP_URL,'_blank');},600);});
document.getElementById('pc-close').addEventListener('click',function(){isOpen=false;win.classList.remove('open');saveConv({event:'chat_closed'});});
document.getElementById('pc-min').addEventListener('click',function(){isOpen=false;win.classList.remove('open');});
document.getElementById('pc-send').addEventListener('click',doSend);
document.getElementById('pc-lead-sub').addEventListener('click',function(){
var nm=document.getElementById('pc-lead-name').value.trim();
var ph=document.getElementById('pc-lead-phone').value.trim();
if(nm||ph){
leadCaptured=true;
document.getElementById('pc-lead-section').style.display='none';
addSys('Thanks '+(nm||'!')+'! Our team may reach out if needed.');
saveConv({lead:{name:nm,phone:ph},event:'lead_captured'});
}
});
bubble.addEventListener('click',function(){if(isOpen){isOpen=false;win.classList.remove('open');}else{openChat();}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&isOpen){isOpen=false;win.classList.remove('open');}});
})();
