/* The scrapbook logic: pages, themes, music, quiz, editing. */
(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const KEY='scrapbook-romance-v1';
let theme='night';try{const t=localStorage.getItem('scrapbook-theme');if(t==='rose'||t==='night')theme=t}catch(e){}
function conv(hex){
  const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;
  if(d===0)return hex;
  const sat=d/(1-Math.abs(2*l-1));
  if(sat<.12)return hex;
  let h;if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h=(h*60+360)%360;
  let nh,ns;
  if(h>=300||h<=20){nh=220;ns=Math.min(1,sat*.72)}
  else if(h>20&&h<=60){if(sat<.45&&l>.85)return hex;nh=44;ns=sat*.5}
  else return hex;
  const q=l<.5?l*(1+ns):l+ns-l*ns,p=2*l-q;
  const f=t=>{t=(t+1)%1;if(t<1/6)return p+(q-p)*6*t;if(t<.5)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p};
  const H=nh/360,to=x=>Math.round(x*255).toString(16).padStart(2,'0');
  return '#'+to(f(H+1/3))+to(f(H))+to(f(H-1/3));
}
const C=h=>theme==='night'?conv(h):h;
let buildBulbs=function(){};
const SVGATTR=['fill','stroke','stop-color'];
$$('svg *').forEach(el=>{SVGATTR.forEach(a=>{const v=el.getAttribute(a);if(v&&/^#[0-9a-fA-F]{6}$/.test(v))el.dataset['o'+a.replace('-','')]=v})});
function paintSvg(){$$('svg *').forEach(el=>{SVGATTR.forEach(a=>{const o=el.dataset['o'+a.replace('-','')];if(o)el.setAttribute(a,C(o))})})}
const THEMETXT={rose:{cvSub:'A little world made of us',cdSub:'Every second brings us closer.'},night:{cvSub:'A little jazz club of memories, made of us',cdSub:'It is only a matter of time.'}};
let state={text:{},photos:{},lists:{},au:'Sydney',target:'',canEdit:false};
try{const s=JSON.parse(localStorage.getItem(KEY)||'null'); if(s) state=Object.assign(state,s);}catch(e){}
let editing=false, saveT;
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',3200)}
function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){toast('Storage is full. Fewer or smaller photos will fit.')}},300)}

/* ---------- static text ---------- */
$$('[data-k]').forEach(el=>{const k=el.dataset.k;const v=state.text[k]!==undefined?state.text[k]:TEXTDEF[k];if(v!==undefined)el.textContent=v;});

/* ---------- lists ---------- */
function carTpl(it){const a=CARS[it.car]||[];return `<div class="photo tall car has" data-car="${it.car}" data-idx="0"><button class="car-btn prev" type="button" data-car-nav="-1" aria-label="Previous screenshot">&#8249;</button><button class="car-btn next" type="button" data-car-nav="1" aria-label="Next screenshot">&#8250;</button><span class="car-dots">${a.map((_,k)=>`<i class="${k?'':'on'}"></i>`).join('')}</span></div>`}
const linesTpl=it=>`<span data-f="t">${esc(it.t)}</span>`;
const LISTS={
 memories:{el:'#l-memories',blank:()=>({id:Date.now(),date:'Add a date',cap:'Write a caption.'}),cls:()=>'pola',
   tpl:it=>`${it.car?carTpl(it):`<div class="photo${it.tall?' tall':''}" data-p="mem-${it.id}" data-src="${esc(it.img||'')}"></div>`}<p class="cap" data-f="cap">${esc(it.cap)}</p><span class="date" data-f="date">${esc(it.date)}</span>`},
 chat:{el:'#l-chat',blank:b=>({who:(b&&b.dataset.who)||'her',text:'New message'}),cls:it=>'bubble '+it.who,
   tpl:it=>`<span data-f="text">${esc(it.text)}</span><button class="swap" data-swap type="button">switch sender</button>`},
 reasons:{el:'#l-reasons',blank:()=>({t:'Another reason.'}),cls:()=>'reason',tpl:linesTpl},
 says:{el:'#l-says',blank:()=>({t:'New line'}),tpl:linesTpl},
 habits:{el:'#l-habits',blank:()=>({t:'New line'}),tpl:linesTpl},
 favs:{el:'#l-favs',blank:()=>({t:'New line'}),tpl:linesTpl},
 ordinary:{el:'#l-ordinary',blank:()=>({t:'New line'}),tpl:linesTpl},
 timeline:{el:'#l-timeline',blank:()=>({date:'Month, Year',title:'A new moment',text:'What happened.'}),
   tpl:it=>`<div class="tl-date" data-f="date">${esc(it.date)}</div><div class="tl-body"><h3 data-f="title">${esc(it.title)}</h3><p data-f="text">${esc(it.text)}</p></div>`},
 someday:{el:'#l-someday',blank:()=>({t:'Someday, we will…'}),tpl:linesTpl},
 jar:{el:'#l-jar',blank:()=>({t:'A new love note'}),tpl:linesTpl},
 env:{el:'#l-env',blank:()=>({label:'Open when…',text:'Write the letter.'}),cls:()=>'env',
   tpl:it=>`<div class="env-head" role="button" tabindex="0" aria-expanded="false" data-env data-f="label">${esc(it.label)}</div><div class="env-letter"><div><p data-f="text">${esc(it.text)}</p></div></div>`},
 gloss:{el:'#l-gloss',blank:()=>({term:'New term',def:'What it means.'}),cls:()=>'gl',
   tpl:it=>`<b data-f="term">${esc(it.term)}</b><span class="d" data-f="def">${esc(it.def)}</span>`},
 songs:{el:'#l-songs',blank:()=>({title:'A song',note:'Why it is ours.'}),cls:()=>'song',
   tpl:it=>`<div><b data-f="title">${esc(it.title)}</b><span class="d" data-f="note">${esc(it.note)}</span></div>`}
};
const list=n=>state.lists[n]||DEF[n];
const mutable=n=>state.lists[n]||(state.lists[n]=JSON.parse(JSON.stringify(DEF[n])));
function render(n){
  const spec=LISTS[n], el=$(spec.el); el.dataset.list=n;
  el.innerHTML=list(n).map((it,i)=>{
    const c=typeof spec.cls==='function'?spec.cls(it):'';
    return `<div class="item ${c}" data-i="${i}">${spec.tpl(it,i)}<button class="del" data-del type="button" aria-label="Remove">&times;</button></div>`;
  }).join('');
  paintPhotos(); applyEdit();
}

/* ---------- photos ---------- */
function paintCars(){$$('.photo.car').forEach(el=>{const a=CARS[el.dataset.car]||[],i=+el.dataset.idx||0;if(a[i])el.style.backgroundImage=`url("${a[i]}")`;$$('.car-dots i',el).forEach((d,k)=>d.classList.toggle('on',k===i))})}
function paintPhotos(){
  paintCars();
  $$('.photo[data-p]').forEach(el=>{
    const src=state.photos[el.dataset.p]||el.dataset.src;
    if(src){el.style.backgroundImage=`url("${src}")`;el.classList.add('has')}
    else{el.style.backgroundImage='';el.classList.remove('has')}
  });
}
let photoTarget=null;
function resize(file){
  return new Promise((res,rej)=>{
    const r=new FileReader();r.onerror=rej;
    r.onload=()=>{const img=new Image();img.onerror=rej;img.onload=()=>{
      const M=900,k=Math.min(1,M/Math.max(img.width,img.height));
      const c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.74));
    };img.src=r.result};
    r.readAsDataURL(file);
  });
}
$('#file').addEventListener('change',async e=>{
  const f=e.target.files[0]; e.target.value=''; if(!f||!photoTarget) return;
  try{state.photos[photoTarget]=await resize(f);paintPhotos();save()}catch(err){toast('That image could not be read.')}
});

