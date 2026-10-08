# Pendências

## Anotações

- Verificar modelos de epígrafe para substitutivo, subemenda substitutiva global e PLV
- Fecho:
  - PL: Local "Sala das Sessões"
  - "Sala da comissão" em substitutivo de comissão
  - MPV: Brasília, 25 de setembro de 2026; 205º da Independência e 138º da República
- Verificar necessidade do compolemento da epígrafe
  - Exemplo:
    PROJETO DE LEI DE CONVERSÃO Nº 10, DE 2026
    (Medida Provisória nº 1.366, de 2026)

## Discutir com Robson

- Importar documento
- Identificação da proposição / substitutivo
- Alterar tipo da proposição
- Modo anexo de parecer
  - [Regra a confirmar com clientes] Considerar o substitutivo sempre como anexo de parecer.
- [levantamento] precisamos em algum momento apresentar assinatura em substitutivo?
- [levantamento] Destino/Autoria de comissão
- [levantamento] Tipos de autoria

## Decisões técnicas

- Sobre importação de documentos em DOCX/TXT
  - Componente independente a ser usado pelo editor ou embutir no lexml-eta?
  - Vamos tratar dispositivos/agrupamentos genéricos?

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
urnReferenciada: urn:lex:br:presidencia.republica:medida.provisoria;mpv:2026;4321


urn:lex:br:senado.federal:projeto.lei;pl:2026;12@apresentacao.substitutivo

urnReferenciada (urn do projeto que recebe o substitutivo, urn da MPV no caso de edição de PLV...)

urn:lex:br:camara.deputados:substitutivo;sbt:9999;999999@apresentacao.substitutivo
urnReferenciada: urn:lex:br:camara.deputados:projeto.lei;pl:2026;12


autoridade: senado.federal
tipo do documento: projeto.lei;pl
data (ou apenas ano)
número
versão

@aprovacao.substitutivo.decisao.terminativa
@aprovacao.subsitutivo
@apresentacao.substitutivo