## Context

Ver proposal.md para a motivação completa (backfill de uma capability já implementada e entregue em duas ondas). Este documento resume as decisões técnicas de cada onda, com base nos planos originais em `docs/planos/` e no histórico em `docs/referencia/REMISSAO_EXTERNA.md` (nenhum versionado no git).

Cronologia:
- **Onda 1 — fluxo manual** (14/05/2026 em diante, plano `PLANO_REMISSAO_EXTERNA.md`): modelo de dados (`RemissaoExternaValue`), diálogo unificado com aba Externa, blot Quill próprio, popup (Abrir/Editar/Excluir), persistência via o mesmo elemento `<Remissao>` da remissão interna. Sem detecção automática — todo link nasce de uma ação explícita do usuário.
- **Onda 2 — detecção automática via WASM** (v1.0.0, 13–18/08/2026, plano `PLANO_INTEGRACAO_LEXML_LINKER_WASM.md`): integra o `lexml-linker` (parser Haskell já usado em produção pelo LexML/Senado, compilado para `wasm32-wasi`) rodando em Web Worker, reaproveitando por completo o modelo de dados e a renderização da Onda 1 — a automação só adiciona a origem "detectada" a um link que, uma vez criado, é indistinguível de um manual.

## Goals / Non-Goals

**Goals:**
- Documentar, como requisitos testáveis, o comportamento observável final das duas ondas.
- Registrar as decisões arquiteturais com efeito observável duradouro — em particular, por que a coordenação entre detecção interna e externa precisou de um mecanismo assíncrono, e por que a remissão externa não tem invalidação como a interna.
- Preencher a lacuna encontrada durante este backfill: o popup de ações (Abrir/Editar/Excluir) existe em produção (`getRemissaoExternaEmCursor` em `moduloRemissao.ts`, wiring em `editor.component.ts`) mas nunca tinha sido documentado como requisito.
- Registrar os riscos/limitações conhecidos e **ainda não corrigidos** (R9-R12 do plano WASM, a corrida de assentamento, a janela de save fire-and-forget, o bloqueador de publicação do artefato) para que não se percam junto com os documentos soltos que os descrevem.

**Non-Goals:**
- Não documenta mecanismos internos descartados no caminho (nenhum identificado nesta capability — ao contrário da remissão interna, não houve troca de arquitetura de um mecanismo já em produção).
- Não cobre `remissao-interna` além de citar os pontos de acoplamento (diálogo, gatilho de blur, popup compartilhados, exclusão de spans conflitantes).
- Não propõe nenhuma correção para os riscos conhecidos listados abaixo — são documentados como estão, para decisão de produto futura.
- Não cobre o lado `lexeditweb-editor` (config Spring para servir `.wasm.br` com `Content-Encoding: br`) — fica em outro repositório, plano próprio (`PLANO_INTEGRACAO_WASM_LEXEDITWEB.md` lá).

## Decisions

**Seleção de texto obrigatória para criação manual (diferente da remissão interna).** Remissão interna tem um rótulo canônico do dispositivo destino para usar como texto do link quando não há seleção; remissão externa não tem nenhum rótulo local disponível para uma norma externa, então a seleção prévia é o único fluxo suportado.

**Detecção automática cria o link diretamente, sem diálogo de confirmação** — mesma filosofia da auto-detecção da remissão interna (D1 do plano WASM): consistência de UX entre as duas capabilities irmãs, e a cobertura estreita do parser (ver riscos R9/R10) já funciona como um filtro natural contra falsos positivos custosos.

**Parser rodando 100% local em Web Worker, sem chamada de rede na detecção.** `resolverUrl` é só um prefixo de string usado para montar o `href` no modo `outputType: "html"` — não há requisição HTTP durante o parsing em si. Rodar em Worker (não na thread principal) evita bloquear a UI durante a inicialização/execução do WASM.

**Coordenação assíncrona no próprio gatilho de blur, não duplicação de gramática em regex JS.** Alternativa descartada: replicar em JS a gramática de reconhecimento de norma do `lexml-linker` (Lei, Decreto, Decreto-Lei, Emenda Constitucional, apelidos etc.) como guarda na detecção interna. Rejeitada por ser duplicação frágil, sem controle de versão compartilhado com o parser upstream. Escolhido: delegar ao próprio `lexml-linker` a decisão "isso é uma citação de norma", aceitando o custo de uma etapa assíncrona no caminho de detecção — mitigado pelo fato de a detecção (interna e externa) já só rodar no blur, não mais a cada tecla, desde a Detecção Híbrida por Blur da remissão interna.

**Externa tem precedência sobre interna no mesmo trecho.** Quando um número de artigo citado numa referência externa colide com um artigo local, a detecção síncrona (interna) roda primeiro e pode criar um falso positivo transitório; assim que a externa (assíncrona) resolve, a remissão interna conflitante é removida — tanto do registro quanto do link já renderizado. Esse falso positivo pré-existente na detecção interna (`REGEX_ABSOLUTA` sem guarda contra ser seguida de citação de norma) é exposto, não introduzido, por este trabalho.

**`RemissaoExternaValue` sem invalidação, ao contrário de `RemissaoInternaValue`.** A remissão interna detecta quando o dispositivo destino é removido porque ambos vivem na mesma árvore observável; a remissão externa aponta para uma norma fora do documento — não há como o sistema saber se ela deixou de existir. Se o link ficar obsoleto, o portal de normas simplesmente mostra uma página de erro ao ser aberto. Aceito como comportamento definitivo, não uma lacuna a fechar.

