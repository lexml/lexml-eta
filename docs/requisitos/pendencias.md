# Pendências

## Fazer levantamento junto às equipes de negócio

- Confirmar tipos proposições para edição:
  - Congresso
    - PRN 
    - PLN
    - PLV
    - Substitutivos a PRN 
  - Senado
    - PL 
    - PLP 
    - PEC 
    - PRS 
    - PDL 
    - Substitutivos a PL, PLP, PRS e PDL
  - Câmara
    - PL 
    - PLP 
    - PEC 
    - ??? (outros tipos da CD)
    - Substitutivos a PL, PLP, ??? (outros tipos da CD que recebem substitutivo)
    - Subemenda Substitutiva (aos substitutivos acima)
- Senado: Temos subemenda substitutiva global?
- Modelos de preâmbulo:
  - PL, PLP, PLV, PDL, PLN: “O Congresso Nacional decreta:”
  - PRS: “O SENADO FEDERAL resolve:”
  - PRN: “O CONGRESSO NACIONAL resolve:"
  - PEC: “As Mesas da Câmara dos Deputados e do Senado Federal, nos termos do § 3º do art. 60 da Constituição Federal, promulgam a seguinte Emenda ao texto constitucional:”
  - ??? (outros tipos da CD)
- Modelos de epígrafe para cada um desses tipos.
  - ?????
- Sobre a apresentação da proposição como anexo de parecer
  - Confirmar que proposições apresentadas em pareceres não apresentam justificação, local, data e assinaturas.
  - Substitutivos e emendas substitutivas globais podem ser consideradas sempre como anexos de parecer (sem justificação, local e data)?
- O local, quando apresentado, seria sempre "Sala das Sessões,"? Se não, quais são as opções e regras para escolha do texto do local?
- Sobre as assinaturas
  - Atualmente temos apenas a opção de listar parlamentares (opcionalmente com partido, uf e cargo).
  - O usuário poderá optar por não apresentar nada na área das assinaturas?
  - Existe o caso de proposição de autoria de comissão em que deva ser apresentado o nome da comissão no lugar da assinatura?
- Destino das proposições
  - Substitutivos apresentados em comissão apresentam a sigla da comissão na epígrafe. Existe o caso do substitutivo ter como destino o Plenário e não apresentar sigla na epígrafe?
  - Algum outro tipo de proposição (fora os substitutivos) precisaria ter essa sigla de comissão na epígrafe?

# Proposta de tratamento de epígrafe

## Modelo padrão

<TIPO DO DOCUMENTO POR EXTENSO EM MAIÚSCULAS> Nº   , DE <ANO>

Exemplo:

PROJETO DE LEI COMPLEMENTAR Nº    , DE 2026

## Substitutivo

EMENDA Nº     - <SIGLA DA COMISSÃO> (<TIPO DA EMENDA>)
(<à/ao> <Tipo da proposição> nº <número>, de <ano>)

Exemplo:

EMENDA Nº     - CCJ (SUBSTITUTIVO) 
(ao Projeto de Lei nº 1.234, de 2026)

Obs: o "tipo da emenda" poderia ser também algo como "DE REDAÇÃO"

## PLV

PROJETO DE LEI DE CONVERSÃO Nº    , DE 2026
(Medida Provisória nº 1.234, de 2026)

## Texto livre complementar

Em qualquer um dos casos, o usuário poderia adicionar um texto livre complementar a ser apresentado abaixo da epígrafe.

Exemplo:

PROPOSTA DE EMENDA À CONSTITUIÇÃO Nº    , DE 2015
TEXTO DESTACADO PARA RETORNAR À CÂMARA DOS DEPUTADOS COMO PROPOSIÇÃO AUTÔNOMA

---

## Anotações

- Registrar modelos de preâmbulo no vocabulário e associar aos tipos de documento
- Fecho:
  - PL: Local "Sala das Sessões"
  - "Sala da comissão" em substitutivo de comissão (?)
  - MPV: Brasília, 25 de setembro de 2026; 205º da Independência e 138º da República
- Verificar necessidade do complemento da epígrafe
  - Exemplo:
    PROJETO DE LEI DE CONVERSÃO Nº 10, DE 2026
    (Medida Provisória nº 1.366, de 2026)

- Adicionar ao tipo do documento no vocabulário: tipoRelacaoSubsitutivo ('aceita substitutivo', 'não aceita substitutivo', 'é substitutivo' ou 'é subemenda substitutiva')
- Adicionar flag booleano 'ativo' (default true) ao tipo do documento no vocabulário. Tipos inativos (ex: PLS, PLC...) só são oferecidos para referenciar. Apenas uma entrada por sigla+autoridade deve estar ativa.
- [backlog] Permitir parametrizar complemento do vocabulário

## Implementação lexml-eta e eta-backend-services

- Implementar edição de pena
- Rever colar dispositivos após implementação do tratamento de título de dispositivo e pena.
- Marcas de revisão na hierarquia de dispositivos
- Rever marcas de revisão na hierarquia de dispositivos após implementação de título de dispositivo e pena.
- Importar documento articulado (DOCX ou TXT)

