# Handoff — persistência dos metadados do LexEdit (#991, #992, #993, #994, #997, #1011)

Atualizado em 29/10/2026.

Branch: `feat/992-salvar-pendencias-jsonix`. Ela reúne as issues que gravam e reabrem no documento articulado (JSONIX/LexML) o que antes ficava só no editor: alerta e pendência de justificação (#1011, #992), justificação (#991), notas de rodapé (#993), revisões de texto da justificação (#994) e data da última modificação (#997). Todas as changes OpenSpec dessas issues estão implementadas, commitadas e arquivadas.

## Como retomar

1. `git pull`, `npm install`. A branch está 1 commit à frente de `origin` (`a49a8bb8`, arquivamento da #997), ainda sem push.
2. Ler o item 13 do `CLAUDE.md` (padrão por grupo dos metadados do LexEdit) e os itens 20–23 (invariantes desta branch).
3. Nunca commitar sem pedido explícito. Ao commitar a pedido, sem coautor e com o plano aprovado antes.

## Estado

- **Última sessão (27–29/10/2026):**
  - #994 concluída (revisões `ins`/`del` da justificação);
  - merge da `develop` com 170 commits (`725bbb41`);
  - #997 concluída (`dataUltimaModificacao`, commit `93fbd504` do usuário e arquivamento `a49a8bb8`).
- **Testes:**
  - `npm test` completo: passa.
  - Integração com o CLI real (`JSONIX_LEXML_CLI=C:/jsonix-lexml-win/desenv/jsonix-lexml-win.exe npm run test:documento-articulado:xml`): 33 de 35. As 2 falhas são de `OutrosMetadados` e exigem o CLI **2.3.0**; só o 2.1.0 está instalado.
  - Cypress `documento-articulado/*` + `revisao/*` + `pena/*`: as únicas falhas já existem na `develop` (ver "Pendências").
- **Arquivos de sessão:** `docs/sessao/` voltou a ser versionado pelo merge da `develop` (`4dfb8c68`), apesar da linha `docs/sessao/` no `.gitignore`. O `TODO.md` local tem alteração não commitada.

## Decisões do usuário (não reabrir)

- **#994:**
  - a marca de revisão grava `usuario|date|id-revisao|id-usuario|sigla-usuario`;
  - cada `ins`/`del` tem id `_rt<id-revisao>_<n>` e um `RevisaoTextual` próprio;
  - `ins`/`del` sem metadado abre como "Anônimo", com a data da abertura;
  - a pendência é calculada no montador.
- **#994, contador:** o badge de revisões dos editores de texto rico conta só as marcas do Quill (`contaRevisoesArticulacao` no switch, invariante (aq) do `CLAUDE.md`).
- **#997:**
  - `substitutivo` fica fora: foi retirado do esquema na #1017, e o texto da issue no GitHub está desatualizado;
  - `dataUltimaModificacao` é o instante de cada salvamento, gerado no componente e não no conversor (invariante (ar)), com leitura tolerante;
  - o valor lido é exposto no getter `dataUltimaModificacaoDocumento`, que salvar não altera;
  - `aplicacao` e `versaoAplicacao` são omitidos.
- **Merge:**
  - a justificação continua gravada em documento de tipo não suportado (a `develop` só esconde destino e autoria);
  - as invariantes desta branch no `CLAUDE.md` passaram para (an)–(ar), e os itens para 20–23.

## Pendências (fora do escopo das changes)

- **3 specs Cypress que já falham na `develop`:**
  - `abertura-pena.cy.ts` e `pena/pena.cy.ts`: o seletor `sl-dialog` acha também o diálogo de anexos;
  - `anexo-parecer-data-fecho.cy.ts`: o modo anexo de parecer agora vem do arquivo, e o fixture não o tem.
- **CLI `jsonix-lexml` 2.3.0:** instalar para os cenários de `OutrosMetadados` da integração passarem.
- **Coordenação com o `lexeditweb-editor`:**
  - o `onchange` agora também dispara por edições na justificação (#1011);
  - as marcas de revisão ganharam os atributos `id-usuario` e `sigla-usuario` (#994);
  - há uma propriedade nova, `dataUltimaModificacaoDocumento` (#997).
- **Documentação da `develop`:**
  - letras de invariantes repetidas ((ai)–(am)) nos itens 17–19 do `CLAUDE.md`;
  - a seção 4.2 de `docs/api-componente-lexml-eta.md` ainda lista `substitutivo`, removido na #1056.
- **Largura de tabela e coluna:** o plugin de tabelas não guarda a largura, e a issue para isso ainda precisa ser aberta.

## Dicas

- **Servidor de desenvolvimento:** encerrar só o `npm start` deixa órfãos o `wds` e o `tsc --watch`. Um servidor órfão antigo serviu código desatualizado e deixou o demo em branco no Cypress. Ao encerrar, derrube também os filhos (filtre por `CreationDate`), e rode o `npm test` só com o servidor parado, porque ele apaga `out-tsc/`.
- **Porta 8001:** há um servidor de desenvolvimento do usuário rodando nela. Não mexer.
- **Testes de componente que salvam duas vezes:** use `congelarRelogio()`/`restaurarRelogio()` (`test/doc/documentoArticulado.ts`). Não congele o arquivo inteiro, porque `moduloNotaRodape` gera ids só com `new Date().getTime()`.
- **Fixtures E2E:** são gerados pelo `getDocumentoArticulado()` real, por exemplo abrindo o demo com o Playwright (`node_modules/playwright`), nunca escritos à mão.
