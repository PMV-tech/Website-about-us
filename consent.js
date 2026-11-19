'use strict';
/*
 * Aviso de cookies + carregamento do analytics só com consentimento.
 *
 * Para ativar o Google Analytics 4, preencha GA4_ID com o ID da propriedade
 * (formato "G-XXXXXXXXXX"). Enquanto estiver vazio, nada de analytics é
 * carregado e o aviso continua registrando apenas a escolha do visitante.
 */
(() => {
  const GA4_ID = '';
  const KEY = 'pmv-consentimento';

  const read = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
  const save = v => { try { localStorage.setItem(KEY, v); } catch (_) {} };

  function loadAnalytics() {
    if (!GA4_ID || window.__pmvAnalytics) return;
    window.__pmvAnalytics = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, { anonymize_ip: true });
  }

  function showBanner() {
    if (document.querySelector('.cookie-banner')) return;
    const box = document.createElement('div');
    box.className = 'cookie-banner';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('aria-label', 'Aviso de cookies');
    box.innerHTML =
      '<p>Usamos armazenamento local para o site funcionar e, com sua permissão, cookies de medição de audiência para melhorar a experiência. ' +
      'Saiba mais na <a href="privacidade.html">Política de Privacidade</a>.</p>' +
      '<div class="cookie-actions"><button type="button" class="cookie-btn cookie-decline">Recusar</button>' +
      '<button type="button" class="cookie-btn cookie-accept">Aceitar</button></div>';
    document.body.appendChild(box);
    const close = choice => { save(choice); box.remove(); if (choice === 'aceito') loadAnalytics(); };
    box.querySelector('.cookie-accept').addEventListener('click', () => close('aceito'));
    box.querySelector('.cookie-decline').addEventListener('click', () => close('recusado'));
  }

  // Permite reabrir o aviso a partir de qualquer link com data-cookie-settings.
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-cookie-settings]');
    if (t) { e.preventDefault(); showBanner(); }
  });

  const start = () => {
    const choice = read();
    if (choice === 'aceito') loadAnalytics();
    else if (choice !== 'recusado') showBanner();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
