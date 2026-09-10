# Issues — Salvar/abrir documento-articulado.json

Roteiro de implementação incremental da funcionalidade de salvar e abrir o documento da proposição em `documento-articulado.json` (representação jsonix do LexML com os metadados do LexEdit descritos em [00-especificacao-esquema-lexedit.md](00-especificacao-esquema-lexedit.md)).

Cada issue acrescenta um grupo de elementos aos anteriores. Em todas elas, salvar e abrir deve preservar a informação sem perdas (round-trip), e a validação inclui converter o jsonix salvo de/para XML LexML e conferir o resultado contra o XSD e os exemplos da especificação referenciada.

---

## 1. Salvar e abrir identificação e articulação

Salvar e abrir `documento-articulado.json` com a representação jsonix do LexML contendo apenas a identificação da proposição (inclusive a URN provisória, quando aplicável) e a articulação. Esta issue estabelece a infraestrutura de leitura/escrita do arquivo (diálogos de salvar/abrir, serialização jsonix) que as demais issues reaproveitam. Validar o arquivo convertendo de/para XML com o conversor jsonix e validar o XML gerado contra o esquema LexML.

**Especificação:** [00-especificacao-esquema-lexedit.md](00-especificacao-esquema-lexedit.md), [01-identificacao-provisoria-e-urn.md](01-identificacao-provisoria-e-urn.md)

**Issue:** https://github.com/lexml/lexml-eta/issues/987

## 2. Salvar e abrir opções de impressão

Incluir `lexedit:OpcoesImpressao` no jsonix salvo/aberto. Todos os atributos são opcionais; a ausência de uma opção deve manter o comportamento padrão da aplicação. Por ser o primeiro tíquete a incluir conteúdo em `MetadadoProprietario`, também verifica se o conversor jsonix já lida com os metadados do LexEdit sem precisar conhecer sua estrutura ou se é necessário algum ajuste nele. Validar o arquivo convertendo de/para XML com o conversor jsonix.

**Especificação:** [02-opcoes-de-impressao.md](02-opcoes-de-impressao.md)

**Issue:** https://github.com/lexml/lexml-eta/issues/988

## 3. Salvar e abrir local e data do fecho

Incluir os atributos `local` e `data` de `lexedit:Metadado` no jsonix salvo/aberto, inclusive o caso de `data` ausente ou vazia. Ao salvar, gerar também a representação textual em `LocalDataFecho` prevista no LexML. Validar o arquivo convertendo de/para XML com o conversor jsonix e validar o XML gerado contra o esquema LexML.

**Especificação:** [03-fecho-local-e-data.md](03-fecho-local-e-data.md)

**Issue:** https://github.com/lexml/lexml-eta/issues/989

## 4. Salvar e abrir autoria/assinaturas de parlamentar

Incluir `lexedit:Autoria` no jsonix salvo/aberto, tratando por enquanto apenas o caso `tipo='Parlamentar'` (um ou mais parlamentares, com dados de identificação, sexo, partido e UF). O caso de autoria por comissão fica para uma issue futura. Ao salvar, gerar também a representação textual em `AssinaturaTexto`. Validar o arquivo convertendo de/para XML com o conversor jsonix e validar o XML gerado contra o esquema LexML.

**Especificação:** [04-assinaturas.md](04-assinaturas.md)

**Issue:** https://github.com/lexml/lexml-eta/issues/990

## 5. Salvar e abrir a justificação

Incluir `Justificacao`/`PartePrincipal` no jsonix salvo/aberto, com o conteúdo rico em HTML no subconjunto aceito pelo LexML. Inclui os ajustes de compatibilidade entre o Quill e o LexML: eliminar `br` desnecessários, eliminar `tbody` e os atributos de controle do plugin de tabelas (`table_id`, `row_id`, `cell_id`), gerar `id` no formato `_tabela<sequencial>` para `table` ao salvar (sem necessidade de recuperá-lo na abertura), remover `a.rel` ao salvar e converter `width` entre o `style` do Quill e o atributo do LexML. Validar o arquivo convertendo de/para XML com o conversor jsonix e validar o XML gerado contra o esquema LexML.

**Especificação:** [06-justificacao-e-conteudo-rico.md](06-justificacao-e-conteudo-rico.md)

**Issue:** https://github.com/lexml/lexml-eta/issues/991

## 6. Salvar pendências no jsonix