/* ---------- edit mode ---------- */
function applyEdit(){
  $$('[data-k],[data-f]').forEach(el=>{
    if(editing){el.setAttribute('contenteditable','plaintext-only');if(el.contentEditable!=='plaintext-only')el.setAttribute('contenteditable','true')}
    else el.removeAttribute('contenteditable');
  });
  $('#target').disabled=!editing;
}
function setEditing(v){editing=v;document.body.classList.toggle('editing',v);$('#editBtn').textContent=v?'Done':'Edit';applyEdit();countdown();if(!v)quizReset()}
function allowEdit(){state.canEdit=true;document.body.classList.add('can-edit');save()}
if(state.canEdit||/#edit/.test(location.hash)) document.body.classList.add('can-edit');
$('#editBtn').addEventListener('click',()=>setEditing(!editing));
document.addEventListener('keydown',e=>{if(e.shiftKey&&e.key==='E'&&!e.target.isContentEditable){allowEdit();setEditing(true)}});
let taps=0,tapT;
$('#leaf').addEventListener('click',()=>{taps++;clearTimeout(tapT);tapT=setTimeout(()=>taps=0,1500);if(taps>=3){taps=0;allowEdit();toast('Edit mode unlocked. Use the button at the top.')}});

/* ---------- hearts ---------- */
function burst(x,y,n){
  if(reduce) return;
  const cols=['#D9607A','#C2415F','#F1B5BE','#E8708A','#EBD3B0'].map(C);
  for(let i=0;i<n;i++){
    const h=document.createElement('span');h.className='fh';
    h.innerHTML='<svg viewBox="0 0 24 24"><use href="#heart"/></svg>';
    const a=Math.random()*Math.PI*2, d=(n>3?40+Math.random()*130:30+Math.random()*30);
    h.style.cssText=`left:${x}px;top:${y}px;--s:${12+Math.random()*18}px;--c:${cols[i%cols.length]};--d:${1.6+Math.random()*1.2}s;--dx:${Math.cos(a)*d}px;--dy:${n>3?Math.sin(a)*d-40:-90-Math.random()*60}px;--r:${(Math.random()*60-30)|0}deg`;
    document.body.appendChild(h);setTimeout(()=>h.remove(),3200);
  }
}
document.addEventListener('click',e=>{
  if(editing||e.target.closest('#editBtn,#themeBtn,#musicBtn,.ch-card,.arrow,.chip,#seal,#love,input,select,textarea')) return;
  burst(e.clientX,e.clientY,1);
});

/* ---------- delegated events ---------- */
document.addEventListener('input',e=>{
  const t=e.target; if(!(t instanceof HTMLElement)) return;
  if(t.dataset.k){state.text[t.dataset.k]=t.textContent;save();return}
  if(t.dataset.f){
    const item=t.closest('.item'),box=t.closest('[data-list]'); if(!item||!box) return;
    mutable(box.dataset.list)[+item.dataset.i][t.dataset.f]=t.textContent;save();
  }
});
document.addEventListener('click',e=>{
  const t=e.target;
  const add=t.closest('[data-add]');
  if(add){const n=add.dataset.add;mutable(n).push(LISTS[n].blank(add));save();render(n);const last=$$('.item',$(LISTS[n].el)).pop();last&&last.scrollIntoView({block:'center',behavior:'smooth'});return}
  const del=t.closest('[data-del]');
  if(del){const item=del.closest('.item'),n=item.parentElement.dataset.list;mutable(n).splice(+item.dataset.i,1);save();render(n);return}
  const sw=t.closest('[data-swap]');
  if(sw){const item=sw.closest('.item'),it=mutable('chat')[+item.dataset.i];it.who=it.who==='me'?'her':'me';save();render('chat');return}
  const ph=t.closest('.photo[data-p]');
  if(ph){
    if(editing){photoTarget=ph.dataset.p;$('#file').click()}
    else if(ph.classList.contains('has')){$('#lb img').src=state.photos[ph.dataset.p]||ph.dataset.src;$('#lb').classList.add('on')}
    return;
  }
  const env=t.closest('[data-env]');
  if(env&&!editing){const box=env.parentElement;const o=box.classList.toggle('open');env.setAttribute('aria-expanded',o)}
});
document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('[data-env]')&&!editing){e.preventDefault();e.target.click()}
  if(e.key==='Escape')$('#lb').classList.remove('on');
});
$('#lb').addEventListener('click',()=>$('#lb').classList.remove('on'));

