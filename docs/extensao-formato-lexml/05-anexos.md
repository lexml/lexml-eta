# Anexos

## Necessidade informacional

O editor precisa referenciar anexos de forma interoperável, preservando o nome e o tipo do arquivo original para apresentação e manipulação. O conteúdo dos arquivos não faz parte do documento articulado: quem o armazena é a aplicação hospedeira, que o recupera pelo identificador do arquivo.

## Representação adotada

Dados estruturados na estrutura do LexEdit.

```xml
<lexedit:Metadado>
    <lexedit:Anexos>
        <lexedit:Anexo
            idArquivo='f669f339-4c8c-4853-806a-706d9fbe6de1'
            nomeArquivo='EMENDA Nº 4 - CCJ - SUBSTITUTIVO.docx'
            nomeDocumento='EMENDA Nº 4 - CCJ - SUBSTITUTIVO'
            tipo='substitutivo'
            mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'/>
        ...
    </lexedit:Anexos>
</lexedit:Metadado>
```

Os cinco atributos de `lexedit:Anexo` são obrigatórios e do tipo xsd:string:

| Atributo | Conteúdo |
| --- | --- |
| `idArquivo` | Identificador do arquivo, devolvido pela aplicação hospedeira ao receber o arquivo. É o único elo para recuperar o conteúdo. |
| `nomeArquivo` | Nome do arquivo original, com extensão. |
| `nomeDocumento` | Nome do documento exibido ao usuário; por padrão, o nome do arquivo sem a extensão. |
| `tipo` | Código do tipo do anexo. Sem enumeração fechada. Todo anexo adicionado pelo editor recebe o valor fixo `nao.informado`, pois o campo de tipo está oculto na interface por enquanto; um arquivo pode trazer outro código. |
| `mimeType` | `application/pdf` ou `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX). |

A ordem dos `lexedit:Anexo` é a ordem de exibição. Sem anexos, o elemento `lexedit:Anexos` é omitido, pois o esquema exige ao menos um `lexedit:Anexo`. O grupo não gera pendência e é gravado também em documento usado como anexo de parecer.

Ao abrir, um `lexedit:Anexo` sem `idArquivo` ou `nomeArquivo`, ou com `mimeType` diferente de PDF e DOCX, é descartado sem impedir a leitura dos demais. `nomeDocumento` ausente assume o nome do arquivo sem extensão, e `tipo` ausente ou vazio assume `nao.informado`.
