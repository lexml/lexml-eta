# Design

## Context

O componente `NovaProposicaoComponent` (`src/components/nova-proposicao/`) obtém dados em quatro pontos, hoje todos internos: `buscarComissoes`, `consultar` (verificação, usada na proposição referenciada, na MPV e em "outra proposição"), `buscarTexto` e `converterArquivoImportado` (simulador sem rede). Os três primeiros usam `fetch` e traduzem o status HTTP em estados internos (`'indisponivel'`, `'inexistente'`, `'erro'`); a configuração é o `ConfigNovaProposicao` (`urlsNovaProposicao.ts`), validado no setter de `config`. O `LexmlEtaConfig` já usa callbacks `onXxx` opcionais (`onUploadAnexo`, `onObterAnexoBlob`). Motivação e escopo em `proposal.md`; requisitos na spec delta.

## Goals / Non-Goals

**Goals:**
- Cada origem é resolvida por um único ponto: callback quando existe, senão o caminho atual, sem espalhar `if` pelo componente.
- Os estados e as mensagens que o usuário vê com callback são os mesmos do `fetch`.

**Non-Goals:**
- Seletor de proposição (`onEscolherProposicao` da proposta original): o fluxo continua sendo sigla, número e ano com **Verificar**.
- Campo de avisos de conversão na importação: não há onde exibi-lo num sucesso (a Tela 3 só trata falha).
- Mudar telas, regras de habilitação, evento de resultado ou os contratos HTTP atuais.

## Decisions

**1. Callbacks devolvem resultado de domínio, não `Response`.** `onVerificarProposicao` devolve `{ ementa, textoEstruturadoDisponivel?, complementar? } | undefined` e `onObterTexto` devolve o JSONIX ou `undefined`; `undefined` equivale ao `404`. O host (axios autenticado) mapeia o status por conta própria. Alternativa descartada: callback que devolve `Response`/status, que obrigaria o host a simular `fetch`, anulando o ganho.

**2. Rejeição ou exceção do callback = falha de comunicação.** Cada método já tem um `catch` que produz o estado de erro; o callback entra dentro do mesmo `try`, e nada novo é criado no fluxo de erro. Para `onObterComissoes`, falha vira `'indisponivel'`; para verificação e texto, `'erro'`.

**3. Uma função de origem por ponto, com o callback testado primeiro.** Em cada um dos três métodos de rede, o corpo passa a ser "se `config.onXxx` existe, `await` dele; senão, o `fetch` atual". O tratamento do resultado (filtro por casa nas comissões, `textoEstruturadoDisponivel !== false` por padrão, `complementar === true`) fica depois da origem, compartilhado pelos dois caminhos, para que callback e URL não divirjam.

**4. Argumentos já normalizados.** Os callbacks de verificação e texto recebem `{ sigla, numero, ano }` com os valores usados nos placeholders da URL (sigla em maiúsculas, número sem zeros à esquerda). A normalização hoje está embutida em `montaUrlProposicao`; é extraída para uma função usada pelos dois caminhos, para o host nunca receber valor bruto digitado.

**5. Validação por origem: callback ou URL.** `validarConfigNovaProposicao` troca "as três URLs são obrigatórias" por "cada uma das três origens exige o callback ou a URL". A mensagem continua nomeando a URL (`'urlComissoes' não informada`), com a indicação do callback alternativo, preservando os testes que conferem o nome da URL. Com ambos informados, o callback prevalece e a URL não é chamada.

**6. Importação: `onImportarArquivo` substitui o simulador.** O contrato é `{ texto?, erros }`. Sem callback, `converterArquivoImportado` continua devolvendo o erro simulado. Com callback:
- `erros` não vazio leva à Tela 3, como hoje;
- `erros` vazio e `texto` presente conclui;
- `erros` vazio e sem `texto` leva à Tela 3 com uma mensagem própria, porque concluir com texto vazio esconderia um defeito do conversor;
- rejeição mantém a Tela 2 e mostra erro de comunicação. `erroComunicacao` hoje tem uma mensagem única sobre o texto da proposição (`np-erro-texto`); a importação passa a usar uma mensagem própria ("Não foi possível converter o arquivo. Tente novamente.").

A rejeição não vai para a Tela 3 porque ela é de falha de **conversão** (o arquivo é o problema, o usuário pode corrigi-lo); falha de comunicação é transitória e pede nova tentativa.

**7. Tipos exportados.** `ConfigNovaProposicao` ganha os quatro campos e os tipos auxiliares (`ComissaoNovaProposicao`, `ConsultaProposicao`, `ResultadoVerificacaoProposicao`, `ResultadoImportacaoArquivo`) saem em `src/index.ts`, no mesmo estilo de `UploadAnexoCallback` do `LexmlEtaConfig`.

## Risks / Trade-offs

- [Callback do host demora ou nunca resolve] → o componente já mostra "Verificando…" e `processando`; não há timeout hoje para o `fetch` e não se acrescenta um para o callback (decisão do host).
- [Host devolve o JSONIX de `onObterTexto` em formato diferente do esperado] → o componente repassa o valor em `texto` sem validar, como já faz com a resposta da URL; o `lexml-eta` falha ao abrir, como falharia hoje.
- [`onObterComissoes` devolve itens de outras casas] → o filtro por `siglaCasaLegislativa` é mantido nos dois caminhos.
- [Estado global do vocabulário] → inalterado; a troca de `config` continua reiniciando o componente e limpando o cache de comissões.

## Migration Plan

Acréscimo compatível: nenhum host existente precisa mudar. Sem rollback específico; remover os callbacks da configuração volta ao comportamento por URL. A demo continua usando URLs, e os callbacks são exercitados em testes.