/* ---------- screenshot carousel ---------- */
function carGo(el,d){const a=CARS[el.dataset.car]||[];if(!a.length)return;el.dataset.idx=((+el.dataset.idx||0)+d+a.length)%a.length;paintCars()}
document.addEventListener('click',e=>{
  const nav=e.target.closest('[data-car-nav]');
  if(nav){carGo(nav.closest('.car'),+nav.dataset.carNav);return}
  const car=e.target.closest('.car');
  if(car&&!editing){const a=CARS[car.dataset.car]||[];$('#lb img').src=a[+car.dataset.idx||0];$('#lb').classList.add('on')}
});
let carX=null;
document.addEventListener('touchstart',e=>{const c=e.target.closest&&e.target.closest('.car');carX=c?e.touches[0].clientX:null},{passive:true});
document.addEventListener('touchend',e=>{if(carX===null)return;const c=e.target.closest&&e.target.closest('.car');const dx=e.changedTouches[0].clientX-carX;carX=null;if(c&&Math.abs(dx)>40)carGo(c,dx<0?1:-1)},{passive:true});

/* ---------- chat screenshots ---------- */
let si=0;
function shotDraw(){$('#shotImg').src=SHOTS[si];$('#shotCount').textContent=(si+1)+' of '+SHOTS.length}
function shotGo(d){si=(si+d+SHOTS.length)%SHOTS.length;shotDraw()}
$('#shotPrev').addEventListener('click',e=>{e.stopPropagation();shotGo(-1)});
$('#shotNext').addEventListener('click',e=>{e.stopPropagation();shotGo(1)});
$('#shotImg').addEventListener('click',()=>{if(editing)return;$('#lb img').src=SHOTS[si];$('#lb').classList.add('on')});
let shX=null;
$('#shotStage').addEventListener('touchstart',e=>{shX=e.touches[0].clientX},{passive:true});
$('#shotStage').addEventListener('touchend',e=>{if(shX===null)return;const dx=e.changedTouches[0].clientX-shX;shX=null;if(Math.abs(dx)>40)shotGo(dx<0?1:-1)},{passive:true});
shotDraw();

