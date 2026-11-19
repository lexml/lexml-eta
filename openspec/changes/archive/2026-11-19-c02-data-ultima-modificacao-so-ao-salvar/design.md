# Design

## Context

Ver `proposal.md` para a motivação e `specs/metadados-lexedit/spec.md` para o contrato atualizado. Hoje o editor gera o instante em `getDocumentoArticulado()`, mas o leitor também o copia para `DadosLexEdit`, e `LexmlEtaComponent` o conserva em estado privado e expõe `dataUltimaModificacaoDocumento`. `alterarDadosBasicos` repassa esse valor para preservar o timestamp carregado. O parser de data usado nesse trecho também valida o campo de fecho `data`, que continua sendo lido.

## Goals / Non-Goals

**Goals:**

- Fazer do timestamp um dado de saída: cada documento exportado pelo editor leva um instante novo.
- Remover a leitura do atributo no fluxo de abertura e todo estado de edição e API pública dedicado a ele.
- Preservar a geração determinística no componente e os outros metadados do documento.

**Non-Goals:**

- Alterar `Proposicao.dataUltimaModificacao`, que registra o instante de obtenção da proposição.
- Remover `dataUltimaModificacao` do tipo serializado `MetadadoLexEdit` ou do formato XML.
- Alterar o esquema LexEdit, que já declara o atributo opcional.

## Decisions

1. **Gerar o instante na exportação do componente.** Manter a criação do valor atual em `getDocumentoArticulado()` e a escrita pelo montador Jsonix. O conversor continua recebendo o timestamp como entrada explícita, mantendo-se determinístico quando chamado sem dados do editor. Cada chamada de exportação produz seu próprio horário.
   - Alternativa considerada: gerar a data dentro do conversor. Rejeitada porque tornaria conversões chamadas diretamente não determinísticas.

2. **Ignorar o atributo ao ler metadados LexEdit.** `lerMetadadoLexEdit` deixa de validar e devolver `lexedit:Metadado@dataUltimaModificacao`; `DadosLexEdit` deixa de representar um valor de arquivo aberto. A tipagem do atributo de escrita permanece no modelo serializado. O parser ainda necessário para `c.data` do fecho deve continuar funcionando.
   - Alternativa considerada: continuar lendo no conversor, mas não copiar para o componente. Rejeitada porque a leitura só serve ao estado/API que está sendo removido e não participa de outra edição.

3. **Eliminar o cache do componente e o repasse interno.** Remover o getter público, o campo privado, a atribuição ao abrir, a limpeza ao fechar e o valor passado por `alterarDadosBasicos`. A atualização dos dados básicos não deve depender do timestamp do arquivo anterior.

4. **Atualizar a documentação e os testes como mudança de API.** Remover a propriedade da tabela da API e explicar que o timestamp pertence ao documento exportado. Adaptar os testes de conversão e do componente; atualizar o Cypress existente `abertura-data-ultima-modificacao.cy.ts` para verificar que abrir não expõe o valor e que a exportação subsequente gera um novo.

## Risks / Trade-offs

- **[Risco] Hosts externos podem consultar `dataUltimaModificacaoDocumento`.** → A remoção é documentada como breaking change; hosts devem deixar de depender dela e usar o valor do documento que obtêm para salvar, caso precisem registrar o instante de saída.
- **[Risco] A remoção ampla do parser de data pode afetar `data` do fecho.** → Desconectar apenas a leitura de `lexedit.dataUltimaModificacao` e preservar a validação usada por `c.data`.
- **[Trade-off] Abrir e reexportar um arquivo perde o timestamp anterior.** → Esse é o comportamento intencional: a nova exportação escreve o horário atual, sem necessidade de preservar o valor lido.

## Migration Plan

Atualizar primeiro conversor e estado/API do componente, depois os testes unitários, de integração e E2E, e por fim os documentos da API e da extensão LexEdit. Não há migração de arquivos: o atributo opcional continua válido, é ignorado ao abrir e volta a ser gravado na próxima exportação.
