# Tasks

## 1. Leitura da URN e descrição do documento

- [ ] 1.1 Criar o módulo puro de leitura "URN + URN referenciada → dados da Tela 1 + número original" (design D3), cobrindo proposição, substitutivo SF e CD, subemenda (CD), PLV (pela sigla da URN) e número real; verificar com testes unitários em `test/componente/nova-proposicao/` para cada espécie, nas duas casas, e com ida e volta `montaUrnNovaProposicao(ler(urn)) === urn`.
- [ ] 1.2 Estender `montaUrnNovaProposicao` com o número original, usado só enquanto espécie e sigla não mudam; verificar com testes unitários dos cenários de "Número do documento preservado".
- [ ] 1.3 Criar a função de descrição do documento da aba (flexão Novo/Nova, ao/à; com e sem número; substitutivo SF/CD, subemenda, PLV); verificar com testes unitários dos cenários de "Descrição do documento".

## 2. Aplicação dos dados básicos no documento serializado

- [ ] 2.1 Criar a função pura que aplica os dados básicos ao JSONIX (design D2): URN, URN referenciada, epígrafe, preâmbulo, colegiado, outros metadados, anexo de parecer, remoção do local e preservação da data da última modificação; verificar com testes unitários sobre documentos gerados por `criarDocumentoArticulado`.
- [ ] 2.2 Incluir as exclusões: autoria (metadado e assinaturas da `ParteFinal`) quando a casa responsável muda, e justificação (com notas) quando o documento passa a ser anexo de parecer; verificar com testes unitários de cada regra e do caso em que nada é excluído.

## 3. `lexml-eta`: método, evento e grupo "Dados básicos"

- [ ] 3.1 Extrair de `abrirDocumentoArticulado` o método privado de abertura a partir do documento lido e implementar `alterarDadosBasicos` (validação completa antes de alterar, recusa em revisão, sem documento e em tipo não suportado, `fatalError`, data da última modificação original); verificar com testes de componente em `test/componente/lexml-eta/` para sucesso, cada recusa (documento intacto) e preservação de texto, autoria, anexos e justificação.
- [ ] 3.2 Adicionar o grupo "Dados básicos" no início da aba "Data, Autoria e Impressão", com descrição, ano (exceto substitutivo SF), colegiado, "Apresentado em parecer" e o botão que emite `alteracao-dados-basicos-solicitada`; verificar com testes de componente do conteúdo do grupo, do `detail` do evento e da atualização após a alteração.
- [ ] 3.3 Desabilitar o botão em modo de revisão e em tipo não suportado, com a mensagem correspondente abaixo; verificar com testes de componente ativando e desativando a revisão e abrindo documento de tipo não suportado.
- [ ] 3.4 Documentar o método e o evento em `docs/api-componente-lexml-eta.md` e a coordenação com o host em `docs/migracao-interface-lexml-eta.md`; verificar que os exemplos batem com a assinatura implementada.

## 4. `lexml-nova-proposicao`: modo de edição e reinício

- [ ] 4.1 Adicionar `modo` e `dadosIniciais` (design D4): Tela 1 preenchida pelos dados iniciais, só a Tela 1, título "Alterar dados básicos", documento referenciado inicial considerado verificado, número original exibido como texto fixo, comissões carregadas ao abrir; verificar com testes de componente em `test/componente/nova-proposicao/` dos cenários de preenchimento, verificação e número.
- [ ] 4.2 Implementar o modal de confirmação no **Continuar** (troca de casa, passagem a anexo de parecer, as duas juntas) e o evento `dados-basicos-alterados` sem `texto` e com `outrosMetadados`; verificar com testes de componente para Sim, Não e o caso sem confirmação.
- [ ] 4.3 Ampliar `reiniciar()` para voltar ao modo de criação sem dados iniciais; verificar com testes de componente de reinício a partir do modo de edição e da Tela 2.
- [ ] 4.4 Atualizar `docs/requisitos/componente-nova-proposicao.md` e `docs/api-componente-lexml-eta.md` com o modo de edição, o evento e `reiniciar()`; verificar que os nomes de propriedades e eventos batem com o código.

## 5. Demo

- [ ] 5.1 Reiniciar o componente de nova proposição a cada abertura do modal (`reiniciar()` antes de exibir); verificar no demo que, depois de avançar à Tela 2 e cancelar, reabrir mostra a Tela 1 nos padrões.
- [ ] 5.2 Tratar `alteracao-dados-basicos-solicitada` abrindo o modal em modo de edição com os dados recebidos, e `dados-basicos-alterados` chamando `alterarDadosBasicos`; verificar no demo a troca de colegiado, de tipo e de anexo de parecer.

## 6. E2E (Cypress)

- [ ] 6.1 Ampliar `cypress/e2e/nova-proposicao/nova-proposicao.cy.ts` com o reinício ao reabrir o modal e o modo de edição (preenchimento, Continuar sem verificar, modal de confirmação Sim/Não); verificar rodando só esse spec.
- [ ] 6.2 Criar `cypress/e2e/nova-proposicao/alterar-dados-basicos.cy.ts` (com `export {};` no topo) cobrindo pelo demo: grupo "Dados básicos" exibido, alteração de colegiado com texto preservado, troca de casa com perda de autoria, passagem a anexo de parecer com perda da justificação e botão desabilitado em modo de revisão; verificar rodando só esse spec.
- [ ] 6.3 Rodar apenas os specs E2E que envolvem o componente de nova proposição (`npx cypress run --env envName=local --spec "cypress/e2e/nova-proposicao/**"`), sem rodar a suíte E2E completa; verificar que todos passam.

## Workflow follow-up

- Avisar o mantenedor do `lexeditweb-editor` sobre o evento `alteracao-dados-basicos-solicitada`, o modo de edição, `dados-basicos-alterados`, `alterarDadosBasicos` e o reinício do componente a cada abertura do modal.
- Arquivar a change depois da validação do usuário.
