'use strict';
const byId = id => document.getElementById(id);
const pad = n => String(n).padStart(2,'0');
const cycle = (i,n) => (i % n + n) % n;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let reviewIndex=0;
let album=[], albumIndex=0;
const dlg=byId('viewer');
function createButton(label, action) {
  const btn=document.createElement('button');
  btn.type='button';
  btn.setAttribute('aria-label',label);
  btn.addEventListener('click',action);
  return btn;
}
function image(src,alt,lazy=false) {
  const img=document.createElement('img');
  img.alt=alt;
  if(lazy) img.loading='lazy';
  img.src=src;
  return img;
}
function bindSwipe(el,move) {
  let start;
  el.addEventListener('touchstart',e=>{start=e.touches.length===1?[e.touches[0].clientX,e.touches[0].clientY]:null},{passive:true});
  el.addEventListener('touchcancel',()=>{start=null});
  el.addEventListener('touchend',e=>{
    if(!start) return;
    const dx=e.changedTouches[0].clientX-start[0], dy=e.changedTouches[0].clientY-start[1];
    start=null;
    if(Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.5) move(dx<0?1:-1);
  },{passive:true});
}
const hero=document.querySelector('.hero');
let scheduled=false;
function updateParallax(){
  const rect=hero.getBoundingClientRect();
  if(rect.bottom>0 && rect.top<innerHeight) byId('cover').style.setProperty('--shift',Math.max(0,-rect.top)*.16+'px');
  scheduled=false;
}
window.addEventListener('scroll',()=>{
  if(!scheduled&&!motion.matches){scheduled=true;requestAnimationFrame(updateParallax)}
},{passive:true});
function showFrame(i) {
  albumIndex=cycle(i,album.length);
  const item=album[albumIndex];
  byId('viewer-stage').classList.remove('zoom');
  byId('viewer-stage').setAttribute('aria-pressed','false');
  byId('viewer-img').src=item.src;
  byId('viewer-img').alt=item.alt;
  byId('viewer-caption').textContent=item.alt;
  byId('viewer-count').textContent=pad(albumIndex+1)+' / '+pad(album.length);
}
function openAlbum(items,i){
  album=items;showFrame(i);dlg.showModal();
  document.body.classList.add('modal-open');
  byId('close-view').focus();
}
byId('view-next').onclick=()=>showFrame(albumIndex+1);
byId('view-prev').onclick=()=>showFrame(albumIndex-1);
byId('close-view').onclick=()=>dlg.close();
dlg.addEventListener('close',()=>document.body.classList.remove('modal-open'));
dlg.addEventListener('click',e=>{
  if(e.target!==dlg)return;
  const r=dlg.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dlg.close();
});
dlg.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();showFrame(albumIndex+(e.key==='ArrowRight'?1:-1))}
});
const stage=byId('viewer-stage');
bindSwipe(stage,n=>showFrame(albumIndex+n));
stage.onclick=()=>stage.setAttribute('aria-pressed',String(stage.classList.toggle('zoom')));
stage.onpointermove=e=>{
  if(e.pointerType!=='mouse') return;
  const rect=stage.getBoundingClientRect();
  stage.style.setProperty('--ox',100*(e.clientX-rect.left)/rect.width+'%');
  stage.style.setProperty('--oy',100*(e.clientY-rect.top)/rect.height+'%');
};

const brands=[['bmw','BMW'],['audi','Audi'],['skoda','Škoda'],['seat','SEAT'],['volkswagen','Volkswagen'],['mercedes','Mercedes-Benz'],['porshe','Porsche'],['toyota','Toyota'],['hyundai','Hyundai']];
const run=document.createElement('div');run.className='brand-run';
for(const [key,label] of brands){
  const item=document.createElement('span');
  item.append(image('media/brand-'+key+'.webp',label));run.append(item);
}
const duplicate=run.cloneNode(true);duplicate.setAttribute('aria-hidden','true');
byId('belt').append(run,duplicate);
const beltControl=byId('belt-control');
function pauseBelt(value) {
  beltControl.closest('.brands').classList.toggle('paused',value);
  beltControl.setAttribute('aria-pressed',String(value));
  beltControl.setAttribute('aria-label',value?'Запустить ленту':'Остановить ленту');
  beltControl.textContent=value?'▷':'Ⅱ';
}
pauseBelt(motion.matches);
motion.addEventListener('change',()=>pauseBelt(motion.matches));
beltControl.onclick=()=>pauseBelt(beltControl.getAttribute('aria-pressed')!=='true');