**Nome amigável da norma não é persistido, é recalculado sob demanda.** `targetNomeNorma` não é derivável da URN sozinha (o parser devolve URN + HTML decorado, nunca um nome amigável) — remissões automáticas nascem com esse campo vazio; ao editar, uma busca reversa por URN (reaproveitando `autocomplete-norma`/`urnInicial`, já existente para outro fluxo) preenche o campo. Alternativa descartada: persistir o nome no próprio LexML salvo — rejeitada por não haver atributo no formato `<Remissao>` para isso, e por já existir tolerância no código a esse campo vazio (matcher de link legado colado via clipboard).

**Popup reaproveitado sem estrutura nova, mudando só a ação principal ("Abrir" em vez de "Ir").** Uma vez criado (manual ou automaticamente), um link de remissão externa é indistinguível na UI de um manual — mesma interface `RemissaoExternaValue`, mesmo blot, mesmo componente de popup da remissão interna. "Abrir" leva ao portal de normas configurado (`urlPortalNormas`), sem deep link para o dispositivo específico — o portal não suporta apontar para um dispositivo dentro da norma.

**Persistência no mesmo elemento `<Remissao>` da remissão interna, diferenciado pela forma do `href`.** Remissão interna usa um id local (`"art2_par1"`); remissão externa usa a URN completa (`"urn:lex:br:federal:lei:1990-07-13;8069"`, com fragmento após `!` quando disponível) — distinção suficiente para deserialização sem ambiguidade, sem precisar de um elemento LexML próprio.

## Risks / Trade-offs

- [Risco, upstream, não corrigido] Cobertura de apelidos populares (ECA, CDC, CTN, CPC, Código Civil, Código Penal) é estreita no parser — "Código Civil"/"Código Penal" existem no código-fonte do `lexml-linker` mas são inalcançáveis por nenhum caso ativo da gramática → Mitigação: nenhuma no `lexml-eta`; usuário pode criar a remissão manualmente. Decisão de reportar/estender upstream é de produto, pendente.
- [Risco, upstream, não corrigido] `"CF/88"` (Constituição abreviada, ano de 2 dígitos) é reconhecido mas gera URN quebrada (`urn:lex:br:federal:constituicao:88;88`, confirmado contra o resolver real) → Travado como caso de teste, não corrigido; reportar ao mantenedor do `lexml-linker` antes de confiar nesse padrão no fluxo automático.
- [Risco, upstream, não corrigido] Padrão "art. X a art. Y e art. Z" (faixa de 3+ artigos) perde o primeiro item — achado em texto real de proposição (MPV 1085/2021) → Travado como regressão de teste, fora do controle do `lexml-eta`.
- [Risco, cobertura de teste] Cypress (framework E2E oficial do projeto) não tem engine WebKit; a mecânica WASM+Worker só foi validada manualmente em Safari via Playwright, fora da suíte oficial → Qualquer regressão específica de Safari só apareceria em teste manual ou uso real.
- [Risco, real, não corrigido] Corrida entre o assentamento inicial de uma proposição recém-criada e a detecção externa assíncrona: o documento continua sofrendo alguma mutação estrutural por um período depois de "Art. 1º existir", e a latência variável do Worker ocasionalmente cai dentro dessa janela, produzindo um link na posição errada do texto. Causa raiz exata (qual mutação continua ocorrendo) não identificada → Mitigado só no teste E2E (`cy.wait(1500)` fixo); risco real de produção documentado em `docs/analises/ANALISE_CORRIDA_ASSENTAMENTO_NOVA_PROPOSICAO.md`, não corrigido.
- [Trade-off, decisão consciente] `coordenarDeteccaoExterna` é fire-and-forget para não bloquear `getProjetoAtualizado()` (API pública síncrona) — salvar a menos de dezenas de ms de digitar uma citação externa, sem sair da linha antes, pode gerar um save sem aquela remissão específica → Aceito como opção B entre três avaliadas (ver `PLANO_INTEGRACAO_LEXML_LINKER_WASM.md` §8.3); não corrigido.
- [Bloqueador de produção, não corrigido] O artefato `.wasm`/`.wasm.br` **não chega ao pacote publicado** (`dist/`) — `rollup.config.dist.js` não copia `src/util/lexml-linker/vendor/` para a distribuição. Bloqueia o funcionamento da detecção automática em qualquer build publicado do componente consumido por um host externo (ex.: `lexeditweb-editor`) até ser resolvido.
- [Trade-off] Ganho de rede da compressão Brotli (0,88 MB vs. 6,9 MB) só se realiza se o host servir o arquivo com `Content-Encoding: br` — sem essa configuração, o `.wasm` cru é servido normalmente (funcional, só sem o ganho). Configuração do lado do host é responsabilidade de cada consumidor.
- [Risco] Licença LGPL-2.1 do `lexml-linker` vinculada a um projeto GPL-2.0-only (`lexml-eta`) — tecnicamente compatível (biblioteca LGPL pode ser vinculada em projeto GPL), mas não documentada formalmente em nenhum arquivo de licenciamento do projeto.
- [Risco, dependência externa] A branch `linker-wasm32` do `lexml-linker` (fonte do artefato vendorizado) não está mesclada oficialmente e não tem testes automatizados próprios — um commit específico foi pinado como dependência vendorizada/fork; merge oficial upstream é gate de produção, não bloqueou o início do trabalho.

## Migration Plan

Não aplicável — este documento formaliza retroativamente uma funcionalidade já em produção (com os riscos conhecidos acima ainda em aberto), sem nenhuma mudança de comportamento ou dado a migrar.
