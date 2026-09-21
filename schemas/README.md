Esquemas do conversor [jsonix-lexml](https://github.com/lexml/jsonix-lexml), revisão fixa
3f570910f6034d09e1bfb657b7e15ef2c6717012.

Os arquivos lexml-simples.xsd, math.xsd, xlink.xsd e xml.xsd foram copiados sem alterações
de schemas/ nessa revisão. São usados somente na validação local dos testes do ETA.

O teste exige o executável jsonix-lexml da release 1.0.0 e Java 11 ou superior.
Defina JSONIX_LEXML_CLI com o caminho absoluto do executável e execute
npm run test:documento-articulado:xml.

Referência do executável Windows utilizado:
SHA-256 ABE18649A2BE7842AB105EA8C125D5CD196D8B53D346C9EC43039FBF5BD7A27E.

A validação XSD não comprova a regra de URN provisória: Identificacao/@URN usa anyURI.
Essa regra é testada separadamente nos testes de documentoArticulado.