/* ---------- pages ---------- */
const pages=$$('.page'); let cur=0;
const chips=$('#chips');
pages.forEach((p,i)=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=p.dataset.title;b.addEventListener('click',()=>go(i));chips.appendChild(b)});
function go(n){
  if(n<0||n>=pages.length||n===cur) return;
  const dir=n>cur?1:-1;
  pages[cur].classList.remove('on');
  pages[n].style.setProperty('--dx',(dir*40)+'px');pages[n].style.setProperty('--rot',(dir*1.1)+'deg');
  pages[n].classList.add('on');
  cur=n;document.body.dataset.page=n;
  $('#sheet').classList.toggle('is-cover',n===0);
  $$('.chip').forEach((c,i)=>i===n?c.setAttribute('aria-current','page'):c.removeAttribute('aria-current'));
  $('#prev').disabled=n===0;$('#next').disabled=n===pages.length-1;
  const active=$('.chip[aria-current]');active&&active.scrollIntoView({inline:'center',block:'nearest'});
  window.scrollTo({top:0,behavior:'smooth'});
}
$('#prev').addEventListener('click',()=>go(cur-1));
$('#next').addEventListener('click',()=>go(cur+1));
$('#open').addEventListener('click',()=>go(1));
document.addEventListener('keydown',e=>{
  if(e.target.isContentEditable||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  if(e.key==='ArrowRight')go(cur+1);
  if(e.key==='ArrowLeft')go(cur-1);
});
let sx=null;
$('#sheet').addEventListener('touchstart',e=>{sx=(e.target.closest&&e.target.closest('.car,.shots'))?null:e.touches[0].clientX},{passive:true});
$('#sheet').addEventListener('touchend',e=>{if(sx===null||editing||cur===0)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>70)go(cur+(dx<0?1:-1))},{passive:true});
$('#prev').disabled=true;

