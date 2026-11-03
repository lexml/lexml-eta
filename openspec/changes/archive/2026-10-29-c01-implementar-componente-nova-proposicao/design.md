# Design

## Context

Ver `proposal.md` (Why). Estado atual relevante:

- A spec `nova-proposicao` e `docs/requisitos/componente-nova-proposicao.md` definem as telas, as RN e o contrato com o host; o componente não existe em `src/`.
- `LexmlEtaComponent.novaProposicao(dados)` já aceita URN, epígrafe, preâmbulo, `urnDocumentoReferenciado`, `colegiadoApreciador`, `documentoModelo` e `anexoParecer`. O resultado do componente mapeia quase 1:1 nesses campos (`texto` → `documentoModelo`).
- O destino é um `DestinoComponent` (`lexml-eta-destino`) criado e lido em `lexml-eta.component.ts` (`_lexmlDestino`, `destinoAoAbrir`, coleta em `getDocumentoArticulado`/proposição, aplicação em `novaProposicao`/abertura). Também alimenta o local do fecho. `Proposicao.colegiadoApreciador` nasce com valor padrão.
- O vocabulário tem duas visões (`getVocabularioDaCasa`, `getVocabularioCompleto`); o componente usa só a da casa. `isSubstitutivo(urn)` e a lista de tipos com `tipoRelacaoSubstitutivo` já existem (#1056).
- A demo usa o `web-dev-server` com um middleware de mocks (`/parlamentares`, `/comissoes`, `/api/autocomplete-norma`) e uma combo com os documentos de `demo/doc` (arquivos `.ts` de dados puros, sem imports; faltam `.json` para `plp_137_2019`, `plc_artigos_agrupados` e `pl_agrupadores`).
- `getPreambuloPadrao` devolve `undefined` sem modelo; `buildProjetoNormaFromJsonix` (linha ~361) usa esse `undefined` para não criar preâmbulo ao abrir.

## Goals / Non-Goals

**Goals:**
- Componente autônomo (sem efeito colateral), testável por unidade e por E2E, que só emite eventos.
- Demo mostrando o fluxo completo contra URLs simuladas realistas, sem segunda porta nem CORS.
- Colegiado apreciador tratado como metadado de origem externa (como `anexoParecer`), sem formulário no `lexml-eta`.

**Non-Goals:**
- Tratamento real de upload/parser de DOCX, TXT e LexML (outra issue).
- Serviço de epígrafe (#1053) e diálogo "Alterar dados básicos do documento".
- Backend de demo na demo publicada em gh-pages (estática); os mocks só valem no `npm start`.

## Decisions

### D1. Estrutura do componente

`src/components/nova-proposicao/`: um custom element raiz (`lexml-nova-proposicao`) que mantém o estado do fluxo e três subviews (Tela 1, 2 e 3), mais módulos puros sem DOM:

- `montaUrnNovaProposicao` (RN-11 a RN-14, RN-22, URN com sufixo `@apresentacao.substitutivo` no SF e `999999`/ano corrente nos demais);
- `siglasNovaProposicao` (RN-00/RN-00a: filtro por `tipoRelacaoSubstitutivo`, ordem ativos antes de inativos);
- `identificacaoDocumento` (RN-08), `epigrafePadrao` (caso padrão) e `urlsNovaProposicao` (placeholders, maiúsculas e sem zeros à esquerda).

**Por quê:** as regras de maior risco (URN, listas, placeholders) ficam em funções puras testáveis sem navegador; o custom element só orquestra. **Alternativa descartada:** um único arquivo grande com a lógica dentro do `LitElement`, mais difícil de cobrir.

Inicialização: o setter de configuração valida as três URLs obrigatórias (erro que identifica a ausente), assume `SF` como casa padrão e chama `inicializarVocabulario(casa)`. Todo o fluxo usa `getVocabularioDaCasa()`.

### D2. Epígrafe e preâmbulo

O componente chama o serviço de epígrafe do vocabulário se existir; hoje não existe, então gera o caso padrão (`<TIPO POR EXTENSO EM MAIÚSCULAS> Nº   , DE <ANO>`), sem sufixo. A chamada fica atrás de uma função única, para o #1053 substituir sem mudar o contrato do evento.

O fallback do preâmbulo (log de erro de preâmbulo não encontrado para a URN + `O CONGRESSO NACIONAL decreta:`) fica **no próprio componente**, aplicado quando `getPreambuloPadrao` devolve `undefined`. `getPreambuloPadrao` não muda.

**Por quê (decisão do usuário, divergindo do texto da issue):** mantém a abertura de documentos intacta; `buildProjetoNormaFromJsonix` usa o `undefined` para não criar preâmbulo e continua assim. **Alternativa descartada:** colocar a regra em `getPreambuloPadrao`, que faria documentos abertos de tipo sem modelo ganharem preâmbulo. A divergência com a issue e com `docs/requisitos/componente-nova-proposicao.md` (5.2) é corrigida na documentação (task 1.1).

### D3. Upload simulado

A opção "Importar documento" valida extensão (DOCX, TXT, LexML/XML/JSON) e tamanho (5 MB) e, ao **Continuar**, **não chama URL nem lê o arquivo**: devolve um resultado de parser com erro simulado fixo, que leva à Tela 3. A fronteira é uma função assíncrona única (`converterArquivoImportado(file)`), de modo que a issue futura troque só a implementação.

### D4. Backend da demo

`demo/server/` com handlers puros `(url) → { status, body }` e dados em JSON (`comissoes.json` por casa, índice de documentos), ligados ao middleware existente de `web-dev-server.config.mjs` sob o prefixo `/demo-api/`:

| Rota | Resposta |
|---|---|
| `GET /demo-api/comissoes/{casa}` | lista JSON (`siglaCasaLegislativa`, `sigla`, `nome`), 10 itens por casa |
| `GET /demo-api/proposicoes/{sigla}/{numero}/{ano}` | `200 { ementa, textoEstruturadoDisponivel }` ou `404` |
| `GET /demo-api/proposicoes/{sigla}/{numero}/{ano}/texto` | `200` JSONIX ou `404` |

- **Comissões:** 10 de SF e 10 de CN extraídas de `docs/comissoes-sf.json` e `docs/comissoes-cn.json`; para a CD, `docs/comissoes-cd.json` é idêntico ao do CN (só `CN`), então 10 comissões reais da Câmara são escritas à mão e marcadas como dado simulado. Os arquivos de `docs/` eram só fonte de extração (o usuário os apaga antes do apply): as 10 comissões de cada casa já estão salvas em `exemplos/comissoes-{sf,cn,cd}.json` nesta change e são copiadas para `demo/server/dados/` na task 2.1.
- **Proposições:** índice das chaves da combo da demo cuja sigla (da URN) é PL, PLP ou MPV (MPV para o fluxo do PLV). Ementa e JSONIX saem do documento. "PL 3/2023 (sem texto LexML)" responde `200` com `textoEstruturadoDisponivel: false` e `404` no texto (cobre a RN-09). Número/ano comparados sem zeros à esquerda.
- **Leitura dos documentos:** os `demo/doc/*.ts` são dados sem imports, mas o `package.json` não é `type: module`, então o Node não importa o `out-tsc` diretamente. Um script do projeto (`npm run generate:demo-json`) **sempre** gera o `.json` de cada documento a partir do `.ts`, e o servidor lê apenas esses `.json`. Assim os três documentos sem `.json` (`plp_137_2019`, `plc_artigos_agrupados`, `pl_agrupadores`) entram no índice, e os demais não divergem do `.ts`.

**Por quê o middleware existente:** mesma origem (sem CORS), sem processo extra no `npm start`, sem dependência nova. **Alternativa descartada:** servidor Express em outra porta, rodado por `concurrently`; adiciona porta, CORS e dependência sem ganho para uma demo.

### D5. Integração na demo

`demoview.ts`: o botão "Nova proposição" abre um `sl-dialog` modal com o componente, configurado com `casaLegislativaEditor` da demo e as três URLs `/demo-api/...`. Em `nova-proposicao-concluida`, a demo fecha o modal e chama `novaProposicao({ urn, epigrafe, preambulo, urnDocumentoReferenciado, colegiadoApreciador, documentoModelo: texto, anexoParecer })`; em `nova-proposicao-cancelada` só fecha. O modal é recriado a cada abertura, descartando o estado anterior. Ao trocar a casa na demo, a configuração do componente é reaplicada.

### D6. Colegiado apreciador sem formulário

`Proposicao.colegiadoApreciador` passa a opcional (sem valor padrão). O `lexml-eta` guarda o colegiado recebido de `novaProposicao` ou lido do arquivo, e:

- grava `lexedit:ColegiadoApreciador` só se existir (e nunca em anexo de parecer, como hoje);
- ao abrir, aplica o elemento lido se existir; sem ele, fica sem colegiado;
- usa o colegiado, quando existe, para derivar o local do fecho; sem colegiado e sem local lido, "Sala das Sessões";
- a regra do local lido do arquivo (hoje comparada com `destinoAoAbrir`) passa a valer enquanto o colegiado for o lido ao abrir; como o colegiado não é mais editável, o local lido vale sempre que existir.

Remove-se `src/components/destino/`, `_lexmlDestino`, `destinoAoAbrir`, a aba "Destino" (rótulo vira "Data, Autoria e Impressão") e o código do `DestinoComponent` em `index.ts`, além de `getComissoes`/`comissoes` e `urlComissoes` de `LexmlEtaConfig` se não houver outro consumidor.

**Por quê:** é o mesmo modelo do `anexoParecer`, já estabelecido: metadado definido na criação e persistido, não editável no editor. **Alternativa descartada:** manter o formulário somente leitura; mantém código e dependência de `urlComissoes` sem função.

### D7. Testes

- **Unidade:** módulos puros do componente (URN, siglas, URLs, identificação, epígrafe) e o fallback do preâmbulo; conversores de colegiado condicional (ida e volta); local do fecho sem colegiado; handlers do `demo/server/`.
- **Componente:** cenários da spec `nova-proposicao` por tela (padrões de espécie/destino/parecer, Verificar, RN-09, upload simulado, Voltar, Cancelar).
- **E2E Cypress** (ver `docs/guia-cypress.md`; Shadow DOM e `sl-*` exigem `dispatchEvent` e seletores do light DOM da demo): fluxo Tela 1 → 2 → conclusão com criação no editor; Substitutivo com texto referenciado; PLV com MPV; Tela 3 via upload simulado; cancelamento. As URLs simuladas rodam no dev server da demo.

## Risks / Trade-offs

- **[BREAKING no host]** `lexeditweb-editor` perde o formulário de destino e precisa tratar `Proposicao.colegiadoApreciador` ausente → documentar na change e na migração (`docs/migracao-interface-lexml-eta.md`); o host deve fornecer `casaLegislativaEditor`, `urlVerificacaoProposicao`, `urlTextoEstruturado` e `urlComissoes` ao componente.
- **[Documentos antigos]** arquivos salvos antes tinham `ColegiadoApreciador` sempre gravado; continuam abrindo e mantêm o colegiado. Arquivos sem o elemento passam a abrir sem colegiado (antes: Plenário padrão) → o local do fecho cai em "Sala das Sessões", igual ao antigo padrão.
- **[Mocks fiéis ao dado de teste]** o índice depende dos documentos de teste da demo; renomear/remover um deles altera as respostas → o teste dos handlers valida PL/PLP/MPV conhecidos.
- **[Local do fecho]** o local segue "Sala das Sessões" (Plenário ou sem colegiado) e "Sala da Comissão" (Comissão). A capitalização "Sessões"/"Comissão" já foi aplicada ao código e aos testes (a pedido do usuário); arquivos salvos antes mantêm o local gravado.
- **[Epígrafe provisória]** a epígrafe do caso padrão não cobre substitutivo/PLV/sufixo de destino do SF → aceitável até o #1053; função única de troca.
- **[Remover `urlComissoes`]** pode quebrar hosts que ainda a leem de `lexmlEtaConfig` → só remover após conferir consumidores; caso contrário, manter e marcar como obsoleta.

## Migration Plan

1. Entregar o componente e o fallback do preâmbulo (sem alterar comportamento existente).
2. Entregar backend e integração na demo.
3. Retirar o destino do `lexml-eta` (BREAKING) e avisar o `lexeditweb-editor` antes de publicar a versão.
4. Rollback por fase: as fases 1 e 2 são aditivas; a fase 3 reverte restaurando o componente de destino.