## Casos de uso do LexEdit/Infoleg Editor

- Nova proposição
  - Informar sempre o tipo e se é substitutivo
    - No caso de substitutivo, deve ser informada a identificação do projeto.
    - PLV deve indicar a MPV
  - Opções:
    - Vazia
    - A partir de documento DOCX ou TXT
    - A partir de proposição existente (especialmente útil para substitutivos)
- Salvar proposição
- Visualizar proposição
- Abrir proposição

urn:lex:br:senado.federal:projeto.lei;pl:9999;999999

urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:9999;999999
urnDocumentoDeReferencia: urn:lex:br:presidencia.republica:medida.provisoria;mpv:2026;4321

urn:lex:br:senado.federal:projeto.lei;pl:2026;12@apresentacao.substitutivo

urnDocumentoDeReferencia (urn do projeto que recebe o substitutivo, urn da MPV no caso de edição de PLV...)

urn:lex:br:camara.deputados:substitutivo;sbt:9999;999999
urnDocumentoDeReferencia: urn:lex:br:camara.deputados:projeto.lei;pl:2026;12

autoridade: senado.federal
tipo do documento: projeto.lei;pl
data (ou apenas ano)
número
versão

@aprovacao.substitutivo.decisao.terminativa
@aprovacao.subsitutivo
@apresentacao.substitutivo


# Componente de criação de novo documento

- Configurável com lista de autoridades (ex: 'camara.deputados', 'congresso.nacional')

1. Seleção do tipo do documento

---
Nova proposição
---

Tipo do documento: ________V <nome do tipo>

X Substitutivo <indicativo de substitutivo>

Proposição<ou Medida Provisória>: ___V<sigla> nº ____<número> de _____<ano> [Verificar]

Ementa: Nonon nono nonon onono onono nono nononono.

[Continuar] [Cancelar]
---

Obs:
- Alguns tipos são sempre substitutivos (ex: SBT ou subemenda substitutiva) outros aceitam substituvivo e outros não aceitam. Caso especial do PLV, que não aceita substitutivo, mas precisa referenciar a MPV.
- Indicativo de substitutivo: desabilitado/selecionado para tipos sempre substitutivos, habilitado para proposições que aceitam substitutivo, desabilitado/não selecionado para demais projetos.
- Identificação da proposição "substituída": Habilitada apenas no caso de ind substitutivo selecionado ou PLV.
- Seleção de sigla da proposição: desabilitado com seleção de MPV no caso de PLV.
- Botão de "Verificar" verifica a existência da proposição e preenche a ementa quando a proposição existir. Habilitado quando os 3 campos estão prenchidos.
- Ementa: somente leitura, apagada se mudar a identificação da proposição.

2. Texto inicial para edição.

---
Nova proposição
---

Novo(a) <identificação do novo documento>.

Como você quer iniciar?

O Texto vazio <1>
O Importar documento do Word <2, apresenta campo abaixo quando selecionado>

Arquivo: __________________<seleção do arquivo>

O Texto do<da> <identificação do documento referenciado> <3, se for o caso>

Texto estruturado não disponível para edição. <alerta caso não disponível>

O Texto de outra proposição <4, apresenta campos abaixo quando selecionado>

Proposição: : ___V<sigla> nº ____<número> de _____<ano> [Verificar]

Texto estruturado não disponível para edição. <alerta caso não disponível>

Ementa: Nonon  onononono nonono.

[Continuar] [Voltar] [Cancelar]
---

- Identificação do novo documento.
  - No caso de não substitutivo e não PLV: <tipo do documento>
  - No caso de PLV: Projeto de Lei de Conversão (Medida Provisória nº <número> de <ano>)
  - No caso de substitutivo: Substitutivo ao<à> <tipo da proposicao> nº <número> de <ano>
  - No caso de subemenda substitutiva global: Subemenda Substitutiva ao<à> <tipo da proposicao> nº <número> de <ano>
- Seleção default opção 3 no caso de substitutivo ou PLV, opção 1 demais casos. 
- Continuar:
  - Desabilitar no caso de texto estruturado não disponível para edição.
  - Abre edição vazia no caso da opção 1
  - Abre edição do texto escolhido no caso das opções 3 e 4
  - No caso da opção 2 roda o parser:
    - Se passar, abre para edição
    - Se não passar, abre a próxima tela.

3. Erro de parser

---
Nova proposição
---

Novo(a) <identificação do novo documento>.

Ocoreram os seguintes erros na tentativa de conversão do <nome do arquivo>.

<lista de erros de parser>

Você pode corrigi-los no documento e tentar novamente ou continuar para iniciar com um documento vazio.

[Continuar] [Voltar] [Cancelar]
---

- Continuar: inicia edição de documento vazio.

# Trocar tipo do documento

1. Seleção do tipo do documento

---
Alterar o tipo do documento
---

Tipo do documento: ________V <nome do tipo>

X Substitutivo <indicativo de substitutivo>

Proposição<ou Medida Provisória>: ___V<sigla> nº ____<número> de _____<ano> [Verificar]

Ementa: Nonon nono nonon onono onono nono nononono.

[Ok] [Cancelar]
---