/* ---------- envelope ---------- */
$('#seal').addEventListener('click',e=>{
  const env=$('#envelope');if(env.classList.contains('opened'))return;
  env.classList.add('opened');startMusic();
  const r=$('#seal').getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,30);
  $('#hint').style.opacity='0';
  setTimeout(()=>{$('#open').classList.add('show')},reduce?0:1500);
});
$('#love').addEventListener('click',e=>{const r=e.currentTarget.getBoundingClientRect();burst(r.left+r.width/2,r.top,34)});

/* ---------- clocks ---------- */
const AU={Sydney:'Australia/Sydney',Melbourne:'Australia/Melbourne',Brisbane:'Australia/Brisbane',Perth:'Australia/Perth',Adelaide:'Australia/Adelaide',Canberra:'Australia/Sydney',Hobart:'Australia/Hobart',Darwin:'Australia/Darwin'};
const sel=$('#auCity');
sel.innerHTML=Object.keys(AU).map(c=>`<option ${c===state.au?'selected':''}>${c}</option>`).join('');
sel.addEventListener('change',()=>{state.au=sel.value;save();tick()});
const hm=tz=>new Intl.DateTimeFormat([], {timeZone:tz,hour:'numeric',minute:'2-digit'}).format(new Date());
const hr=tz=>(+new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'numeric',hour12:false}).format(new Date()))%24;
const part=h=>h<5?'late night':h<12?'morning':h<17?'afternoon':h<21?'evening':'night';
const off=tz=>{const d=new Date();return Math.round((new Date(d.toLocaleString('en-US',{timeZone:tz}))-new Date(d.toLocaleString('en-US',{timeZone:'Asia/Beirut'})))/18e5)/2};
function tick(){
  try{
    const tz=AU[state.au]||AU.Sydney;
    $('#lbT').textContent=hm('Asia/Beirut');$('#lbW').textContent='my '+part(hr('Asia/Beirut'));
    $('#auT').textContent=hm(tz);$('#auW').textContent='your '+part(hr(tz));
    $('#auC').textContent=state.au;
    const o=off(tz);
    $('#diff').textContent=`${Math.abs(o)} hours apart, and still thinking of each other`;
  }catch(e){$('#diff').textContent=''}
}
tick();setInterval(tick,20000);

/* ---------- moon ---------- */
function moon(){
  const REF=Date.UTC(2000,0,6,18,14), SYN=29.530588853;
  const p=((((Date.now()-REF)/864e5)%SYN)+SYN)%SYN/SYN;
  const r=26,k=Math.cos(2*Math.PI*p)*r,ak=Math.abs(k).toFixed(2);
  let d;
  if(p<.5){d=`M0 ${-r} A${r} ${r} 0 0 1 0 ${r} A${ak} ${r} 0 0 ${k>0?0:1} 0 ${-r}Z`}
  else{d=`M0 ${-r} A${r} ${r} 0 0 0 0 ${r} A${ak} ${r} 0 0 ${k>0?1:0} 0 ${-r}Z`}
  const names=['new moon','waxing crescent','first quarter','waxing gibbous','full moon','waning gibbous','last quarter','waning crescent'];
  const idx=Math.floor(p*8+.5)%8;
  $('#moon').innerHTML=`<circle r="${r+14}" fill="${C('#FFE9C4')}" opacity=".16" filter="url(#glow)"/><circle r="${r}" fill="${C('#4A2438')}"/><path d="${d}" fill="${C('#FFF3DC')}"/>`;
  $('#moonN').textContent='Tonight: '+names[idx];
}
moon();

