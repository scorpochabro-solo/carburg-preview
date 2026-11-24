'use strict';
const menu=document.getElementById('menu'),nav=document.getElementById('nav');
function setNav(open){nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню')}
menu.onclick=()=>setNav(!nav.classList.contains('open'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){setNav(false);menu.focus()}});
document.querySelectorAll('.directory a').forEach(a=>{if(a.pathname===location.pathname)a.setAttribute('aria-current','page')});
const catalogue=document.getElementById('catalogue');
if(catalogue){
  const market=document.getElementById('market'), list=document.getElementById('listings'), status=document.getElementById('catalogue-status');
  const elem=(tag,text)=>{const el=document.createElement(tag);if(text)el.textContent=text;return el};
  function listing(car){
    const article=elem('article'),pics=elem('div');article.className='listing';pics.className='listing-pics';
    for(const src of Array.isArray(car.images)?car.images:[]){
      try{
        const url=new URL(src,new URL('../',location.href));
        if(!['https:','http:'].includes(url.protocol))continue;
        const a=elem('a'),i=elem('img');a.href=url.href;i.src=url.href;i.alt=car.title;i.loading='lazy';a.append(i);pics.append(a);
      }catch{continue}
    }
    article.append(pics,elem('h2',car.title),elem('p',[car.year,car.mileage,car.engine,car.power,car.gearbox,car.color].filter(Boolean).join(' · ')),elem('p',car.desc),elem('p',[car.badge,car.price].filter(Boolean).join(' · ')));
    const a=elem('a','Уточнить в Telegram ↗');a.className='pill primary';a.href='https://t.me/carburg_echteautos';article.append(a);return article;
  }
  let cars=[];
  function render(){const filtered=cars.filter(c=>market.value==='all'||c.country===market.value);list.replaceChildren(...filtered.map(listing));status.textContent=filtered.length?'Найдено: '+filtered.length:market.value==='all'?'В этом каталоге пока нет опубликованных автомобилей. Напишите нам для индивидуального подбора.':'Для выбранного рынка пока нет опубликованных автомобилей.'}
  async function load(){
    market.disabled=true;status.textContent='Загружаем каталог…';
    try{const r=await fetch(catalogue.dataset.feed,{cache:'no-cache'});if(!r.ok)throw Error();const data=await r.json();if(!Array.isArray(data))throw Error();cars=data.filter(c=>c&&typeof c.title==='string');market.disabled=false;render()}
    catch{status.textContent='Не удалось загрузить каталог. ';const retry=elem('button','Повторить');retry.className='pill primary';retry.onclick=load;status.append(retry)}
  }
  market.onchange=render;load();
}
