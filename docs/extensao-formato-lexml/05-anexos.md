# Anexos

## Necessidade informacional

O editor precisa referenciar anexos de forma interoperável, preservando o nome e o tipo do arquivo original para apresentação e manipulação.

## Representação proposta

Dados estruturados na estrutura do LexEdit.

```xml
<lexedit:Metadado>
    <lexedit:Anexos>
        <lexedit:Anexo
            idArquivo='f669f339-4c8c-4853-806a-706d9fbe6de1'
            nomeArquivo='EMENDA Nº 4 - CCJ - SUBSTITUTIVO.docx'
            nomeDocumento='EMENDA Nº 4 - CCJ - SUBSTITUTIVO'
            tipo='SUBSTITUTIVO'
            mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'/>
        ...
    </lexedit:Anexos>
</lexedit:Metadado>
```
