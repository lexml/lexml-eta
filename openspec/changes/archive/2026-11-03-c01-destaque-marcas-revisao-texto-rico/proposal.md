## Why

Os comentários na justificação (#972, atividade Redmine #268613) vão destacar o trecho comentado com fundo amarelo. Hoje as marcas de revisão da justificação também usam cor de fundo (verde na inclusão, vermelho na exclusão), e as duas marcações se confundiriam. O requisito #250356 resolve isso tirando o fundo das marcas de revisão e destacando com moldura a revisão sob o cursor. A mudança é visual, independente dos comentários, e vem antes deles.

## What Changes

- Texto incluído em revisão passa a ser exibido com a letra verde, sem cor de fundo.
- Texto excluído em revisão passa a ser exibido com um traço vermelho sobre o texto, sem cor de fundo, e sem a verificação ortográfica do navegador.
- Com o cursor numa marca de revisão, todos os trechos da mesma revisão ganham uma moldura (verde na inclusão, vermelha na exclusão). Trechos contíguos da mesma revisão formam uma moldura só. A moldura some quando o cursor sai da marca.
- O texto da justificação entregue ao host e gravado no arquivo não muda: a moldura e a desativação da verificação ortográfica existem só na tela.

## Capabilities

### New Capabilities

- `marcas-revisao-texto-rico`: exibição das marcas de revisão (inclusão e exclusão) no editor de texto rico da justificação e destaque da revisão sob o cursor.

### Modified Capabilities

(nenhuma)

## Impact

- `src/components/editor-texto-rico/editor-texto-rico.css.ts`: regras de `ins`/`del` e da moldura.
- `src/components/editor-texto-rico/editor-texto-rico.component.ts`: atualização da moldura na mudança de seleção e atributo de verificação ortográfica no `del`, retirado do HTML entregue.
- Testes de componente do editor de texto rico e E2E da justificação.
- Sem mudança de formato de arquivo, de API pública nem de comportamento de aceitar e rejeitar revisões. Referência de implementação: commits `f5743bff`, `b24fcd8a` e `1a50302d` do `lexml-emenda`.
