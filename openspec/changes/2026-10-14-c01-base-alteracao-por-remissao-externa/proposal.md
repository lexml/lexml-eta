## Why

Ao criar um artigo de alteração ("A Lei nº X, de …, passa a vigorar com as seguintes alterações:"), o usuário já cita a norma no próprio texto, e o detector cria a remissão externa para ela. Mesmo assim o editor exibe "É necessário informar a norma a ser alterada" e obriga a repetir a informação num diálogo, cujo "Corrigir agora" ainda destrói a remissão existente (vira um link comum). Além disso, nada avisa quando a norma alterada (`base`) e a norma citada no artigo divergem.

## What Changes

- Quando um artigo de alteração está **sem norma alterada** e passa a ter **exatamente uma** remissão externa no próprio texto, o sistema preenche a norma alterada (`base`) com a URN dessa remissão. Vale para remissão criada automaticamente (detecção) ou manualmente.
- Com **duas ou mais** remissões externas no artigo, nada é preenchido nem avaliado automaticamente.
- Nova validação de **aviso permanente** (WARNING): artigo de alteração com `base` definido e exatamente uma remissão externa para **outra** norma. O aviso oferece "Corrigir agora", que alinha o `base` à norma citada.
- A validação também vale **ao abrir** um documento, mas a abertura **nunca altera** o `base`.
- **Correção de bug:** "Corrigir agora" do alerta de norma não informada deixa de substituir a remissão externa do artigo por um link comum (perdia os atributos da remissão e deixava o registro de remissões órfão).
- **Correção de bug:** o texto gerado com o nome da norma deixa de exibir "nº NaN" para números compostos (ex.: Medida Provisória nº 2.158-35).

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `bloco-alteracao-norma`: novas regras de norma alterada (`base`) derivada da remissão externa, aviso de divergência com correção em um clique, preservação da remissão ao informar a norma e texto gerado com número composto.

## Impact

- Código: validação do artigo (`conteudoValidator`), reducers de remissão externa (`adicionaRemissaoExterna`, `removeRemissaoExterna`), `atualizaReferenciaElemento`, `autoFixElemento`, enum `AutoFix` (`mensagem.ts`), `formataNumero` (`urnUtil.ts`).
- Documentos existentes: nenhuma migração. A medição no corpus real (96 artigos de alteração, 91 normas distintas) não produziu nenhum aviso falso ao abrir.
- Sem mudança de formato de arquivo nem de API pública do componente.
- Fora do escopo: renumeração da cabeça de alteração (change `2026-10-14-c02-numerar-cabeca-de-alteracao`).
