# Handoff — comentários na articulação (#972, atividade #269244)

Atualizado em 13/11/2026. **Atividade pausada por prioridade.**

Branch: `feat/972-comentarios`.

## Estado

- **Justificação:** alinhada ao lexml-emenda pela change `2026-11-11-c01-alinhar-comentarios-justificacao-lexml-emenda`, arquivada e commitada (`0c8a0327`, `6ccedd3b`).
- **Articulação:** change `2026-11-08-c01-comentarios-articulacao`, com os grupos 1 a 5 aplicados, validados pelo usuário e commitados (14/16 tasks). Já funcionam:
  - criar, responder e excluir comentário em dispositivo;
  - ícone na linha;
  - cursor e aba;
  - exclusão com desfazer;
  - exclusão em revisão;
  - transformação;
  - telas pequenas;
  - aba no anexo de parecer.
- **Arquivo:** a gravação e a leitura no arquivo (`2026-11-08-c02-salvar-abrir-comentarios-articulacao`) ainda não foram iniciadas.

## Como retomar

1. `git pull` e `npm install`.
2. Ler:
   - `openspec/changes/2026-11-08-c01-comentarios-articulacao/relatorio.md`, com o relatório por grupo, as decisões e os defeitos achados;
   - os artefatos da c01 e o item 24 do `CLAUDE.md`.
3. Retomar pelo grupo 6 da c01 (`/opsx:apply 2026-11-08-c01-comentarios-articulacao`):
   - **6.1:** registrar no item 24 do `CLAUDE.md` a âncora por `uuid2`, a conferência das sequências depois do lote inteiro, a passagem da sequência para o novo `uuid2` na transformação, a segunda passada do ícone (`setTimeout` 0) e o redesenho da aba em eventos estruturais;
   - **6.2:** `npm test` completo (em segundo plano, sem rodar `npx tsc` ao mesmo tempo), lint só dos arquivos alterados e `openspec validate 2026-11-08-c01-comentarios-articulacao --strict`.
4. Arquivar a c01 com sync:
   - o delta tem MODIFIED de "Sequência atual ao trocar de aba" e "Comentários em telas pequenas", arquivados na `2026-11-11-c01`;
   - ajustar o Purpose da spec `comentarios`, que hoje fala só da justificação.
5. Só depois disso, a c02, que precisa do CLI `jsonix-lexml` 2.4.0 ou posterior e de um Java 11 ou posterior no PATH.

## Decisões do usuário (não reabrir)

- **Referência:** o lexml-emenda é a referência de visual e comportamento, e o prompt deixado pelo João Matos é só orientativo. A prioridade é não quebrar o que funciona.
- **Bloqueios do botão:** comentário novo não é permitido em omissis nem em dispositivo excluído em revisão (diferente do lexml-emenda).
- **Exclusão em revisão:** a sequência continua até a revisão ser aceita; rejeitar a mantém (diferente do lexml-emenda, que a perde).
- **Transformação:** troca o `uuid2`. A reconciliação passa a sequência para o novo `uuid2` quando o lote remove e inclui o mesmo `uuid`. O reducer não foi alterado.
- **Ordem do ícone:** o ícone de comentário é sempre o último da linha, depois de aceitar, rejeitar, informações e diferenças.
- **Telas pequenas:**
  - botão "Comentários" na barra do texto articulado até 768px;
  - o modal da lista substitui a aba até 992px;
  - no anexo de parecer, a aba da direita abre por padrão em "Comentários".
- **Processo:**
  - relatório autossuficiente a cada grupo, em `relatorio.md` da change, para o João validar;
  - pausa por grupo;
  - Cypress só com permissão;
  - commits só com o plano aprovado e sem coautor.

## Pendências fora do escopo

- `vocabularioCasaEditor.component.test.ts` ("SF: recusa a URN da Câmara…") falha de forma intermitente sob carga: compara dois `getDocumentoArticulado()` sem `congelarRelogio()`. Não é desta change.
- `editor.component.ts` tem 6 avisos antigos de eslint ("Missing return type"), anteriores a esta change.
