# Exemplo completo

## Objetivo

Este arquivo não introduz nenhuma decisão nova: reúne, num único documento LexML coerente, os exemplos apresentados nos demais arquivos desta especificação, para mostrar como os diversos grupos de elementos de `lexedit:Metadado` convivem entre si e com o restante do documento. Os ids, usuários e datas usados abaixo são os mesmos das seções referenciadas, reaproveitados e amarrados numa única história para deixar clara a relação entre eles.

A história do exemplo: o art. 4º original ([Revisão da hierarquia](11-revisao-da-hierarquia.md)) foi excluído numa revisão; por isso a remissão a ele, no art. 2º, ficou inválida ([Remissões internas](10-remissoes-internas.md)) — o que motivou um comentário ([Comentários](08-comentarios.md)) trocado entre os dois usuários cadastrados ([Registro de usuários](12-registro-usuarios.md)), ancorado no caput do próprio dispositivo. A justificação ([Justificação e conteúdo rico](06-justificacao-e-conteudo-rico.md)) recebeu ainda uma revisão textual pontual ([Revisão de texto](09-revisao-de-texto.md)), um segundo comentário ancorado num trecho do seu texto rico por meio de um `span` com id prefixado `_tc`, e uma nota de rodapé ([Notas de rodapé](07-notas-de-rodape.md)) remetendo ao anexo com as diretrizes do programa. Por causa da remissão inválida, dos comentários ainda abertos e das marcas de revisão ainda não aceitas ou rejeitadas, o documento acumula três pendências que impedem o seu protocolamento ([Outros metadados do LexEdit](13-outros-metadados-do-lexedit.md)), ao lado dos demais metadados gerais do arquivo, como a data da última modificação e a aplicação que o gerou.

## Documento de exemplo

O XML completo está em [documento-articulado-exemplo.xml](documento-articulado-exemplo.xml).
