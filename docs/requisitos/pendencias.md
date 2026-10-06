# Pendências

## Especificação

- Especificar edição de pena
- Verificar quais tipos permitem substitutivo
- Reavaliar necessidade de configurar ordem padrão de escrita dos dispositivos em remissões internas

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

