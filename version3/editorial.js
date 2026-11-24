'use strict';
(() => {
  const frames=[...document.querySelectorAll('.journey-photo')];
  const links=[...document.querySelectorAll('.process-index a')];
  if(frames.length){
    let queued=false;
    function sync(){
      queued=false;
      // Include both anchor offsets so clicking a stage and scrolling to it agree.
      const anchorTop=parseFloat(getComputedStyle(frames[0]).scrollMarginTop)||0;
      const scrollPad=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;
      const line=Math.max(anchorTop+scrollPad+2,innerHeight*.16);
      let current=0;
      frames.forEach((f,i)=>{if(f.getBoundingClientRect().top<=line)current=i});
      links.forEach((a,i)=>{if(i===current)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')});
    }
    function queue(){if(!queued){queued=true;requestAnimationFrame(sync)}}
    addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);sync();
  }
  if(!('IntersectionObserver' in window)||!Element.prototype.animate)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if(reduced.matches)return;
  const anims=new Set();
  function play(el,keyframes,delay,duration){
    const a=el.animate(keyframes,{delay,duration,easing:'cubic-bezier(.19,.74,.22,1)',fill:'backwards'});
    anims.add(a);a.onfinish=a.oncancel=()=>anims.delete(a);
  }
  // Native content stays visible until it intersects; no JS or failed JS never leaves holes.
  const observer=new IntersectionObserver(entries=>{
    for(const {target,isIntersecting} of entries){
      if(!isIntersecting)continue;
      observer.unobserve(target);
      if(reduced.matches)continue;
      if(target.matches('h1,h2')){
        const lines=target.querySelectorAll('.motion-ink');
        lines.forEach((line,i)=>play(line,[{transform:'translateY(85%)',opacity:.15},{transform:'translateY(0)',opacity:1}],65*i,640));
      }else{
        play(target,[{transform:'translateY(26px)',clipPath:'inset(10% 0 0 0)',opacity:.6},{transform:'none',clipPath:'inset(0)',opacity:1}],0,760);
      }
    }
  },{threshold:.06});
  document.querySelectorAll('main h1,main h2').forEach(h=>{
    if(h.querySelector('a,button,input'))return;
    const lines=[[]];for(const node of [...h.childNodes]){if(node.nodeName==='BR')lines.push([]);else lines.at(-1).push(node)}
    if(lines.length>1&&!h.hasAttribute('aria-label'))h.setAttribute('aria-label',lines.map(part=>part.map(n=>n.textContent).join('').trim()).join(' '));
    h.replaceChildren(...lines.filter(line=>line.length).map(nodes=>{
      const mask=document.createElement('i'),ink=document.createElement('i');
      mask.className='motion-line';ink.className='motion-ink';ink.append(...nodes);mask.append(ink);return mask;
    }));observer.observe(h);
  });
  document.querySelectorAll('.scene-frame,.service-photo,.route-photo,.sale-cover,.unit-stage,.capsule-art').forEach(el=>observer.observe(el));
  reduced.addEventListener('change',()=>{if(reduced.matches){observer.disconnect();anims.forEach(a=>a.cancel())}});
})();
