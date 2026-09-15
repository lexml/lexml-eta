# Salvar e abrir documento articulado — especificações 00 e 01

A implementação desta etapa está restrita ao lexml-eta. O arquivo de intercâmbio é `documento-articulado.json`, com a raiz Jsonix `LexML` e a estrutura `value.projetoNorma.norma`, conforme o XSD LexML.

## Conteúdo persistido

- `Metadado/Identificacao/@URN`, preservando uma URN recebida por inteiro, inclusive autoridade e evento.
- `ParteInicial/Epigrafe`, `Ementa` e `Preambulo`, incluindo os parágrafos do preâmbulo e a formatação inline já suportada.
- `Articulacao`, usando os conversores e o modelo de dispositivos do ETA.

Quando uma nova proposição não tem número ou ano, cada campo ausente recebe sua sentinela: ano `9999`, número `999999`. A ordem é `:ano;número`, por exemplo `urn:lex:br:senado.federal:projeto.lei:9999;999999`. O exemplo da especificação 01 foi corrigido conforme decisão do solicitante.

Esta etapa não grava o invólucro `Proposicao`, autoria, anexos, justificação, opções de impressão nem os metadados das especificações posteriores. O formato antigo salvo pela demonstração não é aceito pelo novo leitor. `getProposicao()` continua disponível para as integrações existentes.

## Uso no componente

Os botões **Salvar** e **Abrir** da demonstração usam as mesmas funções exportadas para as aplicações consumidoras:

```ts
import { abrirArquivoDocumentoArticulado, salvarArquivoDocumentoArticulado } from '@lexml/lexml-eta';

// eta é uma instância inicializada de LexmlEtaComponent.
await salvarArquivoDocumentoArticulado(eta.getDocumentoArticulado());

const documento = await abrirArquivoDocumentoArticulado();
if (documento) await eta.abrirDocumentoArticulado(documento);
```

Chame os seletores de arquivo a partir de uma ação do usuário, como o clique em um botão. Em navegadores com File System Access API, são usados os diálogos nativos. Nos demais, o salvamento usa download e a abertura usa um seletor HTML de arquivos.

`getDocumentoArticulado()` sincroniza a edição pendente e retorna um objeto independente com o estado atual. `abrirDocumentoArticulado()` aceita esse objeto ou seu texto JSON e verifica a entrada antes de substituir o documento aberto.

Também são exportados `lerDocumentoArticulado`, `serializarDocumentoArticulado`, `lerArquivoDocumentoArticulado` e `NOME_ARQUIVO_DOCUMENTO_ARTICULADO`. A serialização produz JSON UTF-8 legível. Cancelar o salvamento retorna `false`; cancelar a abertura retorna `undefined`. Falhas de leitura, estrutura e escrita rejeitam a operação; a demonstração apresenta a mensagem ao usuário.

O leitor específico de arquivos preserva aspas retas e trata strings Jsonix como texto literal, distinguindo caracteres como `<` e `&` dos objetos que representam formatação. O caminho legado de inicialização mantém sua normalização tipográfica padrão.

## Validação e testes reproduzíveis

No navegador, a abertura faz uma verificação estrutural do contrato, URN, listas de dispositivos e IDs repetidos, seguida da interpretação pelo conversor do ETA. Essa verificação não é uma implementação integral do XSD.

A validação completa pelo XSD está na suíte de integração local deste repositório. Ela usa o executável oficial Jsonix para converter JSON → XML, valida o XML com Java e converte XML → JSON, reabrindo e comparando o resultado. O teste negativo remove a identificação obrigatória para comprovar a rejeição pelo esquema.

Pré-requisitos: dependências instaladas, Chromium do Playwright (`npx playwright install chromium`), conversor [jsonix-lexml 1.0.0](https://github.com/lexml/jsonix-lexml/releases/tag/1.0.0) e Java 11 ou superior no PATH.

```powershell
# Testes de persistência, seletores e componente
npm run test:documento-articulado

# Integração com conversor real e XSD; ajuste para o executável local.
$env:JSONIX_LEXML_CLI = 'C:\ferramentas\jsonix-lexml-win.exe'
npm run test:documento-articulado:xml
```

Os XSDs ficam em [test/schemas/lexml](../../test/schemas/lexml/README.md), fixados na revisão `3f570910f6034d09e1bfb657b7e15ef2c6717012` do conversor. O utilitário Java fica em `scripts/ValidarDocumentoLexml.java` e é exclusivamente uma ferramenta de teste. Nenhum serviço de backend é necessário para salvar ou abrir JSON.

Os testes cobrem identificação definitiva e provisória, campos parcialmente conhecidos, URN com evento, parte inicial, múltiplos parágrafos, espaços entre marcações inline, caracteres literais, alterações de normas, isolamento de documentos, edição pendente, cancelamento e erros. A comparação é estrutural/semântica: o Jsonix pode reorganizar propriedades e nós de texto sem alterar o conteúdo apresentado.

Verificações executadas nesta entrega: compilação TypeScript; 408 testes dos conversores, utilitários e componentes afetados; quatro testes com conversor real e XSD. A integração com lexeditweb, a geração de PDF e as alterações no eta-backend-services ficam para outra atividade.
