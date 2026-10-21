# Proposal

## Why

O vocabulário de URN (`src/model/lexml/documento/vocabulario`) é uma estrutura plana e global: tipos sem autoridade própria, a relação sigla → autoridade → tipo espalhada entre `tiposDocumento`, `siglas` e `fakeUrns` (com entradas mortas e chaves em convenções diferentes), e nenhum lugar para os atributos que a issue #1026 pede (tipo ativo/inativo, relação com substitutivo). Além disso, o editor passou a ter dois modos, o LexEdit (Senado, `SF`) e o Infoleg Editor (Câmara, `CD`), cujos vocabulários não devem se misturar. Esta change organiza o vocabulário por autoridade, monta um vocabulário mesclado **por casa legislativa do editor** e substitui as tabelas paralelas por um único cadastro de tipos de documento, com o modelo documentado em `docs/requisitos/vocabulario.md`.

## What Changes

- Manter `vocabulario/` com uma constante por autoridade (`federal`, `senado`, `camara`, `congresso`) e uma comum (`atalhosUrn`, `eventos`), agora mescladas **por casa**: `SF` = `federal` + `senado` + `congresso`; `CD` = `federal` + `camara` + `congresso`. O vocabulário de uma casa não contém nada exclusivo da outra.
- Nova propriedade `LexmlEtaConfig.casaLegislativaEditor` (`SF` ou `CD`, padrão `SF`), distinta de `casaLegislativa` (casa do documento, que segue como está, inclusive com `CN`). Valor ausente ou inválido assume `SF` com aviso.
- O vocabulário mesclado passa a ficar em uma **variável estática** (uma instância do componente por página), (re)inicializada pelo `LexmlEtaComponent` sempre que `lexmlEtaConfig` é atribuída. Não há mais constante global fixa.
- Novo modelo de `tiposDocumento`: `urnTipoDocumento` e `sigla` (opcional, só proposições) separados no lugar de `urn`; chave `urnAutoridade + urnTipoDocumento + sigla`; URN do tipo calculada (`urnTipoDocumento;sigla` em minúsculas); atributos `ativo` (padrão `true`), `tipoRelacaoSubstitutivo` e `tiposReferenciaveis`. A mesclagem calcula `tiposDocumentoAtivos` e valida o vocabulário (sigla única entre ativos; referências existentes e que aceitam substitutivo).
- **Remover** `fakeUrns` e `siglas`: a URN nova sai do tipo ativo da sigla, e a sigla de uma URN sai do segmento de tipo.
- Consultas novas: listar tipos ativos e inativos, tipo pela sigla, tipo pela URN, tipos de referência de um substitutivo.
- Resolução de tipo, sigla e preâmbulo **sempre pela autoridade exata** da URN, sem fallback para outra autoridade. Uma URN de autoridade e tipo que o vocabulário da casa não declara simplesmente não resolve.
- **BREAKING (URN gerada para proposição nova)**: `MPV` passa de `urn:lex:br:senado.federal:medida.provisoria;mpv` para `urn:lex:br:federal:medida.provisoria;mpv`, e `PLV` de `senado.federal` para `congresso.nacional`. Sem compatibilidade com a URN antiga de MPV.
- **BREAKING (resolução)**: documento de uma casa com tipo ou autoridade que só existe no vocabulário da outra (ex.: `camara.deputados:projeto.lei;pl` aberto no editor do Senado) deixa de resolver; a antiga URN de PLV com `senado.federal` também deixa de resolver.
- **BREAKING (host)**: o host passa a informar `casaLegislativaEditor` na configuração; sem ela o editor assume `SF`.
- **BREAKING (texto padrão do preâmbulo)**: o preâmbulo padrão depende de tipo + autoridade da URN (`projeto.lei` para SF/CD/CN; `projeto.lei.complementar` e `proposta.emenda.constitucional` para SF e CD; `projeto.decreto.legislativo` para SF, CD e CN; `projeto.lei.conversao` só para o CN; `medida.provisoria` só para `federal`; `projeto.resolucao` por SF, CD e CN). Combinação fora da tabela, ou fora do vocabulário da casa, fica sem texto padrão.
- Corrigir os fixtures `mpv_930_2020` e o teste de preâmbulo da MPV para a URN correta (já feito).

## Capabilities

### New Capabilities
- `vocabulario-urn`: organização do vocabulário por autoridade e por casa legislativa do editor, modelo e validação do tipo de documento, consultas (tipos ativos/inativos, sigla, URN, referência de substitutivo), autoridade da URN gerada para proposição nova e resolução sem fallback.

### Modified Capabilities

- `preambulo-proposicao`: o texto padrão do preâmbulo passa a ser escolhido pelo tipo **e** pela autoridade da URN, dentro do vocabulário da casa.

## Impact

- Código: `vocabulario/` (tipos, módulos por autoridade, mesclagem por casa, estado estático), `urnUtil.ts` (`getTipo`, `getTipoDocumentoUrn`, `getSigla`, `buildFakeUrn`, `getPreambuloPadrao` e novas consultas), `lexmlEtaConfig.ts` e `lexml-eta.component.ts` (inicialização).
- Consumidores de `getTipo`/`getSigla`: `buildProjetoNormaFromJsonix.ts`, `adicionaAlteracaoComAssistente.ts`, `atualizaReferenciaElemento.ts`, `colarUtil.ts`, `dispositivoValidator.ts`, `documentoArticulado.ts`; passam a tratar o "não resolve" sem quebrar.
- Testes: caracterização reescrita para o novo modelo, testes de `urnUtil`/vocabulário/preâmbulo rodando para as duas casas, ajustes em `documentoArticulado.test.ts` (MPV).
- Host (`lexeditweb-editor` e Infoleg Editor): informar `casaLegislativaEditor`; URN nova de MPV/PLV com a nova autoridade; arquivos de uma casa não abrem tipos da outra.
- Documentação: `docs/requisitos/vocabulario.md` (modelo e requisitos), `caso-de-uso-nova-proposicao.md` e `pendencias.md` (MPV com autoridade `federal`).
- Fora de escopo: preencher `tiposReferenciaveis` do SF (negócio), concordância de gênero do preâmbulo da MPV, tipos sem texto padrão (SCD, ECD) e a tela de nova proposição que consome as consultas.
