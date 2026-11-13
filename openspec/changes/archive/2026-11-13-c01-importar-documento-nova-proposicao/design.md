# Design

## Context

Motivação e escopo: ver `proposal.md`.

Estado atual:

- `nova-proposicao`: `ConfigNovaProposicao` (`urlsNovaProposicao.ts`) tem três origens obrigatórias (URL ou callback), validadas por `validarConfigNovaProposicao`. A importação depende só de `onImportarArquivo`; sem ele, `converterArquivoImportado` devolve um erro de parser simulado. O documento obtido vai para `detail.texto`, o mesmo campo usado pelo texto do documento referenciado e pelo de outra proposição.
- `lexml-eta`: `novaProposicao` recebe `documentoModelo` e, por `montaDocumentoNovaProposicao`, aproveita só a articulação e a ementa (requisito "Documento de modelo"). `abrirDocumentoArticulado` lê tudo: `lerDocumentoArticulado` valida o documento e a casa da URN, e `abrirDocumentoLido` aplica revisões, impressão, autoria, fecho, colegiado, justificação, notas e anexos.
- Demo: `tratarRequisicaoDemo(url)` (`demo/server/handlers.mjs`) é um handler puro, só de GET, chamado pelo middleware do `web-dev-server.config.mjs`.
- Host real: o `lexeditweb-editor` já tem um "Importar" próprio (`resources/shared/openPdf`) que abre o PDF como documento (`abrirDocumentoArticulado`). É outro fluxo, que continua igual. A `nova-proposicao` dele não configura importação.

## Goals / Non-Goals

**Goals:**
- Um mesmo caminho de leitura para o "Abrir" e para a importação, para que um grupo novo do formato LexEdit passe a valer nos dois sem trabalho duplicado.
- O fake da demo cobrir os três desfechos da issue (sucesso, `400`, `500`) com o mesmo mecanismo de URL que o host real usará.

**Non-Goals:**
- Mudar o "Documento de modelo" usado pelo documento referenciado e pela outra proposição.
- Validar, na `nova-proposicao`, a estrutura do JSONIX além de ser um JSON. A validação estrutural continua no `lexml-eta`.

## Decisions

### 1. Campo próprio para o documento importado, nos dois componentes

O resultado da `nova-proposicao` leva o documento importado em `documentoImportado`, e `DadosNovaProposicao` do `lexml-eta` ganha o campo de mesmo nome, ao lado de `documentoModelo`. Os dois campos são exclusivos: informar ambos rejeita a chamada.

- Por que não mudar a regra do modelo: o documento referenciado de um substitutivo herdaria a justificação e a autoria do original.
- Alternativa descartada: manter `texto` e acrescentar `origemTexto`. O host teria de rotear pelo indicador, e um host que o ignorasse trataria o importado como modelo em silêncio. Com um campo distinto, o roteamento errado é visível: o importado simplesmente não chega.

### 2. Importação no `lexml-eta`: o documento do arquivo com a identidade trocada, aberto pelo caminho do "Abrir"

`novaProposicao` com `documentoImportado`:

1. valida a estrutura como `lerDocumentoArticulado`, **sem** `verificarUrnDaCasaDoEditor` sobre a URN do arquivo (a URN que vale é a dos parâmetros, que já passa por `verificarUrnDaCasaDoEditor` e `verificarUrnParaNovaProposicao`). A validação ganha uma opção para pular a checagem de casa; o "Abrir" continua checando;
2. monta a cópia com `aplicarDadosBasicos` (`dadosBasicos.ts`), a mesma troca de identidade do "Alterar dados básicos": URN, URN referenciada, epígrafe, preâmbulo, colegiado e anexo de parecer dos parâmetros, sem a data da última modificação. Herda dela duas regras: a autoria do arquivo some quando a casa da URN muda, e o local do fecho volta a ser derivado do colegiado. Os outros metadados passados são os do arquivo, ou os dos parâmetros quando o arquivo não os tem. Por fim, os anexos são retirados da cópia;
3. segue pelo mesmo corpo de `abrirDocumentoLido`, agora com os padrões da sessão ligados (autoria e impressão da configuração), que aplica revisões, impressão, autoria, fecho, justificação, notas e outros metadados;
4. depois, aplica autoria e opções de impressão dos parâmetros **só** para os grupos que o arquivo não trouxe. Como o editor sempre grava as opções de impressão, isso só acontece com arquivo gerado fora dele;
5. se o documento original tinha anexos, adiciona o alerta de anexos (decisão 6).

Tipo da Tela 1 diferente do tipo do arquivo não é problema: a articulação e os ids não dependem do tipo, como já acontece com o modelo. Em anexo de parecer, a justificação do arquivo não é carregada, como no "Abrir".

- Alternativa descartada: estender `montaDocumentoNovaProposicao` para copiar mais grupos. Repetiria, grupo a grupo, o que `abrirDocumentoLido` já faz, e cada grupo futuro teria de entrar em dois lugares.

### 3. `.json` lido na própria `nova-proposicao`

O componente lê o arquivo com `File.text()` e faz `JSON.parse`. JSON inválido gera um alerta de aviso na Tela 2 ("O arquivo JSON não pôde ser lido: o conteúdo não é um JSON válido."), sem chamar a URL nem o callback. Um JSON válido que não seja documento articulado só é recusado depois, pelo `lexml-eta`, que emite o erro fatal como em qualquer entrada inválida (risco abaixo).

### 4. Envio à URL de conversão

`fetch(urlImportacaoArquivo, { method: 'POST', body: arquivo, headers: { 'Content-Type': tipo } })`. O corpo é o conteúdo do arquivo, não multipart, como pede a issue. O tipo vem da extensão, porque `File.type` varia por navegador e SO e às vezes vem vazio:

| Extensão | Content-Type |
|---|---|
| `.pdf` | `application/pdf` |
| `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| `.txt` | `text/plain` |
| `.xml` | `application/xml` |

A URL não tem placeholders. Tratamento da resposta:

| Resposta | Efeito |
|---|---|
| `200` | o corpo (JSON) é o documento importado; JSON inválido no corpo conta como `500` |
| `400` | alerta de aviso na Tela 2: título "O arquivo não pôde ser importado", o corpo em texto puro (aparado; se vazio, "O serviço de conversão recusou o arquivo.") e a orientação "Selecione outro arquivo ou escolha outra forma de iniciar o texto." |
| `500`, outro status ou falha de rede | alerta de erro na Tela 2: "Não foi possível converter o arquivo \"<nome>\": o serviço de conversão apresentou uma falha. Tente novamente em alguns instantes." O corpo não é exibido. |

Nos dois alertas, o usuário continua na Tela 2 e pode trocar o arquivo ou acionar **Continuar** de novo. O alerta some quando outro arquivo é selecionado ou a opção é trocada.

### 5. Callback mantém o contrato `{ texto?, erros }`

`onImportarArquivo` continua com o mesmo tipo, para não quebrar quem já o implementa: `erros` não vazio leva à Tela 3, `{ erros: [] }` sem texto também leva à Tela 3, e rejeição tem o efeito do `500`. A Tela 3 fica como destino de lista de erros de conteúdo, que hoje só o callback produz. Quando a URL ganhar erro em JSON (fora do escopo), essa lista também poderá ir para a Tela 3.

- Alternativa descartada: alinhar o callback ao `400` (alerta na Tela 2). Mudaria um contrato publicado sem necessidade, e a Tela 3 ficaria sem produtor.

O `.json` não passa pelo callback (decisão 3): o host não precisa tratar um formato que o próprio editor já lê.

### 6. Alerta dos anexos

A mensagem aparece de duas formas, só quando o documento importado tinha ao menos um anexo:

- **Notificação passageira:** é o mesmo `alertarInfo` (`alertaUtil.ts`) da imagem acima do tamanho máximo, que ganhou as opções `variante`, `duracao` e `icone`. O padrão (vermelho, 4 s) continua valendo para quem já o usava. Aqui ele é chamado com aviso, 8 s (a mensagem é longa) e o ícone de triângulo. A regra global que pinta o fundo das notificações de vermelho claro (`editor.component.ts` e `switch-revisao.component.ts`) não foi alterada: uma regra mais específica para `variant='warning'` dá o fundo amarelo, e até aqui nenhuma notificação usava essa variante.
- **Item na aba Avisos:** adicionado com `adicionarAlerta` depois da abertura, depois das limpezas de alerta de `inicializarEdicao`, pelo mesmo motivo do item 11 do CLAUDE.md. É do tipo aviso, com botão de fechar, e não vira pendência ao salvar: é uma informação sobre a importação, não sobre o documento. Nos alertas com botão de fechar, o `AlertasComponent` faz o botão flutuar (`float`), o que aumenta a altura da caixa e desalinha o texto. Só neste alerta (classe `alerta--botao-centralizado`, escolhida pelo id `ALERTA_ANEXOS_NAO_RECUPERADOS`, em `model/alerta/alerta.ts` para evitar import circular), o botão passa a ser posicionado de forma absoluta. Os demais alertas não mudam: corrigi-los fica para outra tarefa.

### 7. Fake na demo

`tratarRequisicaoDemo` passa a receber `(url, metodo, contentType)`; o GET continua igual. `POST /demo-api/importacao` decide pelo `Content-Type`, sem ler o corpo:

| Content-Type | Resposta |
|---|---|
| `application/xml` (ou `text/xml`) | `200` com um JSON da `demo/doc` (o primeiro de `proposicoes.json` com arquivo), sem relação com o XML enviado |
| `application/pdf` | `500`, texto puro "Falha interna." |
| tipo de DOCX ou `text/plain` | `400`, texto puro "Conversão de DOCX ou TXT não implementada." |
| outro | `400`, texto puro "Tipo de arquivo não suportado." |

O middleware repassa o método e o cabeçalho e devolve o corpo como está. A demo informa `urlImportacaoArquivo: '/demo-api/importacao'` e repassa `documentoImportado` ao `lexml-eta`. A derivação de URN da `CD` (`derivarParaCamara`) continua só para `texto`: o importado não precisa dela, porque a URN do arquivo não é checada (decisão 2).

## Risks / Trade-offs

- [`.json` válido que não é documento articulado só é recusado no `lexml-eta`, depois de a `nova-proposicao` ter concluído] → o erro fatal tem mensagem descritiva e o host já o trata, como no "Abrir". Validar a estrutura na `nova-proposicao` duplicaria o validador.
- [Revisões do arquivo referem usuários de outra sessão] → é o comportamento desejado: um PDF gerado pelo LexEdit carrega suas revisões, e o usuário pode aceitá-las ou rejeitá-las.
- [Host que não informa nem URL nem callback de importação tem a configuração recusada] → **BREAKING** registrado na proposta. Aviso ao `lexeditweb-editor` antes de ele consumir a versão.
- [Host que roteava `detail.texto` da importação para `documentoModelo`] → passa a receber `documentoImportado`. Nenhum host conhecido configura importação hoje.

## Migration Plan

Coordenação com o `lexeditweb-editor`, sem migração de dados: informar `urlImportacaoArquivo` (ou `onImportarArquivo`) na `ConfigNovaProposicao` e repassar `documentoImportado` a `novaProposicao`.
