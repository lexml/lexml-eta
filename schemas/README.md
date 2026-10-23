Esquemas do conversor [jsonix-lexml](https://github.com/lexml/jsonix-lexml), revisão fixa
d6aa790b3b218097a4bbd2b71c21db61321c90c7 (versão 2.3.0).

Os arquivos lexedit.xsd, lexml-simples.xsd, math.xsd, xlink.xsd e xml.xsd devem ser iguais aos de
schemas/ do conversor. São usados na validação local dos testes do ETA.

O original de lexedit.xsd é o deste projeto: ele é copiado para o jsonix-lexml, que gera dele os
mapeamentos do CLI. Ao alterá-lo, copie-o para o conversor e gere uma nova versão do CLI. Os
demais arquivos vêm do jsonix-lexml.

lexml-simples.xsd tem dois desvios intencionais do esquema LexML oficial, feitos no jsonix-lexml
e comentados no próprio arquivo: MetadadoProprietario usa xsd:any com processContents="lax", para
o conteúdo do LexEdit ser convertido em objetos tipados; e Rotulo é xsd:string, para o JSON de
"rotulo" continuar sendo texto. Manter os dois ao atualizar a partir do esquema oficial.

A validação dos testes usa lexedit.xsd como entrada. Ele importa lexml-simples.xsd e, assim,
valida também o conteúdo de lexedit:Metadado, que lexml-simples.xsd sozinho não verifica.

O teste exige o executável jsonix-lexml da versão 2.3.0 e Java 11 ou superior.
Defina JSONIX_LEXML_CLI com o caminho absoluto do executável e execute
npm run test:documento-articulado:xml.

Referência do executável Windows utilizado:
SHA-256 B7B65ED2A3AF30A28B7424A8F72EB0227AE4D4DDB92BEC6E0FEFFD1462C44766.

A validação XSD não comprova a regra de URN provisória: Identificacao/@URN usa anyURI.
Essa regra é testada separadamente nos testes de documentoArticulado.
