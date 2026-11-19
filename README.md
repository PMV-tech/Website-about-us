# PMV Sistemas — Site institucional + demonstração interativa

Site estático em **HTML, CSS e JavaScript**, com visual responsivo, conteúdo em português e demonstração funcional de um painel de orçamentos. Não exige Node, banco de dados, hospedagem paga nem etapas de build.

## Arquivos

- `index.html` — landing page institucional da PMV Sistemas
- `demonstracao.html` — painel ilustrativo e interativo de orçamentos
- `styles.css` / `main.js` — estilo e interação do site
- `demo.css` / `demo.js` — estilo e funções do painel
- `assets/` — logotipo e favicon

## Testar localmente

Abra `index.html` em um navegador. Para testar em servidor local (recomendado), na pasta do projeto execute:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000/`.

## Publicar com GitHub Pages

### No repositório já existente da PMV

O repositório institucional público da PMV foi encontrado em:
`https://github.com/PMV-tech/Website-about-us`

Faça backup dos arquivos atuais se quiser preservá-los. Copie os arquivos desta pasta para a **raiz** do repositório, substituindo `index.html` e inserindo os demais arquivos. Depois faça o commit:

```bash
git add .
git commit -m "feat: renovar site PMV e adicionar demo de orçamentos"
git push origin main
```

Se GitHub Pages já estiver configurado para a branch `main`, o novo site deverá ser disponibilizado no endereço publicado pelo projeto após o deploy. Confira **Settings > Pages** do repositório.

### Em um novo repositório

Coloque o projeto na raiz e publique a branch `main` com GitHub Pages selecionando `Deploy from a branch` / `main` / `/ (root)`.

## Novo: animações e PMV Flow Lab

A página inicial agora inclui uma experiência interativa **PMV Flow Lab**, com três cenários fictícios: orçamentos perdidos, agenda desorganizada e tarefas repetitivas. O visitante escolhe um desafio e clica em **Executar simulação** para visualizar uma sequência animada de entendimento, organização e aplicação da tecnologia. Os exemplos são conceituais e **não** representam integrações existentes ou métricas de clientes.

O site também tem animação de entrada de elementos durante a rolagem, barra de progresso de leitura, brilho discreto que segue o mouse, efeito 3D de movimento no painel inicial, cartões com iluminação no hover e movimento suave de elementos de fundo.

**Arquivos adicionados**: `experience.css` e `experience.js`, ambos carregados pela página `index.html`. Não exigem bibliotecas ou instalação. A experiência é responsiva, pode ser utilizada com teclado e respeita `prefers-reduced-motion` (recurso de acessibilidade do sistema operacional). Para desativar as animações novas, retire as duas tags `experience.css`/`experience.js` do `index.html`; o restante do site continua funcionando.

## Sobre a demonstração

- Os dados iniciais são **inteiramente fictícios**.
- O visitante pode **cadastrar, editar, excluir, pesquisar, filtrar e ordenar** orçamentos.
- Os totais e gráficos são atualizados de acordo com os registros do navegador.
- É possível **exportar CSV** para consulta em planilhas.
- Os registros são mantidos em `localStorage`, **apenas no navegador**. Não existe login real, banco de dados, API ou envio de informações para a PMV.
- **Restaurar exemplos** substitui os registros locais pelos dados fictícios iniciais.

## Contato e personalização

O contato oficial presente no site é o Instagram público [@pmv_sistemas](https://www.instagram.com/pmv_sistemas/). O formulário de briefing abre o **WhatsApp com a mensagem preparada**, para que o visitante revise e envie manualmente. Nada é transmitido para um servidor da PMV por esse formulário.

Para editar textos, serviços, cores ou links:

- Textos e blocos da landing page: `index.html`
- Paleta de cores: início de `styles.css` (variáveis `:root`)
- Links de contato: pesquise `instagram.com/pmv_sistemas` no código
- Dados fictícios, status e valores de exemplo: bloco `EXAMPLES` de `demo.js`

## Antes de usar comercialmente

A demonstração **não substitui uma solução de produção**. Para armazenar dados reais de clientes, seria necessário um backend, autenticação, permissões, banco de dados, backups e tratamento apropriado de privacidade e segurança.

---

**PMV Sistemas** — tecnologia que move negócios.

## Checklist de lançamento (novembro/2026)

- `privacidade.html` e `termos.html` — Política de Privacidade (LGPD) e Termos de Uso, linkadas no rodapé.
- `consent.js` — aviso de cookies em todas as páginas; o analytics só carrega se o visitante aceitar. **Para ativar o Google Analytics 4**, preencha `GA4_ID` no topo de `consent.js` com o ID `G-XXXXXXXXXX`.
- `404.html` — página de erro personalizada (o GitHub Pages usa automaticamente).
- `sitemap.xml` + `robots.txt` — envie o sitemap no Google Search Console.
- `assets/og-image.jpg` (prévia ao compartilhar o link) e `assets/apple-touch-icon.png`.
- Formulário de briefing com validação de tamanho mínimo e anti-spam (campo isca + tempo mínimo).
- Logo da seção “Sobre” otimizado (`pmv-logo-640.png`) e cores de rótulos pequenos ajustadas para contraste AA.
- Se o domínio mudar, troque `https://pmv-tech.github.io/Website-about-us` nas tags `canonical`/`og:*`, no `sitemap.xml`, no `robots.txt` e no `404.html`.

## Animações cinematográficas (`cinema.css` / `cinema.js`)

Duas seções logo após o topo da página inicial, inspiradas em sites "cinematográficos":

- **Jornada (`#jornada`)** — ~2.600 partículas (1.300 no celular) em estilo metal líquido que se transformam conforme a rolagem: gota → sistema → engrenagem → gráfico → logotipo PMV. A câmera "atravessa" um campo de estrelas que acelera com a velocidade da rolagem; títulos entram com desfoque e há uma trilha lateral de progresso. No desktop, as partículas fogem do cursor.
- **Vitrine (`#vitrine`)** — palco escuro com holofote mostrando três sistemas (agenda, orçamentos e automação). A rolagem aproxima a câmera do sistema central enquanto textos gigantes correm ao fundo em direções opostas (parallax em camadas).

Sem bibliotecas; só anima o que está visível na tela. Para quem ativa "reduzir movimento" no sistema, as seções viram conteúdo estático. Para remover, apague as duas `<section>` e as tags `cinema.css`/`cinema.js` do `index.html`.
