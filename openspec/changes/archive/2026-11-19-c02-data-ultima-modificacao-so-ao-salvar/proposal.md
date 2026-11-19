# Proposal

## Why

`dataUltimaModificacao` registra quando o arquivo foi salvo. Lê-la ao abrir e mantê-la no estado de edição cria estado e uma propriedade pública sem uso necessário para editar ou salvar, além de expor ao host um valor que será substituído no próximo salvamento.

## What Changes

- Manter a gravação de um novo instante local em `dataUltimaModificacao` a cada exportação do documento para salvamento.
- Ignorar esse atributo ao abrir o arquivo, sem guardá-lo nos dados do editor.
- **BREAKING** Remover a propriedade pública somente leitura `dataUltimaModificacaoDocumento` e a preservação do valor lido durante `alterarDadosBasicos`.
- Atualizar a especificação e a documentação da API para refletir que o atributo é somente de saída do arquivo.
- Manter `Proposicao.dataUltimaModificacao`, que representa o instante em que a proposição foi obtida e é um campo distinto.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `metadados-lexedit`: definir `dataUltimaModificacao` como atributo gravado a cada salvamento e ignorado ao abrir; remover o requisito da propriedade pública do componente.

## Impact

Afeta o conversor de metadados LexEdit, os dados usados na serialização, `LexmlEtaComponent` e o fluxo interno de `alterarDadosBasicos`. A remoção da propriedade é uma quebra de API para hosts que a consultem. Atualiza testes e documentação da extensão LexEdit e da API do componente. Não altera o campo homônimo de `Proposicao`.
