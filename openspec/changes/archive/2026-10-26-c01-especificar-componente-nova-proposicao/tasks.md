# Tasks

## 1. Documento de requisitos

- [x] 1.1 Incorporar ao `docs/requisitos/componente-nova-proposicao.md` o layout da Tela 1 (grupos g1 a g6) e as decisões do #1024 (destino sempre coletado, URLs com placeholders, siglas do vocabulário sem `tiposReferenciaveis`, sigla inativa selecionável com alerta, 5 MB, MPV fora das siglas, contrato do componente), reescrevendo RN-00a, RN-01 a RN-06 e a seção 7; verificar relendo que cada decisão aparece nas regras e que não há item resolvido ainda listado como aberto
- [x] 1.2 Marcar em §8 do documento de requisitos que "alterar dados básicos do documento" tem especificação própria e sai do escopo; verificar que nenhuma regra desta spec depende dele

## 2. Contrato com o host

- [x] 2.1 Documentar no documento de requisitos a configuração (casa e URLs de verificação, texto e comissões, com placeholders), o JSON de verificação e o evento de resultado/cancelamento; verificar que a seção 9 descreve as três URLs obrigatórias
- [x] 2.2 Documentar o serviço do texto estruturado (RN-09a: URL com os mesmos placeholders, `200` com JSON, `404` indisponível) e o `detail` do evento (`urn`, `urnDocumentoReferenciado`, `epigrafe`, `preambulo`, `colegiadoDestino`, `texto`, `anexoParecer`), com o `texto` em LexML JSONIX (o mesmo usado ao abrir); verificar que o documento de requisitos e a spec descrevem o mesmo contrato
- [x] 2.3 Registrar no documento de requisitos a dependência do serviço de epígrafe do vocabulário (#1053), com a epígrafe do caso padrão gerada pelo componente enquanto o serviço não existir e a caixa "anexo de parecer" na Tela 1; verificar que a seção 7 aponta essa dependência
- [x] 2.4 Registrar no documento de requisitos a decisão de retirar o componente de destino do `lexml-eta` e o impacto no `ColegiadoApreciador` salvo e aberto, como pendência para a change de implementação; verificar que está na seção 7

## 3. Validação da change

- [x] 3.1 Rodar `openspec validate 2026-10-26-c01-especificar-componente-nova-proposicao --strict` e verificar saída sem erros
- [x] 3.2 Revisar a spec com o usuário, ajustando requisitos e cenários, e registrar as alterações nos artefatos
- [x] 3.3 Testes: esta change não altera código, então não há E2E (Cypress, `docs/guia-cypress.md`) nem unitário aqui; a cobertura fica como critério de aceite — cada cenário da spec é um caso de teste candidato, e a change de implementação deve prever a task de E2E do fluxo das três telas
