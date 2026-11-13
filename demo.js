'use strict';
(() => {
  const STORAGE_KEY = 'pmv-tech-orcamentos-demo-v1';
  const EXAMPLES = [
    {id:'ex-001',code:'PMV-001',client:'Studio Aurora',service:'Site profissional',value:4200,date:'2026-11-10',status:'Aprovado',notes:'Exemplo fictício.'},
    {id:'ex-002',code:'PMV-002',client:'Oficina Horizonte',service:'Sistema sob medida',value:14800,date:'2026-11-08',status:'Em análise',notes:'Exemplo fictício.'},
    {id:'ex-003',code:'PMV-003',client:'Clínica Monte Azul',service:'Dashboard e relatórios',value:6500,date:'2026-11-06',status:'Enviado',notes:'Exemplo fictício.'},
    {id:'ex-004',code:'PMV-004',client:'Ateliê Brisa',service:'Automação de processos',value:3900,date:'2026-11-05',status:'Aprovado',notes:'Exemplo fictício.'},
    {id:'ex-005',code:'PMV-005',client:'Comercial Prisma',service:'Integração de sistemas',value:12500,date:'2026-11-03',status:'Rascunho',notes:'Exemplo fictício.'},
    {id:'ex-006',code:'PMV-006',client:'Papelaria Sol',service:'Site profissional',value:3100,date:'2026-11-01',status:'Recusado',notes:'Exemplo fictício.'}
  ];
  const STATUSES = ['Rascunho','Enviado','Em análise','Aprovado','Recusado'];
  const COLORS = {'Rascunho':'#859bb1','Enviado':'#75b6f9','Em análise':'#d5aa6c','Aprovado':'#45e0b9','Recusado':'#e293a2'};
  const CLASSES = {'Rascunho':'status-rascunho','Enviado':'status-enviado','Em análise':'status-em-análise','Aprovado':'status-aprovado','Recusado':'status-recusado'};
  const $ = id => document.getElementById(id);
  const copy = values => JSON.parse(JSON.stringify(values));
  let quotes = [], canPersist = true, toastTimer, lastFocus = null;
  const money = n => Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const formatDate = date => {const [y,m,d]=String(date).split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('pt-BR');};
  const localDate = () => {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const safe = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = s => String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const showToast = msg => {clearTimeout(toastTimer);const el=$('toast');el.textContent=msg;el.classList.add('show');toastTimer=setTimeout(()=>el.classList.remove('show'),3300);};
  const validateRecord = q => q && typeof q.id==='string' && typeof q.client==='string' && typeof q.service==='string' && Number.isFinite(Number(q.value)) && Number(q.value)>=0 && /^\d{4}-\d{2}-\d{2}$/.test(q.date) && STATUSES.includes(q.status);
  function readQuotes(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw === null){quotes=copy(EXAMPLES);writeQuotes();}
      else{const data=JSON.parse(raw);quotes=Array.isArray(data)?data.filter(validateRecord).map(q=>({...q,value:Number(q.value)})):copy(EXAMPLES);}
    }catch(_){quotes=copy(EXAMPLES);canPersist=false;showToast('Armazenamento indisponível: alterações valem só durante esta visita.');}
  }
  function writeQuotes(){
    if(!canPersist)return;
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(quotes));}catch(_){canPersist=false;showToast('Não foi possível salvar no navegador; os registros permanecem nesta página.');}
  }
  function chart(){
    const total=quotes.length, approved=quotes.filter(q=>q.status==='Aprovado').length;
    const approvedPercent=total?Math.round(approved/total*100):0;
    $('stat-count').textContent=String(total);
    $('stat-value').textContent=money(quotes.reduce((sum,q)=>sum+q.value,0));
    $('stat-approved').textContent=String(approved);
    $('stat-open').textContent=String(quotes.filter(q=>q.status==='Enviado'||q.status==='Em análise').length);
    $('sidebar-count').textContent=String(total);
    $('approval-percent').textContent=`${approvedPercent}%`;
    $('approval-ring').style.background=`conic-gradient(#35e3c4 0% ${approvedPercent}%, #203b4c ${approvedPercent}% 100%)`;
    const counts=Object.fromEntries(STATUSES.map(s=>[s,quotes.filter(q=>q.status===s).length]));
    $('status-bars').innerHTML=STATUSES.map(s=>`<div class="bar-item"><span class="bar-label"><i class="bar-dot" style="background:${COLORS[s]}"></i>${safe(s)}</span><span class="bar-track"><i class="bar-fill" style="width:${total?(counts[s]/total*100):0}%;background:${COLORS[s]}"></i></span><span class="bar-number">${counts[s]}</span></div>`).join('');
  }
  function currentResults(){
    const query=normalize($('quote-search').value.trim()),status=$('status-filter').value,sort=$('sort-filter').value;
    const filtered=quotes.filter(q=>(status==='todos'||q.status===status)&&(!query||normalize([q.client,q.service,q.code,q.status,q.notes||''].join(' ')).includes(query)));
    filtered.sort((a,b)=>{
      if(sort==='maior')return b.value-a.value;
      if(sort==='menor')return a.value-b.value;
      if(sort==='cliente')return a.client.localeCompare(b.client,'pt-BR');
      if(sort==='antigos')return a.date.localeCompare(b.date)||a.code.localeCompare(b.code);
      return b.date.localeCompare(a.date)||b.code.localeCompare(a.code);
    });return filtered;
  }
  function renderTable(){
    const visible=currentResults(),tbody=$('quote-table-body');
    tbody.innerHTML=visible.map(q=>`<tr><td><div class="cell-main"><span class="client-icon">${safe(q.client.trim().slice(0,2).toUpperCase())}</span><span><span class="client-name">${safe(q.client)}</span><span class="quote-code">${safe(q.code)}</span></span></div></td><td>${safe(q.service)}</td><td><span class="amount-cell">${money(q.value)}</span></td><td>${formatDate(q.date)}</td><td><span class="status-pill ${CLASSES[q.status]}"><i></i>${safe(q.status)}</span></td><td><div class="row-actions"><button class="row-action" title="Editar orçamento" aria-label="Editar orçamento de ${safe(q.client)}" data-action="edit" data-id="${safe(q.id)}" type="button">✎</button><button class="row-action danger" title="Excluir orçamento" aria-label="Excluir orçamento de ${safe(q.client)}" data-action="delete" data-id="${safe(q.id)}" type="button">×</button></div></td></tr>`).join('');
    $('empty-state').hidden=visible.length>0;
    $('result-count').textContent=String(visible.length);
    $('visible-count').textContent=String(visible.length);
    $('total-count').textContent=String(quotes.length);
  }
  function render(){chart();renderTable();}
  function nextCode(){
    const high=quotes.reduce((max,q)=>Math.max(max,Number(/^PMV-(\d+)$/.exec(q.code)?.[1]??0)),0);
    return `PMV-${String(high+1).padStart(3,'0')}`;
  }
  function newId(){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`local-${Date.now()}-${Math.floor(Math.random()*1e8)}`;}
  function openModal(id=null){
    const q=id?quotes.find(q=>q.id===id):null;
    lastFocus=document.activeElement;
    $('quote-form').reset();
    $('modal-title').textContent=q?'Editar orçamento':'Novo orçamento';
    $('quote-id').value=q?.id??'';
    $('quote-client').value=q?.client??'';
    $('quote-service').value=q?.service??'';
    $('quote-value').value=q?.value??'';
    $('quote-date').value=q?.date??localDate();
    $('quote-status').value=q?.status??'Rascunho';
    $('quote-notes').value=q?.notes??'';
    $('modal-save').textContent=q?'Salvar alterações':'Salvar orçamento';
    $('quote-modal').hidden=false;document.body.classList.add('no-scroll');
    $('quote-client').focus();
  }
  function closeModal(){ $('quote-modal').hidden=true;document.body.classList.remove('no-scroll');if(lastFocus?.isConnected)lastFocus.focus(); }
  function submitQuote(e){
    e.preventDefault();if(!$('quote-form').reportValidity())return;
    const id=$('quote-id').value,client=$('quote-client').value.trim(),service=$('quote-service').value,status=$('quote-status').value,
      value=Number($('quote-value').value),date=$('quote-date').value,notes=$('quote-notes').value.trim();
    if(!client||!service||!date||!STATUSES.includes(status)||!Number.isFinite(value)||value<=0||value>999999999){showToast('Confira os dados do orçamento.');return;}
    if(id){const old=quotes.find(q=>q.id===id);if(!old){showToast('Este orçamento não foi encontrado.');return;}Object.assign(old,{client,service,value,date,status,notes});showToast('Orçamento atualizado com sucesso.');}
    else{quotes.push({id:newId(),code:nextCode(),client,service,value,date,status,notes});showToast('Orçamento cadastrado com sucesso.');}
    writeQuotes();closeModal();render();
  }
  function removeQuote(id){const q=quotes.find(x=>x.id===id);if(!q)return;
    if(!window.confirm(`Excluir o orçamento ${q.code} de ${q.client}? Esta ação não pode ser desfeita.`))return;
    quotes=quotes.filter(x=>x.id!==id);writeQuotes();render();showToast('Orçamento excluído.');
  }
  function exportCsv(){
    if(!quotes.length){showToast('Não há orçamentos para exportar.');return;}
    const clean=v=>{let s=String(v??'');if(/^[\s]*[=+@\-]/.test(s))s="'"+s;return `"${s.replace(/"/g,'""')}"`;};
    const cols=['Código','Cliente','Serviço','Valor (R$)','Data','Status','Observações'];
    const data=quotes.map(q=>[q.code,q.client,q.service,q.value.toFixed(2).replace('.',','),formatDate(q.date),q.status,q.notes||'']);
    const csv='\ufeff'+[cols,...data].map(r=>r.map(clean).join(';')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
    const a=document.createElement('a');a.href=url;a.download='pmv-orcamentos-demonstracao.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    showToast('Arquivo CSV gerado.');
  }
  function initialize(){
    $('demo-year').textContent=new Date().getFullYear();
    readQuotes();render();
    ['new-quote-top','new-quote-small','new-quote'].forEach(id=>$(id).addEventListener('click',()=>openModal()));
    ['export-csv','export-csv-small'].forEach(id=>$(id).addEventListener('click',exportCsv));
    ['quote-search','status-filter','sort-filter'].forEach(id=>$(id).addEventListener(id==='quote-search'?'input':'change',renderTable));
    $('quote-table-body').addEventListener('click',e=>{
      const btn=e.target.closest('button[data-action]');if(!btn)return;
      if(btn.dataset.action==='edit')openModal(btn.dataset.id);
      if(btn.dataset.action==='delete')removeQuote(btn.dataset.id);
    });
    $('quote-form').addEventListener('submit',submitQuote);
    ['modal-close','modal-cancel'].forEach(id=>$(id).addEventListener('click',closeModal));
    $('quote-modal').addEventListener('mousedown',e=>{if(e.target===$('quote-modal'))closeModal();});
    document.addEventListener('keydown',e=>{
      if($('quote-modal').hidden)return;
      if(e.key==='Escape'){e.preventDefault();closeModal();}
      if(e.key==='Tab'){
        const els=[...$('quote-modal').querySelectorAll('button:not([disabled]),input:not([type=hidden]),select,textarea')].filter(el=>el.offsetParent!==null);
        if(!els.length)return;
        const first=els[0],last=els[els.length-1];
        if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
      }
    });
    $('empty-reset').addEventListener('click',()=>{$('quote-search').value='';$('status-filter').value='todos';$('sort-filter').value='recentes';renderTable();});
    $('reset-demo').addEventListener('click',()=>{if(!confirm('Restaurar os exemplos fictícios? Isso substituirá os orçamentos desta demonstração salvos neste navegador.'))return;quotes=copy(EXAMPLES);writeQuotes();$('quote-search').value='';$('status-filter').value='todos';$('sort-filter').value='recentes';render();showToast('Exemplos restaurados.');});
    $('dismiss-info').addEventListener('click',()=>{$('dismiss-info').closest('.demo-alert').hidden=true;});
    const sidebar=$('demo-sidebar'),scrim=$('demo-scrim'),open=$('sidebar-open');
    const toggleSide=isOpen=>{sidebar.classList.toggle('open',isOpen);scrim.hidden=!isOpen;open.setAttribute('aria-expanded',String(isOpen));};
    open.addEventListener('click',()=>toggleSide(true));$('sidebar-close').addEventListener('click',()=>toggleSide(false));scrim.addEventListener('click',()=>toggleSide(false));
    sidebar.querySelectorAll('.side-link').forEach(a=>a.addEventListener('click',()=>toggleSide(false)));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sidebar.classList.contains('open'))toggleSide(false);});
  }
  initialize();
})();
