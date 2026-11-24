'use strict';
(() => {
  const by = id => document.getElementById(id);
  const entry = by('entry'), desk = by('dashboard'), door = by('ignition');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const preview = document.documentElement.hasAttribute('data-static-preview');
  let mode = 'entry', busy = false, epoch = 0, demoState, oldest = null;
  const statuses = ['Заявка','Подбор','Покупка','Доставка'];
  const stamp = value => {
    if (!value) return '';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});
  };
  async function request(path, method='GET', data) {
    if(preview)throw new Error('Demo only');
    const options = {method, credentials:'same-origin', cache:'no-store', redirect:'error', headers:{Accept:'application/json'}};
    if (data) { options.headers['Content-Type']='application/json'; options.body=JSON.stringify(data); }
    const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),12000);
    try {
      const r=await fetch('/api/cabinet/'+path,{...options,signal:controller.signal});
      if (!r.ok) throw Object.assign(new Error('API'),{status:r.status});
      return r.status===204 ? null : await r.json();
    } finally { clearTimeout(timeout); }
  }
  function lockControls(value){
    busy=value;
    for (const id of ['demo','client-key','logout','refresh','draft','earlier']) by(id).disabled=value;
    for(const sel of ['#login-form button','#compose button']) document.querySelector(sel).disabled=value;
  }
  function reset(message='',focus=false) {
    epoch++; mode='entry'; demoState=null; oldest=null; desk.hidden=true; entry.hidden=false;
    for(const id of ['owner','order-number','car-model','car-origin','order-note','order-updated','stage-counter','thread','dash-notice','reply-notice']) by(id).textContent='';
    by('entry-msg').textContent=message; by('client-key').value=''; by('draft').value='';
    door.classList.remove('unlocking');by('lock-label').textContent='Замок закрыт';by('lock-code').textContent='01 / 02';lockControls(false);
    if(focus) by(preview?'demo':'client-key').focus();
  }
  function paint(s) {
    if (!s || typeof s.client!=='string') throw new Error('Invalid account response');
    const o=s.order, messages=Array.isArray(s.messages)?s.messages:[];
    by('owner').textContent=mode==='demo'?'Демоверсия · вымышленный заказ':s.client;
    by('logout').textContent=mode==='demo'?'Закрыть демоверсию':'Выйти';
    by('empty-order').hidden=!!o;by('order').hidden=!o;
    if(o){
      by('order-number').textContent=o.number?'№ '+o.number:'';
      by('car-model').textContent=o.model||'Модель уточняется';
      by('car-origin').textContent=o.origin?'Рынок: '+o.origin:'Рынок уточняется';
      by('order-note').textContent=o.note||'Пока нет комментария по заказу.';
      const current=Number(o.stage);
      by('stage-counter').textContent=statuses[current]?String(current+1).padStart(2,'0')+' / 04':'';
      [...by('timeline').children].forEach((li,i)=>{
        li.classList.toggle('done',i<current);
        if(i===current)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');
      });
      const date=stamp(o.updated);by('order-updated').textContent=date?'Обновлено: '+date:'';
    }
    const thread=by('thread');thread.replaceChildren();
    if(!messages.length){const li=document.createElement('li');li.textContent='Здесь появятся ваши сообщения и ответы менеджера.';thread.append(li);}
    thread.append(...messages.map(messageItem));
    olderCursor(messages);
    thread.scrollTop=thread.scrollHeight;
  }
  function messageItem(m){
    const li=document.createElement('li'),head=document.createElement('small'),body=document.createElement('p');
    const own=m.author==='client';if(own)li.classList.add('from-client');
    head.textContent=[own?'Вы':'Менеджер',stamp(m.created)].filter(Boolean).join(' · ');
    body.textContent=m.body;li.append(head,body);return li;
  }
  function olderCursor(rows){
    oldest=mode==='client'&&rows.length===100 ? rows[0].id : null;
    by('earlier').hidden=!oldest;
  }
  async function unlock(s,demo,id){
    if(id!==epoch) return;
    mode=demo?'demo':'client'; paint(s);
    door.classList.add('unlocking');by('lock-label').textContent='Замок открывается';
    if(!reduced.matches){
      if(door.getBoundingClientRect().bottom<80)door.scrollIntoView({block:'center',behavior:'instant'});
      await new Promise(resolve=>setTimeout(resolve,1090));
    }
    if(id!==epoch)return;
    by('lock-label').textContent='Открыто';by('lock-code').textContent='02 / 02';
    by('client-key').value='';entry.hidden=true;desk.hidden=false;lockControls(false);
    by('dash-notice').textContent=demo?'Это пример. Сообщения здесь не отправляются менеджеру.':'';
    window.scrollTo({top:0,behavior:'instant'});by('dash-title').focus({preventScroll:true});
  }
  async function restore(){
    if(preview){reset();return;}
    const id=++epoch;lockControls(true);
    try{const state=await request('session');if(id===epoch)await unlock(state,false,id);}
    catch(e){if(id===epoch)reset(e.status===401?'':'Сервис входа недоступен. Попробуйте позже или откройте демоверсию.');}
  }
  by('login-form').addEventListener('submit',async e=>{
    e.preventDefault();if(busy)return;
    const key=by('client-key').value.trim();if(!key){by('entry-msg').textContent='Введите ключ, полученный у менеджера.';return;}
    const id=++epoch;lockControls(true);by('entry-msg').textContent='Проверяем ключ…';
    try{const state=await request('login','POST',{key});if(id===epoch){by('entry-msg').textContent='';await unlock(state,false,id);}}
    catch(err){if(id!==epoch)return;lockControls(false);by('entry-msg').textContent=err.status===401?'Ключ не подошёл. Проверьте его или обратитесь к менеджеру.':err.status===429?'Слишком много попыток. Попробуйте позже.':'Не удалось войти. Проверьте соединение и попробуйте ещё раз.';by('client-key').focus();}
  });
  by('demo').onclick=()=>{
    if(busy)return;const id=++epoch;lockControls(true);by('entry-msg').textContent='';
    demoState={client:'Демо',order:{number:'DEMO-017',model:'BMW M3 Competition',origin:'Германия',stage:1,note:'Согласовали комплектацию. Следующий шаг: осмотр автомобиля у продавца.',updated:'2026-11-23'},messages:[{author:'manager',body:'Подобрали вариант в зелёном цвете. После осмотра расскажу о состоянии кузова и салона.',created:'2026-11-23'}]};
    unlock(demoState,true,id);
  };
  function problem(e,el){if(e.status===401){reset('Сессия завершилась. Войдите ещё раз.',true);return;}el.textContent=e.status===429?'Слишком много запросов. Повторите позже.':'Не удалось связаться с сервером. Попробуйте ещё раз.';}
  by('logout').onclick=async()=>{
    if(busy)return;if(mode==='demo'){reset('',true);return;}
    lockControls(true);try{await request('logout','POST',{});reset('',true);}
    catch(e){lockControls(false);problem(e,by('dash-notice'));}
  };
  async function refresh(){
    if(busy||mode==='entry')return;
    if(mode==='demo'){paint(demoState);return;}
    const id=epoch;lockControls(true);by('reply-notice').textContent='';
    try{const s=await request('session');if(id===epoch)paint(s);}
    catch(e){if(id===epoch)problem(e,by('reply-notice'));}
    finally{if(id===epoch)lockControls(false);}
  }
  by('refresh').onclick=refresh;
  by('earlier').onclick=async()=>{
    if(!oldest||busy||mode!=='client')return;
    const id=epoch;lockControls(true);
    try{
      const s=await request('session?before='+encodeURIComponent(oldest));
      if(id!==epoch)return;
      const thread=by('thread'),oldHeight=thread.scrollHeight,oldTop=thread.scrollTop;
      thread.prepend(...s.messages.map(messageItem));olderCursor(s.messages);
      thread.scrollTop=thread.scrollHeight-oldHeight+oldTop;
      by('reply-notice').textContent=s.messages.length?'Ранние сообщения загружены.':'Вы в начале переписки.';
    }catch(e){if(id===epoch)problem(e,by('reply-notice'));}
    finally{if(id===epoch)lockControls(false);}
  };
  by('compose').onsubmit=async e=>{
    e.preventDefault();if(busy)return;
    const draft=by('draft'),body=draft.value.trim();
    if(!body){by('reply-notice').textContent='Введите сообщение.';draft.focus();return;}
    if(mode==='demo'){
      demoState.messages.push({author:'client',body,created:new Date().toISOString()});paint(demoState);draft.value='';by('reply-notice').textContent='Добавлено в демоверсию. Менеджер это сообщение не получит.';return;
    }
    if(mode!=='client')return;
    const id=epoch;lockControls(true);
    try{
      await request('messages','POST',{body});if(id!==epoch)return;
      draft.value='';by('reply-notice').textContent='Сообщение отправлено.';
      try{const s=await request('session');if(id===epoch)paint(s);}
      catch(err){if(id===epoch){if(err.status===401)problem(err,by('reply-notice'));else by('reply-notice').textContent='Сообщение отправлено. Обновите переписку, чтобы увидеть его.';}}
    }catch(err){if(id===epoch)problem(err,by('reply-notice'));}
    finally{if(id===epoch)lockControls(false);}
  };
  window.addEventListener('pagehide',()=>reset());
  window.addEventListener('pageshow',e=>{if(e.persisted)restore();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&mode==='client'&&!desk.hidden)refresh();});
  restore();
})();
