# Proposal

## Why

Os dados básicos de uma proposição em elaboração (tipo/URN, documento referenciado, colegiado apreciador, forma de apresentação, epígrafe, preâmbulo e outros metadados) são definidos só na criação, pelo host, e não podem ser alterados depois (issue #1051). Um erro de escolha de tipo ou de destino obriga a recomeçar o documento. Além disso, o componente de nova proposição (#1050) não tem uma forma documentada de voltar ao estado original, e o demo depende de recriar o elemento a cada abertura do modal.

## What Changes

- Novo grupo "Dados básicos" no início da aba "Data, Autoria e Impressão" do `lexml-eta`: descrição do documento derivada da URN (com flexão de gênero), ano do documento (exceto no substitutivo do Senado), colegiado apreciador, "Apresentado em parecer" e o botão "Alterar dados básicos".
- O botão emite um evento com os dados básicos atuais; o host abre o componente de edição e devolve os dados novos ao `lexml-eta`.
- Em modo de revisão, o botão fica desabilitado, com mensagem informativa abaixo dele.
- Novo método público `alterarDadosBasicos(dados)` no `lexml-eta`: recusa a chamada em modo de revisão e, fora dele, aplica os dados novos recarregando o documento atual, com as regras:
  - autoria descartada quando a casa responsável muda;
  - justificação descartada quando o documento passa a ser anexo de parecer;
  - local do fecho sempre recalculado a partir do colegiado;
  - data da última modificação do documento mantida;
  - histórico de desfazer/refazer perdido.
- Modo de edição de dados básicos no `lexml-nova-proposicao`: inicializado com os dados atuais, usa só a Tela 1 (Continuar/Cancelar), considera verificado o documento referenciado já informado, pede confirmação ao trocar para tipo de outra casa ou ao passar a anexo de parecer, e emite um evento próprio com os mesmos dados da nova proposição, exceto o texto.
- `reiniciar()` do `lexml-nova-proposicao` passa a fazer parte do contrato: volta o componente ao estado original (modo de criação, sem dados iniciais, Tela 1 com os padrões).
- Demo: suporta a alteração de dados básicos e reinicia o componente de nova proposição a cada abertura do modal.

## Capabilities

### New Capabilities
- `dados-basicos-proposicao`: exibição dos dados básicos do documento na aba "Data, Autoria e Impressão", solicitação de alteração ao host e regras de aplicação dos dados alterados no documento em edição.

### Modified Capabilities
- `interface-lexml-eta`: o método `alterarDadosBasicos` entra entre os métodos públicos que alteram o documento em edição, com a rejeição em modo de revisão.
- `nova-proposicao`: modo de edição de dados básicos e reinício do componente ao estado original.

## Impact

- `src/components/lexml-eta.component.ts` (grupo na aba, evento, `alterarDadosBasicos`).
- `src/components/nova-proposicao/` (modo de edição, leitura da URN de volta para os dados da Tela 1, modal de confirmação, `reiniciar`).
- Novo utilitário de descrição do documento a partir da URN (aba "Dados básicos").
- `demo/components/demoview.ts`.
- Testes de componente e E2E Cypress do componente de nova proposição e do `lexml-eta`.
- Coordenação com o `lexeditweb-editor`: tratar o evento de solicitação, abrir o componente em modo de edição e chamar `alterarDadosBasicos`; confirmar perda de dados continua sendo do host, exceto as confirmações de autoria e justificação, feitas pelo componente de edição.