const film=byId('film');
const filmDeck=document.querySelector('.film-deck');
clientPhotos.forEach((item,i)=>{
  const btn=createButton(item.alt,()=>openAlbum(clientPhotos,i));
  btn.append(image(item.src,'',true));film.append(btn);
});
function filmStep(){return film.children[1].offsetLeft-film.children[0].offsetLeft}
function updateFilm(){
  const max=film.scrollWidth-film.clientWidth;
  const step=filmStep();
  const first=Math.floor((film.scrollLeft+2)/step)+1;
  const last=Math.min(clientPhotos.length,Math.floor((film.scrollLeft+film.clientWidth+2-film.children[0].offsetWidth)/step)+1);
  byId('photo-count').textContent=pad(first)+(last>first?'–'+pad(last):'')+' / '+pad(clientPhotos.length);
  const portion=Math.min(1,film.clientWidth/film.scrollWidth);
  const position=max>0?Math.max(0,Math.min(1,film.scrollLeft/max)):0;
  filmDeck.style.setProperty('--position',100*position*(1-portion)+'%');
  filmDeck.style.setProperty('--portion',100*portion+'%');
  byId('photos-prev').disabled=film.scrollLeft<=1;
  byId('photos-next').disabled=film.scrollWidth-film.clientWidth-film.scrollLeft<=2;
}
function advanceFilm(n){
  film.scrollBy({left:n*filmStep(),behavior:motion.matches?'instant':'smooth'});
}
byId('photos-prev').onclick=()=>advanceFilm(-1);
byId('photos-next').onclick=()=>advanceFilm(1);
film.addEventListener('scroll',updateFilm,{passive:true});new ResizeObserver(updateFilm).observe(film);

function selectReview(i){
  reviewIndex=cycle(i,customerReviews.length);
  const review=customerReviews[reviewIndex];
  byId('review').querySelector('blockquote').textContent='«'+review.quote+'»';
  byId('review').querySelector('figcaption').textContent=review.name+' · '+review.context;
  byId('review-count').textContent=pad(reviewIndex+1)+' / '+pad(customerReviews.length);
}
byId('review-prev').onclick=()=>selectReview(reviewIndex-1);
byId('review-next').onclick=()=>selectReview(reviewIndex+1);
bindSwipe(byId('review'),n=>selectReview(reviewIndex+n));
selectReview(0);

const artAlt={'bmw-light':'Оптика белой BMW M3', 'audi-wheel':'Колесо Audi RS 6 Avant','gt3-rear':'Porsche 911 GT3, вид сзади','senna-wheel':'Колесо McLaren Senna'};
document.querySelectorAll('.service-list details').forEach(el=>{
  el.addEventListener('toggle',()=>{
    if(!el.open)return;
    document.querySelectorAll('.service-list details[open]').forEach(other=>{if(other!==el)other.open=false});
    byId('service-photo').src='media/'+el.dataset.art+'.webp';
    byId('service-photo').alt=artAlt[el.dataset.art];
  });
});
function toggleMenu(open){
  byId('menu').setAttribute('aria-expanded',String(open));
  byId('menu').setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
  byId('nav').classList.toggle('open',open);
}
byId('menu').onclick=()=>toggleMenu(byId('menu').getAttribute('aria-expanded')!=='true');
byId('nav').onclick=()=>toggleMenu(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape' && byId('nav').classList.contains('open')){toggleMenu(false);byId('menu').focus()}});

const markets=[...document.querySelectorAll('.market-routes details')];
const atlas=document.querySelector('.atlas'), poster=atlas.querySelector('.route-photo');
const picker=document.createElement('div');
picker.className='route-picker';
const select=document.createElement('select');
select.setAttribute('aria-label','Страна покупки');
const slot=document.createElement('label'), count=document.createElement('small');
slot.className='route-choice';
const previous=createButton('Предыдущая страна',()=>selectMarket(currentMarket-1));
const next=createButton('Следующая страна',()=>selectMarket(currentMarket+1));
previous.textContent='←'; next.textContent='→';
let currentMarket=-1;
function renderMarket(index){
  if(currentMarket===index)return;
  const {code,image,model,place,country}=markets[index].dataset;
  const art=byId('market-car');
  if(currentMarket!==-1){
    art.loading='eager';art.src='media/'+image+'.webp';
    if(!motion.matches && typeof art.animate==='function')art.animate([{opacity:.65,transform:'scale(1.035)'},{opacity:1,transform:'scale(1)'}],{duration:460});
  }
  currentMarket=index;
  art.alt=model+', '+place;
  byId('market-model').textContent=model;
  byId('market-place').textContent=place;
  byId('market-origin').textContent=country;
  poster.dataset.market=code;
  poster.querySelector('.route-index').replaceChildren(document.createTextNode(code),document.createElement('i'),document.createTextNode('RU'));
  count.textContent=pad(index+1)+' / '+pad(markets.length);
  select.value=code;
}
function selectMarket(index){
  const i=cycle(index,markets.length);
  markets[i].open=true;
  renderMarket(i);
}
markets.forEach((el,i)=>{
  select.add(new Option(el.dataset.country,el.dataset.code));
  el.addEventListener('toggle',()=>{if(el.open)renderMarket(i)});
});
select.addEventListener('change',()=>selectMarket(select.selectedIndex));
count.setAttribute('aria-hidden','true');slot.append(count,select);
picker.append(previous,slot,next);
atlas.prepend(picker);atlas.classList.add('with-picker');
const compactMarket=matchMedia('(max-width:700px)');
compactMarket.addEventListener('change',e=>{if(e.matches)selectMarket(currentMarket)});
bindSwipe(poster,n=>selectMarket(currentMarket+n));
selectMarket(Math.max(0,markets.findIndex(el=>el.open)));
