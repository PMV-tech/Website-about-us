'use strict';
// PMV Flow Lab: efeitos locais, leves, ilustrativos e compatíveis com teclado e movimento reduzido.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const allowMotion = () => !reducedMotion.matches;
  const desktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  // Barra superior de progresso: atualizada apenas quando há um novo frame disponível.
  const progress = document.querySelector('.scroll-progress');
  if (progress) {
    let scheduled = false;
    const updateProgress = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress.style.transform = `scaleX(${Math.min(1, window.scrollY / max)})`;
      scheduled = false;
    };
    window.addEventListener('scroll', () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); }
    }, {passive: true});
    window.addEventListener('resize', updateProgress, {passive: true});
    updateProgress();
  }

  // Pontos luminosos: gerados de maneira determinística para não variar a cada carregamento.
  const stars = document.querySelector('.hero-stars');
  if (stars && allowMotion()) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 26; i++) {
      const dot = document.createElement('span');
      dot.className = 'hero-star';
      dot.style.setProperty('--star-x', `${(i * 43 + 21) % 94 + 3}%`);
      dot.style.setProperty('--star-y', `${(i * 29 + 13) % 81 + 9}%`);
      dot.style.setProperty('--star-size', `${i % 6 === 0 ? 3 : 2}px`);
      dot.style.setProperty('--star-duration', `${5 + (i % 7)}s`);
      dot.style.setProperty('--star-delay', `${-i * .41}s`);
      fragment.appendChild(dot);
    }
    stars.appendChild(fragment);
  }

  // Transformação de perspectiva: responde ao cursor, sem bloquear cliques nem rolagem.
  const hero = document.querySelector('.hero');
  const heroVisual = document.querySelector('.hero-visual');
  if (hero && heroVisual && desktopPointer.matches && allowMotion()) {
    const reset = () => {
      heroVisual.style.setProperty('--tilt-y', '-6deg');
      heroVisual.style.setProperty('--tilt-x', '2.5deg');
    };
    heroVisual.addEventListener('pointermove', event => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      heroVisual.style.setProperty('--tilt-y', `${(-6 + x * 12).toFixed(2)}deg`);
      heroVisual.style.setProperty('--tilt-x', `${(2.5 - y * 9).toFixed(2)}deg`);
    }, {passive:true});
    heroVisual.addEventListener('pointerleave', reset);
    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
      hero.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
    }, {passive:true});
    reducedMotion.addEventListener('change', event => { if (event.matches) reset(); });
  }

  // Efeito de iluminação nos cartões sem adicionar novas dependências.
  if (desktopPointer.matches && allowMotion()) {
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--card-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--card-y', `${event.clientY - rect.top}px`);
      }, {passive:true});
    });
  }
  document.querySelectorAll('.service-grid .reveal, .steps-grid .reveal').forEach((el, index) => {
    el.style.setProperty('--reveal-delay', allowMotion() ? `${Math.min(index % 4, 3) * 85}ms` : '0ms');
  });

  // Três desafios reais e seus POSSÍVEIS fluxos: nenhuma etapa representa integração em produção.
  const scenarios = {
    orcamentos: {
      title: 'Fluxo de orçamentos', before: 'Informações espalhadas',
      problem: 'Orçamentos em mensagens, planilhas e anotações sem um fluxo único.',
      after: 'Um fluxo centralizado', result: 'Acompanhe propostas, mudanças e aprovações em um só lugar.',
      success: 'Pronto! Imagine cada orçamento organizado por etapa, com histórico e responsáveis.'
    },
    agenda: {
      title: 'Agenda de atendimentos', before: 'Horários sem controle',
      problem: 'Solicitações por mensagens, conflitos de horário e alterações difíceis de acompanhar.',
      after: 'Uma agenda estruturada', result: 'Visualize pedidos, confirme horários e acompanhe alterações.',
      success: 'Pronto! Imagine a equipe acompanhando solicitações e mudanças numa mesma agenda.'
    },
    rotinas: {
      title: 'Rotinas de operação', before: 'Muito retrabalho',
      problem: 'As mesmas informações digitadas mais de uma vez em ferramentas diferentes.',
      after: 'Etapas conectadas', result: 'Padronize tarefas e identifique o que pode ser automatizado.',
      success: 'Pronto! Imagine menos repetição e mais visibilidade sobre cada etapa.'
    }
  };
  const frame = document.querySelector('.lab-frame');
  const run = document.querySelector('#lab-run');
  const choices = [...document.querySelectorAll('[data-lab-scenario]')];
  if (!frame || !run || !choices.length) return;
  const title = document.querySelector('#lab-scenario-title');
  const beforeTitle = document.querySelector('#lab-before-title');
  const beforeText = document.querySelector('#lab-before-text');
  const afterTitle = document.querySelector('#lab-after-title');
  const afterText = document.querySelector('#lab-after-text');
  const feedback = document.querySelector('#lab-feedback');
  const status = document.querySelector('#lab-status');
  const runLabel = document.querySelector('#lab-run-label');
  const steps = [...document.querySelectorAll('[data-lab-step]')];
  const burst = document.querySelector('.lab-burst');
  const connectors = [...document.querySelectorAll('.lab-connector')];
  let active = 'orcamentos';
  let pending = [];
  const clearPending = () => { pending.forEach(window.clearTimeout); pending=[]; };
  const reset = () => {
    clearPending();
    if (burst) burst.replaceChildren();
    frame.classList.remove('is-running','is-complete');
    steps.forEach(step => step.classList.remove('is-current','is-done'));
    connectors.forEach(connector => connector.classList.remove('is-on'));
    run.disabled = false;
    runLabel.textContent = 'Executar simulação';
    status.textContent = 'PRONTO PARA TESTAR';
    feedback.textContent = 'Selecione um cenário e inicie a transformação.';
  };
  const selectScenario = key => {
    if (!Object.hasOwn(scenarios,key)) return;
    active=key;
    reset();
    choices.forEach(choice => {
      const selected = choice.dataset.labScenario === key;
      choice.classList.toggle('is-selected', selected);
      choice.setAttribute('aria-pressed', String(selected));
    });
    const item = scenarios[key];
    title.textContent=item.title;
    beforeTitle.textContent=item.before;
    beforeText.textContent=item.problem;
    afterTitle.textContent=item.after;
    afterText.textContent=item.result;
  };
  choices.forEach(choice => choice.addEventListener('click', () => selectScenario(choice.dataset.labScenario)));
  run.addEventListener('click', () => {
    reset();
    frame.classList.add('is-running');
    run.disabled = true;
    runLabel.textContent = 'Transformando...';
    status.textContent = 'SIMULAÇÃO EM ANDAMENTO';
    const labels = ['Mapeando a necessidade...', 'Estruturando a solução...', 'Conectando as etapas...'];
    const finish = () => {
      steps.forEach(step => {step.classList.remove('is-current'); step.classList.add('is-done');});
      connectors.forEach(c => c.classList.add('is-on'));
      frame.classList.remove('is-running');
      frame.classList.add('is-complete');
      run.disabled=false;
      runLabel.textContent='Simular novamente';
      status.textContent='FLUXO CONCLUÍDO';
      feedback.textContent=scenarios[active].success;
      if (burst && allowMotion()) {
        const sparkFragment=document.createDocumentFragment();
        for (let i=0;i<14;i++) {
          const spark=document.createElement('span');
          spark.style.setProperty('--spark-angle',`${(i*360/14).toFixed(1)}deg`);
          spark.style.setProperty('--spark-distance',`${42+(i%5)*13}px`);
          spark.style.setProperty('--spark-delay',`${(i%4)*32}ms`);
          sparkFragment.appendChild(spark);
        }
        burst.replaceChildren(sparkFragment);
        pending.push(window.setTimeout(() => burst.replaceChildren(), 1000));
      }
    };
    if (!allowMotion()) { finish(); return; }
    steps.forEach((step,i) => {
      pending.push(window.setTimeout(() => {
        if (i>0) {
          steps[i-1].classList.remove('is-current');
          steps[i-1].classList.add('is-done');
          connectors[i-1]?.classList.add('is-on');
        }
        step.classList.add('is-current');
        feedback.textContent=labels[i];
      }, 200 + i * 680));
    });
    pending.push(window.setTimeout(finish, 2300));
  });
  selectScenario(active);
})();
