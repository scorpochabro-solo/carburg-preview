'use strict';
(() => {
  const pad = number => String(number).padStart(2, '0');
  const wrap = (i, length) => ((i % length) + length) % length;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:700px)');
  document.querySelectorAll('[data-showroom]').forEach(section => {
    const view = section.querySelector('.sale-mobile');
    const track = view.querySelector('.sale-track');
    const tabs = [...view.querySelectorAll('[role="tab"]')];
    const panel = view.querySelector('[role="tabpanel"]');
    const titles = [...panel.querySelectorAll('.sale-model-title')];
    const offers = [...panel.querySelectorAll('.sale-offer')];
    const status = view.querySelector('[role="status"]');
    const count = tabs.length;
    let index = 0;

    function center(slot) {
      const item = track.children[slot];
      return item.offsetLeft + (item.offsetWidth - track.clientWidth) / 2;
    }
    function nearest() {
      const step = center(1) - center(0);
      return Math.max(0, Math.min(track.childElementCount-1, Math.round((track.scrollLeft-center(0))/step)));
    }
    function activate(i, announce=false) {
      if (announce && i !== index) status.textContent = titles[i].querySelector('h3').textContent;
      index = i;
      panel.setAttribute('aria-labelledby',tabs[i].id);
      tabs.forEach((tab,k) => {
        tab.setAttribute('aria-selected', String(k === i));
        tab.tabIndex = k === i ? 0 : -1;
        titles[k].hidden = offers[k].hidden = k !== i;
      });
    }
    function align() {
      if (!view.hidden) track.scrollTo({left:center(count+index), behavior:'instant'});
    }
    function settle() {
      if (view.hidden) return;
      const slot = nearest();
      activate(wrap(slot,count),true);
      // Identical neighbours in each copy make the reset invisible at either seam.
      if (slot !== count+index) align();
    }
    function select(i) {
      const choices = [i, count+i, count*2+i];
      const target = choices.reduce((a,b) => Math.abs(center(a)-track.scrollLeft) < Math.abs(center(b)-track.scrollLeft) ? a : b);
      activate(i);
      track.scrollTo({left:center(target), behavior:reduced.matches?'instant':'smooth'});
    }
    tabs.forEach((tab,i) => {
      tab.onclick = () => select(i);
      tab.onkeydown = e => {
        const next = {ArrowLeft:wrap(i-1,count), ArrowRight:wrap(i+1,count), Home:0, End:count-1}[e.key];
        if (next === undefined) return;
        e.preventDefault(); tabs[next].focus({preventScroll:true}); select(next);
      };
    });
    if ('onscrollend' in track) track.addEventListener('scrollend',settle);
    else {
      let timer;
      track.addEventListener('scroll',() => { clearTimeout(timer); timer=setTimeout(settle,150); },{passive:true});
    }
    function layout() {
      view.hidden = !mobile.matches;
      if (view.hidden) return;
      if (!track.childElementCount) {
        const template = view.querySelector('template');
        for (let k=0;k<3;k++) {
          const group = template.content.cloneNode(true);
          group.querySelectorAll('img').forEach(img => img.addEventListener('error',() => {
            img.classList.add('sale-fallback');
            img.src = img.dataset.fallback;
          },{once:true}));
          track.append(group);
        }
      }
      align();
    }
    mobile.addEventListener('change',layout);
    layout();
    new ResizeObserver(() => { if (track.clientWidth) align(); }).observe(track);
  });
  const gallery = document.querySelector('[data-unit-gallery]');
  if (!gallery) return;
  const {base,name} = gallery.dataset, all = gallery.dataset.order.split(',').map(Number);
  const body = gallery.dataset.body.split(',').map(Number);
  const modeButtons = [...gallery.querySelectorAll('[data-mode]')];
  const thumbs = [...gallery.querySelectorAll('[data-photo]')];
  const open = gallery.querySelector('.unit-open'), dialog = gallery.querySelector('dialog');
  const large = gallery.querySelector('.unit-large');
  let frames = all, index = 0;
  function redraw() {
    const n = frames[index], file = base+pad(n), p=open.querySelector('picture');
    p.querySelector('source').srcset = file+'.jxl';
    const img = p.querySelector('img'); img.src = file+'.jpg'; img.alt = name+', фото '+(all.indexOf(n)+1);
    open.href = img.src;
    gallery.querySelectorAll('output').forEach(o => o.value = pad(index+1)+' / '+pad(frames.length));
    thumbs.forEach(t => {
      const id = Number(t.dataset.photo);t.hidden = !frames.includes(id);
      if(id===n)t.setAttribute('aria-current','true');else t.removeAttribute('aria-current');
    });
    const strip=gallery.querySelector('.unit-thumbs'), selected=thumbs.find(t=>Number(t.dataset.photo)===n);
    if(selected)strip.scrollLeft+=selected.getBoundingClientRect().left-strip.getBoundingClientRect().left-(strip.clientWidth-selected.offsetWidth)/2;
    if(dialog.open)large.replaceChildren(p.cloneNode(true));
  }
  function step(d){index=wrap(index+d,frames.length);redraw()}
  gallery.querySelectorAll('[data-frame]').forEach(b => b.onclick=()=>step(Number(b.dataset.frame)));
  modeButtons.forEach(b=>b.onclick=()=>{
    const prev=frames[index];frames=b.dataset.mode==='body'?body:all;
    index=Math.max(0,frames.indexOf(prev));modeButtons.forEach(t=>t.setAttribute('aria-pressed',String(b===t)));redraw();
  });
  thumbs.forEach(t=>t.onclick=e=>{e.preventDefault();index=frames.indexOf(Number(t.dataset.photo));redraw()});
  open.addEventListener('click',e=>{e.preventDefault();if(ignoreClick)return;dialog.showModal();redraw();dialog.querySelector('.unit-close').focus()});
  dialog.querySelector('.unit-close').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>{large.replaceChildren();open.focus({preventScroll:true})});
  gallery.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();step(e.key==='ArrowRight'?1:-1)}});
  let ignoreClick=false;
  [open,large].forEach(surface=>{
    let origin=null;
    surface.addEventListener('dragstart',e=>e.preventDefault());
    surface.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;origin=[e.clientX,e.clientY];surface.setPointerCapture(e.pointerId)});
    surface.addEventListener('pointercancel',()=>{origin=null});
    surface.addEventListener('pointerup',e=>{
      if(!origin)return;const dx=e.clientX-origin[0],dy=e.clientY-origin[1];origin=null;
      if(Math.abs(dx)<36||Math.abs(dx)<Math.abs(dy)*1.4)return;
      ignoreClick=true;step(dx<0?1:-1);setTimeout(()=>{ignoreClick=false},250);
    });
  });
})();
