# Tasks

## 1. Caso de uso

- [ ] 1.1 Incorporar ao `docs/requisitos/caso-de-uso-nova-proposicao.md` as decisões do #1024 (colegiado de destino na Tela 1, URL de verificação com placeholders, tipos do vocabulário, 5 MB, MPV fora das siglas, contrato do componente) e reduzir a seção 8; verificar relendo que cada decisão aparece nas regras e que não há item resolvido ainda listado como aberto
- [ ] 1.2 Marcar em §9 do caso de uso que "trocar tipo do documento" tem especificação própria e sai do escopo; verificar que nenhuma regra desta spec depende dele

## 2. Contrato com o host

- [ ] 2.1 Documentar no caso de uso a configuração (casa e URL com placeholders), o JSON de verificação e o evento de resultado/cancelamento, validando com o responsável pelo `lexeditweb-editor` que o host consegue prover a URL
- [ ] 2.2 Documentar o serviço do texto estruturado (RN-09a: URL com os mesmos placeholders, `200` com JSON, `404` indisponível) e o `detail` do evento (`urn`, `urnDocumentoDeReferencia`, `epigrafe`, `preambulo`, `colegiadoDestino`, `texto`, `anexoParecer`), com o `texto` em LexML JSONIX (o mesmo usado ao abrir); verificar que o caso de uso e a spec descrevem o mesmo contrato
- [ ] 2.3 Registrar no caso de uso a dependência do serviço de epígrafe do vocabulário (outra issue) (com serviço simulado no vocabulário na implementação, se necessário) e a caixa "anexo de parecer" na Tela 1; verificar que a seção 8 aponta essa dependência

## 3. Validação da change

- [ ] 3.1 Rodar `openspec validate 2026-10-26-c01-especificar-componente-nova-proposicao --strict` e verificar saída sem erros
- [ ] 3.2 Revisar a spec com o usuário, ajustando requisitos e cenários, e registrar as alterações nos artefatos
- [ ] 3.3 Testes: esta change não altera código, então não há E2E (Cypress, `docs/guia-cypress.md`) nem unitário aqui; a cobertura fica como critério de aceite — cada cenário da spec é um caso de teste candidato, e a change de implementação deve prever a task de E2E do fluxo das três telas