Incluir `lexedit:Pendencias`/`lexedit:Pendencia` no jsonix salvo, com a lista de condições que impedem o protocolamento da proposição. Implementar nesse tíquete apenas a verificação de justificação não preenchida (mensagem "Não foi informado um texto de justificação."). Validar o arquivo convertendo de/para XML com o conversor jsonix.

**Especificação:** [13-outros-metadados-do-lexedit.md](13-outros-metadados-do-lexedit.md)

**Issue:** https://github.com/lexml/lexml-eta/issues/992

## 7. Salvar e abrir notas de rodapé

Incluir o elemento `NotaRodape` (usado apenas na justificação) no jsonix salvo/aberto, com o texto da nota inline. A numeração das notas é recalculada na abertura do arquivo, não precisando ser persistida. Validar o arquivo convertendo de/para XML com o conversor jsonix e validar o XML gerado contra o esquema LexML.

**Especificação:** [07-notas-de-rodape.md](07-notas-de-rodape.md)

**Issue:** https://github.com/lexml/lexml-eta/issues/993

## 8. Salvar e abrir revisões textuais na justificação

Incluir `ins`/`del` (com id prefixado `_rt`) e `lexedit:RevisoesTextuais`/`lexedit:RevisaoTextual` no jsonix salvo/aberto. Esta issue também salva e recupera os usuários referenciados por `refIdUsuario` em `lexedit:Usuarios`. Registrar em `lexedit:Pendencias` a pendência "Resolver marcas de revisão de texto." enquanto houver marcas `ins`/`del` não aceitas ou rejeitadas. Validar o arquivo convertendo de/para XML com o conversor jsonix e validar o XML gerado contra o esquema LexML.

**Especificação:** [09-revisao-de-texto.md](09-revisao-de-texto.md), [12-registro-usuarios.md](12-registro-usuarios.md), [13-outros-metadados-do-lexedit.md](13-outros-metadados-do-lexedit.md)

**Issue:** https://github.com/lexml/lexml-eta/issues/994

## 9. Salvar e abrir remissões internas inválidas

Incluir o registro de remissões internas inválidas (`Remissao` com id prefixado `_ri` e `lexedit:RemissoesInternasInvalidas`) no jsonix salvo/aberto, preservando o último destino conhecido mesmo quando a remissão se tornou inválida. Registrar em `lexedit:Pendencias` a pendência "Corrigir remissões internas inválidas." enquanto houver remissões internas inválidas. Validar o arquivo convertendo de/para XML com o conversor jsonix e validar o XML gerado contra o esquema LexML.

**Especificação:** [10-remissoes-internas.md](10-remissoes-internas.md), [13-outros-metadados-do-lexedit.md](13-outros-metadados-do-lexedit.md)

**Issue:** https://github.com/lexml/lexml-eta/issues/995

## 10. Salvar e abrir revisões da hierarquia

Incluir `lexedit:RevisoesArticulacao`/`lexedit:RevisaoArticulacao` no jsonix salvo/aberto, cobrindo as operações de inclusão, exclusão, alteração de texto, movimentação, transformação de tipo e alteração de rótulo (inclusive combinações). Esta issue também salva e recupera os usuários referenciados por `refIdUsuario`. Registrar em `lexedit:Pendencias` a pendência "Resolver marcas de revisão na articulação." enquanto houver revisões da hierarquia não aceitas ou rejeitadas. Validar o arquivo convertendo de/para XML com o conversor jsonix e validar o XML gerado contra o esquema LexML.

**Especificação:** [11-revisao-da-hierarquia.md](11-revisao-da-hierarquia.md), [12-registro-usuarios.md](12-registro-usuarios.md), [13-outros-metadados-do-lexedit.md](13-outros-metadados-do-lexedit.md)

**Issue:** https://github.com/lexml/lexml-eta/issues/996

## 11. Salvar e abrir os demais metadados do LexEdit

Incluir no jsonix salvo/aberto os atributos de `lexedit:Metadado` ainda não cobertos pelas issues anteriores: `dataUltimaModificacao` e `substitutivo`. Os atributos `aplicacao` e `versaoAplicacao` ficam vazios por enquanto. Validar o arquivo convertendo de/para XML com o conversor jsonix.

**Especificação:** [13-outros-metadados-do-lexedit.md](13-outros-metadados-do-lexedit.md)

**Issue:** https://github.com/lexml/lexml-eta/issues/997


