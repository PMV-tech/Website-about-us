'use strict';
(() => {
  const KEY = 'pmv-agenda-demo-v1';
  const PROS = ['Ana', 'Bruno'];
  const STATUS = { agendado: 'Agendado', confirmado: 'Confirmado', concluido: 'Concluído', cancelado: 'Cancelado' };
  const OPEN = 8 * 60, CLOSE = 19 * 60, STEP = 30;

  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = v => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const uid = () => Math.random().toString(36).slice(2, 9);
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (s, n) => { const d = new Date(s + 'T12:00'); d.setDate(d.getDate() + n); return iso(d); };
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const toTime = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
  const initials = n => String(n).trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  const fmtDay = s => new Date(s + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  const today = iso(new Date());

  function seed() {
    const services = [
      { id: 's1', name: 'Corte masculino', dur: 30, price: 45, desc: 'Corte na tesoura ou máquina, com finalização.' },
      { id: 's2', name: 'Barba', dur: 30, price: 35, desc: 'Barba com toalha quente e navalha.' },
      { id: 's3', name: 'Corte + barba', dur: 60, price: 70, desc: 'Combo completo com desconto.' },
      { id: 's4', name: 'Escova', dur: 60, price: 60, desc: 'Escova modeladora com hidratação rápida.' },
      { id: 's5', name: 'Coloração', dur: 90, price: 140, desc: 'Coloração completa com produtos profissionais.' }
    ];
    const names = ['Carlos Mendes', 'Juliana Rocha', 'Rafael Lima', 'Patrícia Alves', 'Bruno Costa', 'Fernanda Dias', 'Lucas Martins', 'Camila Souza'];
    const clients = names.map((name, i) => ({ id: 'c' + (i + 1), name, phone: `(00) 90000-00${pad(i + 1)}` }));
    const A = (c, s, pro, day, time, status) => ({ id: uid(), clientId: c, serviceId: s, pro, date: addDays(today, day), time, status, notes: '' });
    const appts = [
      A('c1', 's3', 'Bruno', 0, '09:00', 'confirmado'), A('c2', 's4', 'Ana', 0, '09:30', 'confirmado'),
      A('c3', 's1', 'Bruno', 0, '10:30', 'agendado'), A('c4', 's5', 'Ana', 0, '13:00', 'agendado'),
      A('c5', 's2', 'Bruno', 0, '14:00', 'confirmado'), A('c6', 's1', 'Bruno', 0, '16:30', 'agendado'),
      A('c7', 's3', 'Bruno', 1, '10:00', 'agendado'), A('c8', 's4', 'Ana', 1, '15:00', 'agendado'),
      A('c1', 's1', 'Bruno', -14, '11:00', 'concluido'), A('c2', 's5', 'Ana', -20, '14:00', 'concluido'),
      A('c3', 's3', 'Bruno', -7, '17:00', 'concluido'), A('c5', 's2', 'Bruno', -3, '09:00', 'cancelado'),
      A('c6', 's1', 'Bruno', -10, '18:00', 'concluido'), A('c4', 's4', 'Ana', -5, '10:00', 'concluido')
    ];
    return { services, clients, appts };
  }

  let db;
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch (_) { db = null; }
  if (!db || !Array.isArray(db.appts)) db = seed();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (_) {} };

  const state = { day: today, pro: 'Todos', view: 'agenda', search: '' };
  const svc = id => db.services.find(s => s.id === id) || { name: 'Serviço removido', dur: 30, price: 0 };
  const cli = id => db.clients.find(c => c.id === id) || { name: 'Cliente removido', phone: '' };

  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2400); }

  function waLink(a) {
    const c = cli(a.clientId), s = svc(a.serviceId);
    const when = a.date === today ? 'hoje' : new Date(a.date + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
    const msg = `Olá, ${c.name.split(' ')[0]}! Passando para lembrar do seu horário de ${s.name} ${when} às ${a.time}. Podemos confirmar?`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  }

  /* ---------- AGENDA ---------- */
  function dayAppts() {
    return db.appts.filter(a => a.date === state.day && (state.pro === 'Todos' || a.pro === state.pro)).sort((a, b) => a.time.localeCompare(b.time));
  }

  function renderAgenda() {
    $('#day-input').value = state.day;
    $('#day-label').textContent = fmtDay(state.day) + (state.day === today ? ' · hoje' : '');
    $('#pro-filter').innerHTML = ['Todos', ...PROS].map(p => `<button type="button" class="${p === state.pro ? 'on' : ''}" data-pro="${esc(p)}">${esc(p)}</button>`).join('');

    const list = dayAppts();
    const active = list.filter(a => a.status !== 'cancelado');
    $('#k-total').textContent = active.length;
    $('#k-conf').textContent = list.filter(a => a.status === 'confirmado').length;
    $('#k-rev').textContent = money(active.reduce((t, a) => t + Number(svc(a.serviceId).price), 0));

    // ocupação por slot
    const busy = new Set();
    active.forEach(a => { const st = toMin(a.time); for (let m = st; m < st + Number(svc(a.serviceId).dur); m += STEP) busy.add(m); });
    let free = 0, html = '';
    for (let m = OPEN; m < CLOSE; m += STEP) {
      const t = toTime(m);
      const here = list.filter(a => a.time === t);
      let cell;
      if (here.length) {
        cell = here.map(a => { const c = cli(a.clientId), s = svc(a.serviceId);
          return `<button type="button" class="ag-appt s-${a.status}" data-appt="${a.id}"><span class="ag-av">${esc(initials(c.name))}</span><span class="ag-appt-main"><strong>${esc(c.name)}</strong><small>${esc(s.name)} · ${s.dur} min · ${esc(a.pro)}</small></span><span class="ag-badge b-${a.status}">${STATUS[a.status]}</span><span class="ag-price">${money(s.price)}</span></button>`; }).join('');
      } else if (busy.has(m)) {
        cell = `<div class="ag-free" style="border-style:solid;opacity:.5;display:flex;align-items:center">em atendimento</div>`;
      } else { free++; cell = `<button type="button" class="ag-free" data-free="${t}">+ Livre · agendar ${t}</button>`; }
      html += `<li class="ag-slot"><span class="ag-time">${t}</span><div style="display:flex;flex-direction:column;gap:6px">${cell}</div></li>`;
    }
    $('#slots').innerHTML = html;
    $('#k-free').textContent = free;

    // próximos
    const next = active.filter(a => a.status !== 'concluido').slice(0, 6);
    $('#next-list').innerHTML = next.length ? next.map(a => { const c = cli(a.clientId), s = svc(a.serviceId);
      return `<li><span class="ag-av">${esc(initials(c.name))}</span><span><b>${esc(c.name)}</b><small>${esc(s.name)}</small></span><span class="when">${a.time}</span><a class="wa" href="${waLink(a)}" target="_blank" rel="noopener noreferrer" title="Enviar lembrete pelo WhatsApp">WhatsApp</a></li>`; }).join('')
      : '<li class="ag-empty">Nenhum cliente pendente neste dia.</li>';
  }

  /* ---------- CLIENTES ---------- */
  function renderClients() {
    const q = state.search.toLowerCase();
    const rows = db.clients.filter(c => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q)).map(c => {
      const hist = db.appts.filter(a => a.clientId === c.id && a.status === 'concluido').sort((a, b) => b.date.localeCompare(a.date));
      const total = hist.reduce((t, a) => t + Number(svc(a.serviceId).price), 0);
      return `<tr><td><span class="ag-av">${esc(initials(c.name))}</span>${esc(c.name)}</td><td>${esc(c.phone)}</td><td>${hist.length}</td><td>${hist[0] ? new Date(hist[0].date + 'T12:00').toLocaleDateString('pt-BR') : '—'}</td><td>${money(total)}</td><td><button type="button" class="ag-row-btn" data-client="${c.id}">Editar</button></td></tr>`;
    });
    $('#client-rows').innerHTML = rows.join('') || '<tr><td colspan="6" class="ag-empty">Nenhum cliente encontrado.</td></tr>';
  }

  /* ---------- SERVIÇOS ---------- */
  function renderServices() {
    $('#service-cards').innerHTML = db.services.map(s => `<button type="button" class="ag-service" data-service="${s.id}"><h3>${esc(s.name)}</h3><p>${esc(s.desc || '')}</p><div class="row"><span class="ag-badge b-agendado">${s.dur} min</span><b>${money(s.price)}</b></div></button>`).join('');
  }

  function render() {
    ['agenda', 'clientes', 'servicos'].forEach(v => { $('#view-' + v).hidden = v !== state.view; });
    document.querySelectorAll('.ag-tab').forEach(b => { const on = b.dataset.view === state.view; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
    if (state.view === 'agenda') renderAgenda(); else if (state.view === 'clientes') renderClients(); else renderServices();
  }

  /* ---------- MODAL ---------- */
  const modal = $('#modal');
  let onSave = null, onDelete = null;
  function openModal(title, body, save, del) {
    $('#modal-title').textContent = title; $('#modal-body').innerHTML = body;
    onSave = save; onDelete = del; $('#modal-delete').hidden = !del;
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
    const first = $('#modal-body input, #modal-body select'); if (first) first.focus();
  }
  const closeModal = () => { if (modal.open) modal.close(); };
  $('#modal-close').onclick = closeModal; $('#modal-cancel').onclick = closeModal;
  $('#modal-delete').onclick = () => { if (onDelete && confirm('Excluir este registro da demonstração?')) { onDelete(); save(); closeModal(); render(); } };
  $('#modal-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!$('#modal-form').reportValidity()) return;
    const f = Object.fromEntries(new FormData($('#modal-form')).entries());
    const err = onSave && onSave(f);
    if (err) { toast(err); return; }
    save(); closeModal(); render();
  });

  function apptForm(a) {
    const opt = (arr, val, lab) => arr.map(x => `<option value="${esc(x.v)}" ${x.v === val ? 'selected' : ''}>${esc(x.l)}</option>`).join('');
    const times = []; for (let m = OPEN; m < CLOSE; m += STEP) times.push({ v: toTime(m), l: toTime(m) });
    return `<label class="wide">Cliente<select name="clientId" required><option value="">Selecione…</option>${opt(db.clients.map(c => ({ v: c.id, l: c.name })), a.clientId)}<option value="__new">+ Novo cliente…</option></select></label>
      <label class="wide" id="new-client-wrap" hidden>Nome do novo cliente<input name="newName" maxlength="60" placeholder="Nome e sobrenome"></label>
      <label class="wide">Serviço<select name="serviceId" required>${opt(db.services.map(s => ({ v: s.id, l: `${s.name} · ${s.dur} min · ${money(s.price)}` })), a.serviceId)}</select></label>
      <label>Profissional<select name="pro">${opt(PROS.map(p => ({ v: p, l: p })), a.pro)}</select></label>
      <label>Status<select name="status">${opt(Object.entries(STATUS).map(([v, l]) => ({ v, l })), a.status)}</select></label>
      <label>Data<input type="date" name="date" required value="${esc(a.date)}"></label>
      <label>Horário<select name="time">${opt(times, a.time)}</select></label>
      <label class="wide">Observações<textarea name="notes" rows="2" maxlength="200" placeholder="Opcional">${esc(a.notes || '')}</textarea></label>`;
  }
  function editAppt(a) {
    const isNew = !a.id;
    const base = a.id ? a : { clientId: '', serviceId: db.services[0]?.id, pro: state.pro === 'Todos' ? PROS[0] : state.pro, status: 'agendado', date: state.day, time: a.time || '09:00', notes: '' };
    openModal(isNew ? 'Novo agendamento' : 'Editar agendamento', apptForm(base), f => {
      let clientId = f.clientId;
      if (clientId === '__new') {
        const name = (f.newName || '').trim(); if (!name) return 'Informe o nome do novo cliente.';
        clientId = 'c' + uid(); db.clients.push({ id: clientId, name, phone: '' });
      }
      const st = toMin(f.time), en = st + Number(svc(f.serviceId).dur);
      const clash = db.appts.find(x => x.id !== a.id && x.date === f.date && x.pro === f.pro && x.status !== 'cancelado' && f.status !== 'cancelado' && toMin(x.time) < en && st < toMin(x.time) + Number(svc(x.serviceId).dur));
      if (clash) return `${f.pro} já tem ${cli(clash.clientId).name} às ${clash.time}. Escolha outro horário.`;
      const rec = { clientId, serviceId: f.serviceId, pro: f.pro, status: f.status, date: f.date, time: f.time, notes: f.notes || '' };
      if (isNew) db.appts.push({ id: uid(), ...rec }); else Object.assign(a, rec);
      state.day = f.date; toast(isNew ? 'Agendamento criado!' : 'Agendamento atualizado!');
    }, isNew ? null : () => { db.appts = db.appts.filter(x => x !== a); toast('Agendamento excluído.'); });
    const sel = $('#modal-body select[name=clientId]');
    sel.addEventListener('change', () => { $('#new-client-wrap').hidden = sel.value !== '__new'; });
  }
  function editClient(c) {
    const isNew = !c;
    c = c || { name: '', phone: '' };
    openModal(isNew ? 'Novo cliente' : 'Editar cliente',
      `<label class="wide">Nome<input name="name" required maxlength="60" value="${esc(c.name)}"></label><label class="wide">Telefone<input name="phone" maxlength="20" placeholder="(00) 00000-0000" value="${esc(c.phone)}"></label>`,
      f => { if (isNew) db.clients.push({ id: 'c' + uid(), name: f.name.trim(), phone: f.phone.trim() }); else { c.name = f.name.trim(); c.phone = f.phone.trim(); } toast(isNew ? 'Cliente cadastrado!' : 'Cliente atualizado!'); },
      isNew ? null : () => { db.clients = db.clients.filter(x => x !== c); toast('Cliente excluído.'); });
  }
  function editService(s) {
    const isNew = !s;
    s = s || { name: '', dur: 30, price: 0, desc: '' };
    openModal(isNew ? 'Novo serviço' : 'Editar serviço',
      `<label class="wide">Nome<input name="name" required maxlength="40" value="${esc(s.name)}"></label><label>Duração (min)<select name="dur">${[30, 60, 90, 120].map(d => `<option ${d === Number(s.dur) ? 'selected' : ''}>${d}</option>`).join('')}</select></label><label>Preço (R$)<input name="price" type="number" min="0" step="1" required value="${esc(s.price)}"></label><label class="wide">Descrição<input name="desc" maxlength="80" value="${esc(s.desc)}"></label>`,
      f => { const rec = { name: f.name.trim(), dur: Number(f.dur), price: Number(f.price), desc: f.desc.trim() }; if (isNew) db.services.push({ id: 's' + uid(), ...rec }); else Object.assign(s, rec); toast(isNew ? 'Serviço criado!' : 'Serviço atualizado!'); },
      isNew ? null : () => { db.services = db.services.filter(x => x !== s); toast('Serviço excluído.'); });
  }

  /* ---------- EVENTOS ---------- */
  document.querySelectorAll('.ag-tab').forEach(b => b.addEventListener('click', () => { state.view = b.dataset.view; render(); }));
  $('#day-prev').onclick = () => { state.day = addDays(state.day, -1); render(); };
  $('#day-next').onclick = () => { state.day = addDays(state.day, 1); render(); };
  $('#day-today').onclick = () => { state.day = today; render(); };
  $('#day-input').onchange = e => { if (e.target.value) { state.day = e.target.value; render(); } };
  $('#pro-filter').onclick = e => { const b = e.target.closest('[data-pro]'); if (b) { state.pro = b.dataset.pro; render(); } };
  $('#slots').onclick = e => {
    const ap = e.target.closest('[data-appt]'); if (ap) return editAppt(db.appts.find(a => a.id === ap.dataset.appt));
    const fr = e.target.closest('[data-free]'); if (fr) editAppt({ time: fr.dataset.free });
  };
  $('#new-appt').onclick = () => editAppt({});
  $('#new-client').onclick = () => editClient(null);
  $('#new-service').onclick = () => editService(null);
  $('#client-rows').onclick = e => { const b = e.target.closest('[data-client]'); if (b) editClient(db.clients.find(c => c.id === b.dataset.client)); };
  $('#service-cards').onclick = e => { const b = e.target.closest('[data-service]'); if (b) editService(db.services.find(s => s.id === b.dataset.service)); };
  $('#client-search').oninput = e => { state.search = e.target.value; renderClients(); };
  $('#reset-demo').onclick = () => { if (confirm('Restaurar os dados de exemplo? O que você cadastrou será apagado deste navegador.')) { db = seed(); save(); state.day = today; render(); toast('Exemplos restaurados.'); } };
  $('#note-close').onclick = () => { $('#ag-note').remove(); };
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  render();
})();