/* ---------- stars + lights + bokeh ---------- */
(function(){
  const g=$('#stars');let h='';
  for(let i=0;i<70;i++){const x=Math.random()*800,y=Math.random()*240,r=Math.random()*1.4+.4;
    h+=`<circle class="${i%5===0?'star':''}" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="#FFF3DC" opacity="${(Math.random()*.6+.3).toFixed(2)}" style="${i%5===0?'animation-delay:-'+(Math.random()*4).toFixed(1)+'s':''}"/>`}
  g.innerHTML=h;
  buildBulbs=function(){
    const path=$('#lp'),len=path.getTotalLength(),svg=$('#lights');$$('.bulb',svg).forEach(e=>e.remove());let b='';
    for(let i=1;i<=13;i++){const pt=path.getPointAtLength(len*i/14);
      b+=`<g class="bulb" style="animation-delay:-${(Math.random()*3).toFixed(1)}s"><circle cx="${pt.x.toFixed(1)}" cy="${(pt.y+10).toFixed(1)}" r="14" fill="${C('#FFD9A0')}" opacity=".45" filter="url(#glow)"/><ellipse cx="${pt.x.toFixed(1)}" cy="${(pt.y+9).toFixed(1)}" rx="5" ry="7" fill="${C('#FFE6B8')}"/></g>`}
    svg.insertAdjacentHTML('beforeend',b);
  };buildBulbs();
  const bk=$('#bokeh');
  for(let i=0;i<12;i++){const s=document.createElement('i');const w=70+Math.random()*150;
    s.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;width:${w}px;height:${w}px;animation-duration:${22+Math.random()*26}s;animation-delay:-${Math.random()*30}s;--bx:${(Math.random()*100-50)|0}px`;bk.appendChild(s)}
  const box=document.createElement('div');box.className='petals';box.setAttribute('aria-hidden','true');
  const cols=['#C2415F','#D9607A','#E8A0AB','#A2253F'];
  for(let i=0;i<18;i++){const p=document.createElement('span');p.className='petal';const w=9+Math.random()*10;
    p.style.cssText=`left:${Math.random()*100}%;width:${w}px;height:${w*1.25}px;background:${cols[i%4]};animation-duration:${12+Math.random()*10}s;animation-delay:-${Math.random()*20}s;--sw:${(Math.random()*80-30)|0}px`;box.appendChild(p)}
  for(let i=0;i<46;i++){const t=document.createElement('span');t.className='twk';const w=2+Math.random()*3;
    t.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;width:${w}px;height:${w}px;animation-delay:-${(Math.random()*4).toFixed(1)}s;animation-duration:${2.5+Math.random()*3}s`;box.appendChild(t)}
  $('#sheet').appendChild(box);
  if(reduce){const a=$('#dot animateMotion');a&&a.remove();$('#dot').setAttribute('transform','translate(400 70)')}
})();

/* ---------- countdown ---------- */
const tg=$('#target');tg.value=state.target||'';
tg.addEventListener('change',()=>{state.target=tg.value;save();countdown()});
function countdown(){
  const box=$('#count');
  if(!state.target){box.classList.add('empty');return}
  const t=new Date(state.target+'T00:00:00').getTime();
  const ms=t-Date.now();
  if(ms<=0){box.classList.add('empty');$('#cmsg').textContent='Today is the day.';return}
  box.classList.remove('empty');
  const s=Math.floor(ms/1000);
  $('#cdD').textContent=Math.floor(s/86400);$('#cdH').textContent=Math.floor(s%86400/3600);
  $('#cdM').textContent=Math.floor(s%3600/60);$('#cdS').textContent=s%60;
}
countdown();setInterval(countdown,1000);

/* ---------- jar ---------- */
let lastSlip=-1;
$('#pull').addEventListener('click',e=>{
  const l=list('jar').filter(x=>x.t&&x.t.trim());if(!l.length)return;
  let i;do{i=Math.floor(Math.random()*l.length)}while(l.length>1&&i===lastSlip);lastSlip=i;
  const s=$('#slip');s.classList.remove('pop');void s.offsetWidth;s.textContent=l[i].t;s.classList.add('pop');
  burst(e.clientX,e.clientY,6);
});

/* ---------- quiz ---------- */
LISTS.day={el:'#l-day',blank:()=>({t:'Another moment'}),tpl:linesTpl};
LISTS.quiz={el:'#l-quiz',cls:()=>'qq',
 blank:()=>({q:'New question',a0:'Option A',a1:'Option B',a2:'Option C',a3:'Option D',c:0,note:'A sweet line to show after she answers.'}),
 tpl:it=>`<div class="qlabel">Question</div><div class="qtext" data-f="q">${esc(it.q)}</div>`
  +[0,1,2,3].map(i=>`<div class="qopt${it.c===i?' ok':''}"><button class="mark" data-correct="${i}" type="button" aria-label="Mark as the correct answer">&#10003;</button><span data-f="a${i}">${esc(it['a'+i])}</span></div>`).join('')
  +`<div class="qlabel">Shown after she answers</div><div class="qnote" data-f="note">${esc(it.note)}</div>`};
