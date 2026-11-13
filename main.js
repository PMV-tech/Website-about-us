'use strict';
(() => {
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  const toggle = document.querySelector('#menu-toggle');
  const nav = document.querySelector('#primary-nav');
  if (toggle && nav) {
    const close = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Abrir menu'); };
    toggle.addEventListener('click', () => {
      const opened = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(opened)); toggle.setAttribute('aria-label', opened ? 'Fechar menu' : 'Abrir menu');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => {if(e.key==='Escape')close();});
    document.addEventListener('click', e=>{ if(!nav.contains(e.target)&&!toggle.contains(e.target))close(); });
  }
  const animated = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => entries.forEach(entry => {if (entry.isIntersecting) {entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:0.08,rootMargin:'0px 0px 25px 0px'});
    animated.forEach(el=>observer.observe(el));
  } else animated.forEach(el=>el.classList.add('is-visible'));
  const form = document.querySelector('#briefing-form');
  if(form){form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const name=document.querySelector('#brief-name').value.trim();
    const type=document.querySelector('#brief-type').value;
    const details=document.querySelector('#brief-description').value.trim();
    if (!name || !type || !details) return;
    const msg=`Olá, equipe PMV! Meu nome é ${name}.\n\nGostaria de conversar sobre: ${type}.\n\nMinha ideia/necessidade:\n${details}\n\nPodemos conversar sobre as possibilidades?`;
    const feedback=document.querySelector('#briefing-feedback'),result=document.querySelector('#briefing-result');
    let copied=false;
    try{await navigator.clipboard.writeText(msg);copied=true;}catch(_){
      try{const area=document.createElement('textarea');area.value=msg;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();copied=document.execCommand('copy');area.remove();}catch(_){copied=false;}
    }
    result.hidden=false;
    if(copied){feedback.textContent='Mensagem copiada! Agora é só abrir o Instagram da PMV e colar no direct.';}
    else{feedback.textContent='Não foi possível copiar automaticamente. Selecione e copie a mensagem abaixo:';
      let out=result.querySelector('textarea');if(!out){out=document.createElement('textarea');out.readOnly=true;out.rows=7;out.style.cssText='width:100%;background:#07111c;color:white;border:1px solid #3c6570;border-radius:8px;padding:12px;';result.append(out);}out.value=msg;
    }
    result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
  });}
})();
