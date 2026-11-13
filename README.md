# PMV Tech — Site institucional + demonstração interativa

Site estático em **HTML, CSS e JavaScript**, com visual responsivo, conteúdo em português e demonstração funcional de um painel de orçamentos. Não exige Node, banco de dados, hospedagem paga nem etapas de build.

## Arquivos

- `index.html` — landing page institucional da PMV Tech
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

## Sobre a demonstração

- Os dados iniciais são **inteiramente fictícios**.
- O visitante pode **cadastrar, editar, excluir, pesquisar, filtrar e ordenar** orçamentos.
- Os totais e gráficos são atualizados de acordo com os registros do navegador.
- É possível **exportar CSV** para consulta em planilhas.
- Os registros são mantidos em `localStorage`, **apenas no navegador**. Não existe login real, banco de dados, API ou envio de informações para a PMV.
- **Restaurar exemplos** substitui os registros locais pelos dados fictícios iniciais.

## Contato e personalização

O contato oficial presente no site é o Instagram público [@pmv.tech](https://www.instagram.com/pmv.tech/). O formulário de briefing apenas **copia uma mensagem**: o visitante precisa abri-lo no Instagram e enviá-lo manualmente. Nada é transmitido para um servidor da PMV.

Para editar textos, serviços, cores ou links:

- Textos e blocos da landing page: `index.html`
- Paleta de cores: início de `styles.css` (variáveis `:root`)
- Links de contato: pesquise `instagram.com/pmv.tech` no código
- Dados fictícios, status e valores de exemplo: bloco `EXAMPLES` de `demo.js`

## Antes de usar comercialmente

A demonstração **não substitui uma solução de produção**. Para armazenar dados reais de clientes, seria necessário um backend, autenticação, permissões, banco de dados, backups e tratamento apropriado de privacidade e segurança.

---

**PMV Tech** — tecnologia que move negócios.