let qi=0,qs=0,qans=null;
function qlist(){return list('quiz').filter(x=>x.q&&x.q.trim())}
function quizReset(){qi=0;qs=0;qans=null;quizDraw()}
function quizDraw(){
  const box=$('#quizPlay'),qz=qlist();
  if(!qz.length){box.innerHTML='<p class="qrm">No questions yet.</p>';return}
  if(qi>=qz.length){
    const n=qz.length,perfect=qs===n;
    const msg=perfect?'You know us by heart.':qs>=n/2?'So close. We will just have to make more memories to fill in the rest.':'Okay, we clearly need to talk more. I am happy to start right now.';
    box.innerHTML=`<div class="qscore">${qs} <span>of ${n}</span></div><p class="qrm">${esc(msg)}</p><button class="qnext" type="button" data-again>Play again</button>`;
    const r=box.getBoundingClientRect();burst(r.left+r.width/2,r.top+80,perfect?44:18);
    return;
  }
  const it=qz[qi];
  const opts=[0,1,2,3].filter(i=>(it['a'+i]||'').trim());
  const hearts=qz.map((_,k)=>`<svg class="qh ${k<qi?'done':k===qi?'now':''}" viewBox="0 0 24 24" aria-hidden="true"><use href="#heart"/></svg>`).join('');
  box.innerHTML=`<div class="qprog" role="img" aria-label="Question ${qi+1} of ${qz.length}">${hearts}</div><h3 class="qq-t">${esc(it.q)}</h3><div class="qopts">${opts.map(i=>`<button type="button" class="qo" data-pick="${i}">${esc(it['a'+i])}</button>`).join('')}</div><div class="qfb"></div>`;
}
$('#quizPlay').addEventListener('click',e=>{
  const qz=qlist(),box=$('#quizPlay');
  const pick=e.target.closest('[data-pick]');
  if(pick&&qans===null){
    const it=qz[qi],i=+pick.dataset.pick,ok=i===(it.c|0);
    qans=i;if(ok)qs++;
    $$('.qo',box).forEach(b=>{b.disabled=true;if(+b.dataset.pick===(it.c|0))b.classList.add('right');else if(b===pick)b.classList.add('wrong')});
    $('.qfb',box).innerHTML=`<p class="qmsg"><b>${ok?'Yes!':'Not quite.'}</b> ${esc(it.note||'')}</p><button class="qnext" type="button" data-next>${qi+1<qz.length?'Next question':'See my result'}</button>`;
    if(ok)burst(e.clientX,e.clientY,9);
    return;
  }
  if(e.target.closest('[data-next]')){qi++;qans=null;quizDraw();return}
  if(e.target.closest('[data-again]')){quizReset()}
});
document.addEventListener('click',e=>{
  const m=e.target.closest('[data-correct]');if(!m)return;
  const item=m.closest('.item');mutable('quiz')[+item.dataset.i].c=+m.dataset.correct;save();render('quiz');
});
$('#quizPlay').addEventListener('click',e=>e.stopPropagation&&0);

