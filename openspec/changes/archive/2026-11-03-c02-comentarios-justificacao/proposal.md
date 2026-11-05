## Why

Quem revisa uma proposição precisa deixar observações sobre trechos do texto e conversar sobre elas com os demais autores, sem alterar o texto (#972, atividade Redmine #268613, requisito #250356). O editor de emendas (`lexml-emenda`) já tem essa funcionalidade; esta change a traz para a justificação do editor de proposições. Os comentários na articulação ficam para uma change própria, e salvar e abrir os comentários no arquivo fica na c03.

## What Changes

- Botão "Adicionar comentário" na barra de ferramentas da justificação, habilitado com texto selecionado sem comentário, e no quadro de detalhes da marca de revisão.
- Modal para adicionar, editar e responder comentário (até 500 caracteres) e confirmações para excluir comentário e sequência.
- Trecho comentado destacado em amarelo claro, em amarelo escuro com o cursor sobre ele, e com um ícone ao fim que leva ao comentário.
- Aba "Comentários" no painel da direita, antes de "Notas", com as sequências (comentário e respostas), ordenação pela ordem no texto ou pelos mais recentes, destaque da sequência do trecho sob o cursor e seleção da sequência pelo clique ou pelas setas.
- Edição e exclusão só do próprio comentário; exclusão da sequência por qualquer usuário; sequência removida quando o trecho comentado é apagado; desfazer não recria comentário excluído; copiar e colar não levam o comentário; aceitar ou rejeitar uma revisão dentro do trecho não perde o comentário.
- Alerta na aba Avisos e pendência "Remover comentários." enquanto houver comentário.
- O HTML da justificação entregue ao host (`getProposicao().justificativa`) sai sem a marcação de comentário.
- Até a c03, os comentários existem só durante a sessão de edição: não são salvos nem abertos do arquivo.

## Capabilities

### New Capabilities

- `comentarios`: comentários de usuários sobre trechos da justificação, em sequências com respostas, exibidos na aba "Comentários".

### Modified Capabilities

- `pendencias-proposicao`: nova pendência "Remover comentários." e o alerta correspondente na aba Avisos.

## Impact

- Novo módulo do Quill para a marcação do trecho comentado, registrado em `configure-private-quill.ts`.
- `editor-texto-rico.component.ts` e `.css.ts`: botão, destaque, ícone e API usada pela aba; `moduloRevisao.ts`: botão no quadro da revisão e preservação do comentário ao aceitar ou rejeitar.
- `lexml-eta.component.ts`: aba "Comentários", estado das sequências, alerta, pendência e texto entregue ao host.
- Modelo novo de comentário (sequência, comentário, autor e data).
- Depende da c01 (`2026-11-03-c01-destaque-marcas-revisao-texto-rico`), que tira a cor de fundo das marcas de revisão.
- Fora do escopo: articulação, celular (o painel da direita não aparece em telas de até 768px), salvar e abrir no arquivo (c03) e o PDF do host.
- Referência de comportamento: commits de comentários do `lexml-emenda` (18/05 a 20/08/2026). Os dados seguem o formato LexEdit (`docs/extensao-formato-lexml/08-comentarios.md`), não o modelo da emenda.
