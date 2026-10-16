# Design

## Context

Ver `proposal.md` para a motivação. Estado atual verificado no código:

- `ParteInicial.preambulo` é `Conteudo | string`. `buildProjetoNormaFromJsonix` entrega o texto bruto e `buildJsonixFromProjetoNorma` (`montaParagrafosPreambulo`) já aceita string ou objeto com `.texto`; um preâmbulo com vários parágrafos vira `<p>..</p><p>..</p>` na string e volta a ser vários parágrafos ao salvar.
- A ementa é um `Dispositivo` completo: tipo `Ementa`, classe `EmentaLexml` na factory, `RegrasEmenta`, `isEmenta`, inclusão em `getElementos`, CSS `.ementa`, id `'ementa'` em `buscaDispositivoById`, paginação e filtros dos diálogos de remissão. O documento padrão traz o preâmbulo com `content: ['']`, que é o critério de "vazio".
- `bloqueado` já bloqueia a edição de ponta a ponta: `createElemento` o copia para o `Elemento`, `atualizaTextoElemento`/`atualizaElemento` recusam a ação, teclado e clipboard o respeitam e o CSS exibe o cadeado.
- A ementa é a "linha de referência" antes do primeiro artigo ou agrupador em vários pontos (`ajustaReferencia`, `agrupaElemento`, `removeElemento`, `undoRedoReducerUtil`, `elementoUtil`, `paginacaoUtil`, `navegaEntreDispositivosAlterados`). Com um preâmbulo no meio, esses pontos precisam apontar para ele.
- A URN de uma proposição tem o formato `urn:lex:br:<autoridade>:<tipo>[;<sigla>]:...`, por exemplo `projeto.lei;pl`. `getTipo` já isola o segmento do tipo e `getAutoridade` o da autoridade; a sigla é o que vem depois de `;`.

## Goals / Non-Goals

**Goals:**
- Representar o preâmbulo como dispositivo bloqueado, sem ações, carregado como a ementa.
- Aplicar o texto padrão por tipo da URN quando o preâmbulo estiver vazio, em proposição nova e na abertura.
- Manter inalterado o comportamento de salvar e abrir de um preâmbulo com vários parágrafos.

**Non-Goals:**
- Editar o preâmbulo ou oferecer ações sobre ele.
- Detectar remissões no texto do preâmbulo, inclusive a citação do art. 60 no texto da PEC.
- Escolher o texto da MPV pelo gênero do titular do cargo.
- Definir texto padrão para tipos fora do mapa (SCD, ECD e outros ainda não previstos).

## Decisions

### D1. Tipo `Preambulo` com classe própria, espelhando a ementa
`tipoDispositivo.ts` ganha `preambulo` (`tipo: 'Preambulo'`, `tagId: 'pre'`, `tiposPermitidosPai: ['Articulacao']`, sem filhos), a factory ganha `PreambuloLexml` com `RegrasPreambulo` e `tipo.ts` ganha `isPreambulo`. O dispositivo recebe `bloqueado = true`, `id = 'preambulo'` e `rotulo = ''`.
Alternativa descartada: reaproveitar o tipo `Ementa` com um marcador. Espalharia condicionais em todos os pontos que já testam `isEmenta` e confundiria as regras de ação.

### D2. `RegrasPreambulo.getAcoesPossiveis` devolve sempre `[]`
O preâmbulo não oferece ações, nem TAB e SHIFT+TAB (retornam `undefined`, como a ementa). O bloqueio de edição vem do `bloqueado`, não das regras.

### D3. Preâmbulo só existe quando tem texto
`buildProjetoNormaFromJsonix` cria o dispositivo apenas se, depois de `retiraCaracteresDesnecessarios`, houver texto ou texto padrão. Caso contrário `projetoNorma.preambulo` fica `undefined`, nenhuma linha é criada e `hasPreambulo` é falso. Isso evita linha vazia e bloqueada e reduz o impacto nos testes que contam elementos.

### D4. Texto padrão em `VOCABULARIO.preambulosPadrao`, indexado pelo tipo da URN
Mapa novo `{ urnTipoDocumento, urnAutoridade?, texto }[]`, com `getPreambuloPadrao(urn)` em `urnUtil.ts`. A chave é o tipo da URN sem o `;sigla` (`urn.split(';')[0]` do segmento do tipo), ou seja, `projeto.lei`, `projeto.lei.complementar`, `projeto.lei.conversao`, `projeto.decreto.legislativo`, `projeto.resolucao`, `proposta.emenda.constitucional` e `medida.provisoria`. A busca tenta primeiro tipo mais autoridade e depois só o tipo. A autoridade só é necessária em `projeto.resolucao`: `senado.federal` (PRS), `camara.deputados` (PRC) e `congresso.nacional` (PRN).
Isso dispensa resolver a sigla: PL, PLS, PLC e PLN caem em `projeto.lei` sem depender de `getSigla`, que para `projeto.lei` podia devolver `PLN` ou `PLS` conforme a ordem de `siglas`.
Consequência aceita: `projeto.decreto.legislativo` cobre também PDS e PDN, que passam a receber "O CONGRESSO NACIONAL decreta:".
Alternativas descartadas: indexar por sigla (depende de `getSigla` e deixaria o PLN de fora de `fakeUrns`); campo `preambulo` em cada item de `fakeUrns` (duplicaria o texto do PL).

