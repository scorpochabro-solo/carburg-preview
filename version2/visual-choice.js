'use strict';
window.CarburgVisual = (() => {
  const root=document.documentElement;
  const alpine=root.dataset.edition ? root.dataset.edition==='alpine' : new URLSearchParams(location.search).get('hero')==='alpine';
  root.dataset.hero=alpine?'alpine':'studio';
  return {cover(picture){
    if(!alpine || root.dataset.edition)return;
    picture.querySelector('source').srcset='media/hero-alpine-air.webp';
    const img=picture.querySelector('img');img.alt='Синее спортивное купе на горном перевале';img.src='media/gt3-wide.webp';
  }};
})();