/* ---------- music (original piece, generated live in the browser) ---------- */
let audio=null,musicOn=false,musicStarted=false;
const SONGS={rose:'audio/elvis.mp3',night:'audio/laufey.mp3'};
function startMusic(){
  if(musicStarted)return;
  try{
    audio=new Audio(SONGS[theme]);audio.loop=true;audio.volume=0;
    audio.play().then(()=>{
      const fi=setInterval(()=>{if(audio.volume<.72){audio.volume=Math.min(.72,audio.volume+.04)}else clearInterval(fi)},80);
      musicStarted=true;musicOn=true;document.body.classList.add('music-ready');setMusicBtn();
    }).catch(()=>{});
  }catch(e){}
}
function crossfadeMusic(prev,t){
  if(!musicStarted||!audio)return;
  const fo=setInterval(()=>{
    if(audio.volume>0.04){audio.volume=Math.max(0,audio.volume-0.04)}
    else{clearInterval(fo);audio.pause();audio.src=SONGS[t];audio.volume=0;
      if(musicOn){audio.play().catch(()=>{});const fi=setInterval(()=>{if(audio.volume<.72)audio.volume=Math.min(.72,audio.volume+.04);else clearInterval(fi)},80)}}
  },80);
}
function setMusic(on){
  if(!audio)return;musicOn=on;
  if(on){audio.play().catch(()=>{});const fi=setInterval(()=>{if(audio.volume<.72)audio.volume=Math.min(.72,audio.volume+.04);else clearInterval(fi)},80)}
  else{const fo=setInterval(()=>{if(audio.volume>0.04)audio.volume=Math.max(0,audio.volume-0.04);else{clearInterval(fo);audio.pause();audio.volume=0}},80)}
  setMusicBtn();
}
function setMusicBtn(){const b=$('#musicBtn');b.textContent=musicOn?'\u266A Music on':'\u266A Music off';b.setAttribute('aria-pressed',musicOn)}

$('#musicBtn').addEventListener('click',()=>{if(!musicStarted)startMusic();else setMusic(!musicOn)});

/* ---------- boot ---------- */
function applyTheme(t){
  theme=t;
  $('#css-rose').media=t==='rose'?'all':'not all';
  $('#css-night').media=t==='night'?'all':'not all';
  document.documentElement.dataset.theme=t;
  try{localStorage.setItem('scrapbook-theme',t)}catch(e){}
  paintSvg();moon();buildBulbs();
  $$('[data-k]').forEach(el=>{const v=THEMETXT[t][el.dataset.k];if(v!==undefined&&state.text[el.dataset.k]===undefined)el.textContent=v});
  document.title=t==='night'?'For you, in blue':'For you, with all my love';
  const b=$('#themeBtn');b.textContent=t==='night'?'Rose look':'Midnight look';b.setAttribute('aria-label','Switch to the '+(t==='night'?'rose':'midnight')+' look');
}
function crossfadeMusic(prev,t){
  if(!AC||!musicStarted||!BUS[t])return;
  const now=AC.currentTime,o=BUS[prev],n=BUS[t];
  o.gain.cancelScheduledValues(now);n.gain.cancelScheduledValues(now);
  if(!musicOn){o.gain.value=0;n.gain.value=1}
  else{o.gain.setValueAtTime(o.gain.value,now);o.gain.linearRampToValueAtTime(0,now+2);n.gain.setValueAtTime(.0001,now);n.gain.linearRampToValueAtTime(1,now+2.6)}
  crossfadeMusic(prev,t);
}
let switching=false;
function setTheme(t,init){
  if(init){applyTheme(t);return}
  if(t===theme||switching)return;
  const prev=theme;
  if(reduce){applyTheme(t);crossfadeMusic(prev,t);return}
  switching=true;
  const veil=$('#veil');
  veil.style.background=t==='night'?'radial-gradient(ellipse at 50% 40%,#1B2D5A,#0A1230)':'radial-gradient(ellipse at 50% 40%,#5A1B36,#1A060F)';
  veil.classList.add('on');
  setTimeout(()=>{applyTheme(t);crossfadeMusic(prev,t);veil.classList.remove('on');setTimeout(()=>{switching=false},600)},600);
}
$('#themeBtn').addEventListener('click',()=>setTheme(theme==='night'?'rose':'night'));
setTheme(theme,true);
const chEl=$('#chooser');
$$('.ch-card').forEach(b=>b.addEventListener('click',()=>{
  applyTheme(b.dataset.theme);chEl.classList.add('gone');
  setTimeout(()=>{chEl.style.display='none'},reduce?0:900);
}));
setTimeout(()=>{const f=$('.ch-card');f&&f.focus({preventScroll:true})},60);
Object.keys(LISTS).forEach(render);
quizDraw();
paintPhotos();applyEdit();
$$('.chip')[0].setAttribute('aria-current','page');
})();
