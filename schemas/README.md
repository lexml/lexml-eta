Esquemas do conversor [jsonix-lexml](https://github.com/lexml/jsonix-lexml), revisão fixa
9c02a3d26bc498b72a7cc4153dcdd0d56b37f47b (versão 2.0.0).

Os arquivos lexedit.xsd, lexml-simples.xsd, math.xsd, xlink.xsd e xml.xsd são iguais aos de
schemas/ nessa revisão. São usados na validação local dos testes do ETA.

lexml-simples.xsd tem dois desvios intencionais do esquema LexML oficial, feitos no jsonix-lexml
e comentados no próprio arquivo: MetadadoProprietario usa xsd:any com processContents="lax", para
o conteúdo do LexEdit ser convertido em objetos tipados; e Rotulo é xsd:string, para o JSON de
"rotulo" continuar sendo texto. Manter os dois ao atualizar a partir do esquema oficial.

A validação dos testes usa lexedit.xsd como entrada. Ele importa lexml-simples.xsd e, assim,
valida também o conteúdo de lexedit:Metadado, que lexml-simples.xsd sozinho não verifica.

O teste exige o executável jsonix-lexml da versão 2.0.0, nessa revisão, e Java 11 ou superior.
Defina JSONIX_LEXML_CLI com o caminho absoluto do executável e execute
npm run test:documento-articulado:xml.

Referência do executável Windows utilizado:
SHA-256 94F14F4E60E85435100B4DBC39B9DDD6D0AE42599355953A2FDD04EF2063A9A7.

A validação XSD não comprova a regra de URN provisória: Identificacao/@URN usa anyURI.
Essa regra é testada separadamente nos testes de documentoArticulado.
