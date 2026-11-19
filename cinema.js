'use strict';
/*
 * PMV — animações cinematográficas guiadas pela rolagem.
 *
 * 1. Jornada: milhares de partículas "metal líquido" que se transformam
 *    (gota → sistema → engrenagem → gráfico → PMV) enquanto a câmera
 *    atravessa um campo de estrelas, com títulos e progresso lateral.
 * 2. Vitrine: palco escuro com holofote; a rolagem aproxima a câmera do
 *    sistema central enquanto textos gigantes correm ao fundo (parallax).
 *
 * Sem bibliotecas. Respeita prefers-reduced-motion e só anima o que está visível.
 */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  // Progresso (0..1) de uma seção alta com palco "sticky".
  const sectionProgress = el => {
    const r = el.getBoundingClientRect();
    const total = r.height - innerHeight;
    return total > 0 ? clamp(-r.top / total) : 0;
  };

  /* ---------------------------------------------------------------- JORNADA */
  const journey = document.querySelector('#jornada');
  if (journey) {
    const canvas = journey.querySelector('.jn-canvas');
    const ctx = canvas.getContext('2d');
    const chapters = [...journey.querySelectorAll('.jn-chapter')];
    const ticks = [...journey.querySelectorAll('.jn-tick')];
    const fill = journey.querySelector('.jn-progress-fill');
    const counter = journey.querySelector('.jn-counter-current');
    const K = chapters.length;
    const mobile = innerWidth < 760;
    const N = mobile ? 1300 : 2600;
    const S = 420; // tamanho do quadro de amostragem

    // --- Formas: desenhadas num canvas escondido e amostradas em pontos.
    const off = document.createElement('canvas');
    off.width = off.height = S;
    const o = off.getContext('2d');
    const rr = (x, y, w, h, r) => { o.beginPath(); o.roundRect ? o.roundRect(x, y, w, h, r) : o.rect(x, y, w, h); };
    const shapes = [
      () => { // gota de metal líquido
        o.beginPath();
        for (let a = 0; a <= Math.PI * 2 + .01; a += .05) {
          const r = 140 + Math.sin(a * 3) * 14 + Math.cos(a * 5) * 8;
          o.lineTo(S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r * .92);
        }
        o.fill();
      },
      () => { // janela de sistema
        o.lineWidth = 16; rr(40, 70, 340, 260, 26); o.stroke();
        o.fillRect(40, 70, 340, 46);
        o.fillRect(72, 146, 92, 150); // menu lateral
        rr(186, 146, 162, 60, 10); o.fill();
        o.fillRect(186, 224, 162, 14); o.fillRect(186, 252, 120, 14); o.fillRect(186, 280, 140, 14);
      },
      () => { // engrenagem (automação)
        const cx = S / 2, cy = S / 2, teeth = 10;
        o.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
          const a0 = (i / (teeth * 2)) * Math.PI * 2, a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2;
          const r = i % 2 ? 128 : 170;
          o.lineTo(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r);
          o.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
        }
        o.closePath();
        o.moveTo(cx + 58, cy); o.arc(cx, cy, 58, 0, Math.PI * 2, true);
        o.fill('evenodd');
      },
      () => { // gráfico (dashboards)
        [[50, 230], [130, 170], [210, 120], [290, 60]].forEach(([x, top]) => { rr(x, top + 40, 62, 330 - top - 40, 10); o.fill(); });
        o.lineWidth = 14; o.lineCap = 'round'; o.beginPath();
        o.moveTo(60, 200); o.lineTo(160, 140); o.lineTo(240, 160); o.lineTo(360, 40); o.stroke();
        o.fillRect(30, 352, 360, 12);
      },
      () => { // logotipo PMV
        o.font = '900 168px Arial, sans-serif'; o.textAlign = 'center'; o.textBaseline = 'middle';
        o.fillText('PMV', S / 2, S / 2 + 6);
      }
    ];
    const sample = draw => {
      o.clearRect(0, 0, S, S); o.fillStyle = o.strokeStyle = '#fff'; draw();
      const d = o.getImageData(0, 0, S, S).data, pts = [];
      for (let y = 0; y < S; y += 3) for (let x = 0; x < S; x += 3) if (d[(y * S + x) * 4 + 3] > 128) pts.push(x, y);
      const out = new Float32Array(N * 2), count = pts.length / 2;
      for (let i = 0; i < N; i++) { // distribuição estável, com leve jitter
        const j = Math.floor(((i * 7919) % N) / N * count) * 2;
        out[i * 2] = pts[j] + (Math.random() - .5) * 2.4 - S / 2;
        out[i * 2 + 1] = pts[j + 1] + (Math.random() - .5) * 2.4 - S / 2;
      }
      return out;
    };
    const targets = shapes.slice(0, K).map(sample);

    // --- Partículas
    const px = new Float32Array(N), py = new Float32Array(N);
    const seed = new Float32Array(N), bucket = new Uint8Array(N), size = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      px[i] = (Math.random() - .5) * 900; py[i] = (Math.random() - .5) * 900;
      seed[i] = Math.random() * Math.PI * 2;
      bucket[i] = Math.floor(Math.random() * 6);
      size[i] = Math.random() < .12 ? 2.4 : 1.4;
    }
    // Paleta "cromo + teal + azul" da marca: brilhos claros dão o aspecto metálico.
    const palette = ['#f4fbff', '#bfeee6', '#35e3c4', '#2cc7d6', '#68a8ff', '#8fb6d8'];

    // --- Estrelas (efeito de câmera atravessando o espaço)
    const STARS = mobile ? 90 : 180;
    const sx = new Float32Array(STARS), sy = new Float32Array(STARS), sz = new Float32Array(STARS);
    for (let i = 0; i < STARS; i++) { sx[i] = Math.random() * 2 - 1; sy[i] = Math.random() * 2 - 1; sz[i] = Math.random(); }

    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.6);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); addEventListener('resize', resize, {passive: true});

    let mx = -1e4, my = -1e4;
    if (fine) {
      canvas.parentElement.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
      canvas.parentElement.addEventListener('pointerleave', () => { mx = my = -1e4; });
    }

    let active = -1, visible = false, lastScroll = scrollY, velocity = 0, time = 0, prevT = 0;
    const setChapter = idx => {
      if (idx === active) return;
      active = idx;
      chapters.forEach((c, i) => c.classList.toggle('is-active', i === idx));
      ticks.forEach((t, i) => t.classList.toggle('is-done', i <= idx));
      if (counter) counter.textContent = String(idx + 1).padStart(2, '0');
    };

    const frame = () => {
      if (!visible) return;
      const nowT = performance.now(); time += Math.min(.05, prevT ? (nowT - prevT) / 1000 : .016); prevT = nowT;
      const p = reduce ? 1 : sectionProgress(journey);
      velocity = lerp(velocity, Math.abs(scrollY - lastScroll), .12); lastScroll = scrollY;
      if (fill) fill.style.transform = `scaleY(${p})`;

      const f = p * (K - 1), i0 = Math.min(K - 2, Math.floor(f));
      const raw = f - i0;
      const t = ease(clamp((raw - .2) / .6)); // segura a forma no início e no fim de cada capítulo
      const burst = Math.sin(Math.PI * t);      // explosão no meio da transição = "atravessar"
      setChapter(raw < .5 ? i0 : i0 + 1);

      const A = targets[i0], B = targets[i0 + 1];
      const desktop = W >= 900;
      const cx = desktop ? W * .6 : W / 2, cy = desktop ? H / 2 : H * .36;
      const scale = Math.min(desktop ? W * .42 : W * .82, H * (desktop ? .78 : .5)) / S;

      ctx.clearRect(0, 0, W, H);

      // estrelas: aceleram com a velocidade da rolagem (warp)
      const speed = .0016 + Math.min(velocity, 60) * .00045 + burst * .006;
      ctx.fillStyle = '#9fc4dc';
      for (let i = 0; i < STARS; i++) {
        sz[i] -= speed; if (sz[i] <= .02) { sz[i] = 1; sx[i] = Math.random() * 2 - 1; sy[i] = Math.random() * 2 - 1; }
        const k = 1 / sz[i], x = W / 2 + sx[i] * k * W * .18, y = H / 2 + sy[i] * k * H * .18;
        if (x < 0 || x > W || y < 0 || y > H) continue;
        const s = (1 - sz[i]) * 2.2;
        ctx.globalAlpha = (1 - sz[i]) * .8;
        ctx.fillRect(x, y, s, s);
      }

      // partículas
      ctx.globalCompositeOperation = 'lighter';
      const liquid = i0 === 0 ? 1 - t : 0; // a gota "respira" como metal líquido
      for (let b = 0; b < palette.length; b++) {
        ctx.fillStyle = palette[b];
        ctx.globalAlpha = b === 0 ? .95 : .75;
        for (let i = 0; i < N; i++) {
          if (bucket[i] !== b) continue;
          const ax = A[i * 2], ay = A[i * 2 + 1], bx = B[i * 2], by = B[i * 2 + 1];
          let tx = lerp(ax, bx, t), ty = lerp(ay, by, t);
          // dispersão em profundidade durante a passagem
          const sd = seed[i];
          tx += Math.cos(sd) * burst * 160; ty += Math.sin(sd) * burst * 160;
          tx *= 1 + burst * .55; ty *= 1 + burst * .55;
          // ondulação líquida
          const wob = 3 + liquid * 9;
          tx += Math.sin(time * 1.6 + sd + ty * .02) * wob; ty += Math.cos(time * 1.3 + sd + tx * .02) * wob;
          let X = cx + tx * scale, Y = cy + ty * scale;
          // repulsão do cursor
          const dx = X - mx, dy = Y - my, d2 = dx * dx + dy * dy;
          if (d2 < 9000) { const k = (9000 - d2) / 9000 * 38; const d = Math.sqrt(d2) || 1; X += dx / d * k; Y += dy / d * k; }
          // inércia: cada partícula persegue o alvo (sensação de fluido)
          if (reduce) { px[i] = X; py[i] = Y; } else { px[i] += (X - px[i]) * .14; py[i] += (Y - py[i]) * .14; }
          ctx.fillRect(px[i], py[i], size[i], size[i]);
        }
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    };

    if (reduce) { visible = true; frame(); visible = false; journey.classList.add('is-static'); }
    else {
      new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) { prevT = 0; requestAnimationFrame(frame); } }, {rootMargin: '100px'}).observe(journey);
      // posições iniciais no centro do palco para a primeira forma surgir "do nada"
      for (let i = 0; i < N; i++) { px[i] = innerWidth / 2 + (Math.random() - .5) * 40; py[i] = innerHeight / 2 + (Math.random() - .5) * 40; }
    }
  }

  /* ---------------------------------------------------------------- VITRINE */
  const show = document.querySelector('#vitrine');
  if (show) {
    const stage = show.querySelector('.vt-stage');
    const center = show.querySelector('.vt-card-center');
    const left = show.querySelector('.vt-card-left');
    const right = show.querySelector('.vt-card-right');
    const rows = [...show.querySelectorAll('.vt-marquee-row')];
    const capA = show.querySelector('.vt-caption-a');
    const capB = show.querySelector('.vt-caption-b');
    const light = show.querySelector('.vt-spot');
    const dust = show.querySelector('.vt-dust');
    let tiltX = 0, tiltY = 0, tx = 0, ty = 0, on = false;

    if (fine) {
      show.addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - .5) * 10; ty = (e.clientY / innerHeight - .5) * -8; });
      show.addEventListener('pointerleave', () => { tx = ty = 0; });
    }

    const render = () => {
      const p = reduce ? 1 : sectionProgress(show);
      const z = easeOut(clamp(p / .55));            // aproximação da câmera
      const late = ease(clamp((p - .5) / .35));     // segunda fase
      const small = innerWidth < 760;
      tiltX = lerp(tiltX, tx, .08); tiltY = lerp(tiltY, ty, .08);

      // câmera: começa afastada mostrando os três sistemas e aproxima do central
      stage.style.transform = `scale(${lerp(small ? .74 : .72, small ? 1 : 1.08, z)})`;
      center.style.transform = `translate(-50%, calc(-50% - ${late * 17}vh)) perspective(1400px) rotateX(${(1 - z) * 16 + tiltY}deg) rotateY(${tiltX}deg)`;
      const cw = center.offsetWidth, off = cw * (small ? .5 : .7) + z * cw * .55;
      left.style.transform = `translate(calc(-50% - ${off}px), -46%) perspective(1400px) rotateY(${22 + z * 18}deg) scale(.82)`;
      right.style.transform = `translate(calc(-50% + ${off}px), -46%) perspective(1400px) rotateY(${-22 - z * 18}deg) scale(.82)`;
      left.style.opacity = right.style.opacity = String(1 - z * .9);
      rows.forEach((r, i) => { r.style.transform = `translateX(${(i % 2 ? -1 : 1) * (p * 38 - 19)}%)`; r.style.opacity = String(.25 + late * .75); });
      if (light) light.style.opacity = String(.35 + z * .65);
      if (dust) dust.style.transform = `translateY(${p * -120}px)`; // camada da frente, mais rápida
      capA.classList.toggle('is-on', p < .16);
      capB.classList.toggle('is-on', p > .6);
      if (on) requestAnimationFrame(render);
    };

    if (reduce) { show.classList.add('is-static'); render(); }
    else new IntersectionObserver(([e]) => { const was = on; on = e.isIntersecting; if (on && !was) requestAnimationFrame(render); }, {rootMargin: '100px'}).observe(show);
  }

})();
