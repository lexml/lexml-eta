# Design

## Context

Ver `proposal.md` (Why). Estado atual relevante:

- Os dados básicos ficam em campos privados do `LexmlEtaComponent` (`urn`, `urnDocumentoReferenciado`, `colegiadoApreciador`, `outrosMetadados`, `anexoParecer`, `localDoArquivo`) e no `projetoNorma` (epígrafe, preâmbulo). A casa responsável, a lista de parlamentares e `tipoNaoSuportado` são derivados da URN em `inicializarEdicao`.
- O componente `lexml-nova-proposicao` só conhece o sentido "Tela 1 → URN" (`montaUrnNovaProposicao`); não há leitura da URN de volta.
- O modo de revisão só pode ser desligado sem marcas pendentes (`ativaDesativaRevisao`, contando articulação e `ins`/`del` da justificação). Fora do modo de revisão, portanto, não há revisões a transportar.
- `reiniciar()` já existe e é público, mas não está no contrato; o demo hoje só reinicia porque recria o elemento a cada abertura do modal (renderização condicional) e porque o setter de `config` chama `reiniciar()`.

## Goals / Non-Goals

**Goals:**
- Aplicar a alteração reaproveitando o caminho de abertura, que já recalcula todo estado derivado da URN e é coberto por E2E.
- Concentrar a leitura "URN → dados da Tela 1" num módulo puro, testável sem componente, usado pelo modo de edição e pela descrição da aba.

**Non-Goals:**
- Preservar desfazer/refazer através da alteração.
- Permitir alterar dados básicos de documento de tipo não suportado.
- Editar a epígrafe à mão: ela continua vindo do vocabulário (`montaEpigrafePadrao`, até o serviço da #1053).

## Decisions

### D1. Aplicar por recarga interna (opção B)

`alterarDadosBasicos(dados)`:

```
valida (documento em edição, fora de revisão, tipo suportado, dados, URN)
  |
  v
documento = getDocumentoArticulado()          (serialização completa)
  |
  v
aplica no documento serializado:
  urn, urnDocumentoReferenciado, epígrafe, preâmbulo,
  colegiado, outrosMetadados, anexoParecer (metadados lexedit)
  - casa(urn nova) != casa(urn atual)  -> remove a autoria (lexedit e assinaturas da ParteFinal)
  - não era anexo e passa a ser        -> remove a justificação (com notas)
  - remove o local do fecho            -> volta a ser derivado do colegiado
  - mantém dataUltimaModificacao original (não a do getDocumentoArticulado)
  |
  v
caminho de abrirDocumentoArticulado
```

Alternativa (A): atualizar os campos no documento vivo e despachar uma ação Redux para epígrafe e preâmbulo. Rejeitada: cada estado derivado da URN (casa, parlamentares, `tipoNaoSuportado`, preâmbulo exibido, alertas) teria de ser recalculado à mão, com risco de esquecer algum; e o ganho (manter o desfazer) não foi considerado necessário.

A validação acontece toda antes da serialização, para que uma rejeição deixe o editor intacto, como nos demais métodos. O `fatalError` segue o padrão de `novaProposicao`.

O corpo de `abrirDocumentoArticulado` (depois de `lerDocumentoArticulado`) é extraído para um método privado reutilizado pelos dois; `alterarDadosBasicos` valida a URN nova com `verificarUrnDaCasaDoEditor` e `verificarUrnParaNovaProposicao` antes, como `novaProposicao`.

### D2. Ponto único de aplicação dos dados no documento serializado

Uma função pura (`aplicarDadosBasicos(documento, dados, contexto)`, em `src/model/lexml/documento/`) recebe o JSONIX, os dados novos e o contexto atual (URN atual, `anexoParecer` atual) e devolve o JSONIX novo. Puro e testável por unidade, sem componente; o componente só orquestra.

Alternativa: patch espalhado no componente. Rejeitada pela testabilidade.

### D3. Leitura da URN de volta

Módulo puro em `src/components/nova-proposicao/` (ex.: `lerDadosIdentificacao(urn, urnDocumentoReferenciado, casa)`) que devolve `DadosIdentificacao` mais o número original:

- espécie: sufixo `@apresentacao.substitutivo` → Substitutivo (SF); tipo com `tipoRelacaoSubstitutivo` `é substitutivo`/`é subemenda substitutiva` → Substitutivo/Subemenda (CD); demais → Proposição;
- PLV: sigla do tipo da própria URN (`SIGLA_PLV`); a MPV vem de `urnDocumentoReferenciado`;
- número diferente de `999999`: guardado como número original (spec "Número do documento preservado").

`montaUrnNovaProposicao` ganha um parâmetro opcional de número original, usado só enquanto espécie e sigla forem as iniciais. A descrição da aba usa a mesma leitura numa função própria (`descricaoDocumento`), já que o formato difere do cabeçalho das Telas 2 e 3.

### D4. Modo de edição no próprio `lexml-nova-proposicao`

Propriedade `modo: 'criacao' | 'edicao'` e `dadosIniciais`, aplicados depois de `config` (o vocabulário da casa precisa estar pronto). No modo de edição:

- as verificações iniciais nascem com `estado: 'ok'` e ementa vazia;
- as comissões da casa são carregadas ao abrir; comissão inicial fora da lista (ou lista indisponível) deixa o destino inválido até o usuário escolher outro;
- **Continuar** avalia as confirmações (D5) e emite `dados-basicos-alterados`.

`reiniciar()` passa a zerar também `modo` e `dadosIniciais`.

### D5. Confirmações no momento do Continuar

O modal é exibido ao clicar em **Continuar**, não a cada troca de sigla ou de caixa: o usuário pode mudar de ideia na Tela 1 sem ser interrompido, e há um único ponto de decisão. Quando os dois casos se aplicam, um único modal lista as duas mensagens. O modal é um `sl-dialog` do próprio componente (o componente usa light DOM).

### D6. Eventos

- `lexml-eta` → host: `alteracao-dados-basicos-solicitada` com os dados atuais.
- `lexml-nova-proposicao` (edição) → host: `dados-basicos-alterados`.

Evento próprio no modo de edição para o host não precisar lembrar em que modo abriu o componente.

### D7. Estado do botão na aba

O grupo lê `emRevisao` do `rootStore` (o `stateChanged` já recebe `RevisaoAtivada`/`RevisaoDesativada`) e `tipoNaoSuportado`. A mensagem abaixo do botão muda conforme o motivo.

## Risks / Trade-offs

- [Desfazer perdido após a alteração] → Aceito pelo usuário; documentado na spec.
- [Estado de sessão não gravado no arquivo, ex.: remissão excluída à mão (`excluidaManualmente`)] → Mesmo comportamento de salvar e reabrir; a remissão só volta se a linha for editada.
- [Cursor, rolagem e aba ativa voltam ao início] → Aceito; equivalente a reabrir.
- [Comissão inicial ausente da lista] → Destino inválido até nova escolha, em vez de aceitar uma comissão que a lista não confirma.
- [Epígrafe regenerada perde ajustes manuais] → Hoje a epígrafe não é editável no `lexml-eta`; regenerar é coerente com a criação.
- [Número preservado com epígrafe de número em branco] → `montaEpigrafePadrao` deixa o número em branco; aceitável até a #1053.

## Migration Plan

Sem migração de dados. Coordenação com o `lexeditweb-editor`: tratar `alteracao-dados-basicos-solicitada`, abrir o componente em modo de edição, tratar `dados-basicos-alterados` chamando `alterarDadosBasicos` e reiniciar o componente a cada abertura do modal.
