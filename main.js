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
  // Números de WhatsApp que recebem o briefing (DDI + DDD + número)
  const WHATSAPP_NUMBERS=['5511987244587','5511926115699'];
  const waLink=(num,msg)=>`https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  const formStartedAt=Date.now();
  if(form){form.addEventListener('submit', e => {
    e.preventDefault();
    // Anti-spam: robôs costumam preencher o campo escondido ou enviar instantaneamente.
    const honeypot=document.querySelector('#brief-website');
    if ((honeypot && honeypot.value) || Date.now()-formStartedAt<2500) return;
    if (!form.reportValidity()) return;
    const name=document.querySelector('#brief-name').value.trim();
    const type=document.querySelector('#brief-type').value;
    const details=document.querySelector('#brief-description').value.trim();
    if (!name || !type || !details) return;
    const msg=`Olá, equipe PMV! Meu nome é ${name}.\n\nGostaria de conversar sobre: ${type}.\n\nMinha ideia/necessidade:\n${details}\n\nPodemos conversar sobre as possibilidades?`;
    const feedback=document.querySelector('#briefing-feedback'),result=document.querySelector('#briefing-result');
    WHATSAPP_NUMBERS.forEach((num,i)=>{const a=document.querySelector(`#wa-${i+1}`);if(a)a.href=waLink(num,msg);});
    // Abre o WhatsApp do primeiro atendimento; o segundo fica disponível no botão abaixo.
    const opened=window.open(waLink(WHATSAPP_NUMBERS[0],msg),'_blank');
    if(opened){try{opened.opener=null;}catch(_){}}
    result.hidden=false;
    feedback.textContent=opened
      ? 'O WhatsApp foi aberto com sua mensagem. Toque em enviar! Se preferir, envie também para o outro atendimento:'
      : 'Escolha um atendimento abaixo para abrir o WhatsApp com sua mensagem pronta:';
    result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
  });}
})();