### D5. O padrão vale na carga, sem distinguir proposição nova de documento aberto
Os dois fluxos passam por `buildProjetoNormaFromJsonix`, então a regra "vazio mais tipo conhecido implica padrão" fica em um único lugar. Consequência aceita: um arquivo antigo com preâmbulo vazio ganha o padrão no próximo salvamento.
Normas não precisam de regra própria: o padrão depende do tipo, e tipos como `lei` ou `decreto.lei` não aparecem no mapa.

### D6. Vários parágrafos preservados no dispositivo e exibidos em uma única linha
Para manter a especificação existente (`abrir-documento-articulado` e `salvar-documento-articulado`), o `texto` do dispositivo continua guardando o HTML com `<p>..</p><p>..</p>` e `montaParagrafosPreambulo` o devolve como vários parágrafos. O Quill não aceita bloco dentro da linha (`Cannot insert block into EtaBlotConteudo`, comprovado pelo teste do componente com dois parágrafos), então só o `Elemento` do preâmbulo, criado em `createElemento`, recebe o texto com os `<p>` removidos e os parágrafos separados por espaço. Como o dispositivo é bloqueado, o texto exibido nunca é reescrito no dispositivo.

### D7. Função única para a "última linha da parte inicial"
Uma função em `hierarquiaUtil.ts` (nome sugerido `getUltimoDispositivoDaParteInicial`) devolve o preâmbulo quando existe e, senão, a ementa. `ajustaReferencia`, `elementoUtil` (referência anterior e `getElementos`), `agrupaElemento`, `removeElemento`, `undoRedoReducerUtil`, `paginacaoUtil` e `navegaEntreDispositivosAlterados` passam a usá-la onde hoje leem `projetoNorma.ementa` como referência de posição. `getElementos` e `paginacaoUtil` incluem também o preâmbulo na lista, logo depois da ementa. O cursor inicial continua na ementa.
Alternativa descartada: ajustar cada ponto com seu próprio `if (preambulo)`, o que repetiria a regra em oito lugares.

### D8. Validação, diálogos e id
`conteudoValidator` não gera avisos para o preâmbulo. `remissaoDialog` e `remissaoInternaDialog` excluem `'Preambulo'` junto com `'Ementa'`. `buscaDispositivoById` resolve `'preambulo'`. `inicializaRemissoesExternasAoAbrir` não varre o preâmbulo.

### D9. Interface
`getClasseCSS` em `eta-container-table.ts` e o padding em `eta-container-td-esquerdo.ts` tratam `Preambulo` como a ementa (sem recuo de nível), e o CSS ganha a classe correspondente. Os desvios `elemento.tipo === 'Ementa'` em `editor.component.ts` (`getLinha`) precisam cobrir `Preambulo`.

## Risks / Trade-offs

- [Esquecer um ponto que usa a ementa como referência e inserir linha acima do preâmbulo] → centralizar em D7 e cobrir com testes de adicionar artigo e agrupador a partir da ementa, remover o primeiro agrupador e desfazer e refazer.
- [Chave por tipo amplia o padrão para PDS e PDN, não listados originalmente] → aceito em D4; cobrir com teste para tornar o comportamento explícito.
- [URN com autoridade inesperada em `projeto.resolucao` fica sem padrão] → aceito: preâmbulo vazio é válido; testar o caso.
- [Testes existentes que contam elementos de documentos com tipo conhecido passam a ter uma linha a mais] → D3 limita o efeito a documentos com texto ou padrão; atualizar os testes afetados.
- [Arquivos antigos mudam ao serem salvos de novo por ganharem o padrão] → comportamento aceito (D5), registrado nas specs.
- [Multi-parágrafo exibido de forma imperfeita no Quill] → aceito (D6): os parágrafos aparecem juntos em uma linha, mas são preservados ao salvar.

## Open Questions

- Concordância nominal do texto padrão da MPV ("O PRESIDENTE DA REPÚBLICA ... adota a seguinte Medida Provisória") para o caso de titular do gênero feminino. Pendência registrada, sem impacto nas specs atuais, na abordagem ou nas tarefas.
- Textos padrão para tipos fora do mapa (SCD, ECD e outros ainda não previstos). Não definidos; o preâmbulo vazio é válido para eles.
