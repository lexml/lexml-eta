## Context

Ver proposal.md (Why). Fatos que moldam a solução, verificados no arquivo da issue com cliques nos botões (Cypress) e na leitura do código:

- `navegaEntreDispositivosAlterados.ts` anda a partir da linha atual pela sequência de leitura (`getDispositivo{Anterior,Posterior}NaSequenciaDeLeitura`, sem caput) e, a cada passo, testa se o dispositivo tem revisão principal e se há uma exclusão ancorada nele (`elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura`).
- Defeitos: (a) a partir de um excluído, a subida parte do dispositivo seguinte à âncora, que não existe quando o excluído é o último do documento (o caso da issue: nada acontece); (b) a partir de um excluído, `ignorarRevisoesDeExclusao` desliga todas as exclusões na busca; (c) a exclusão ancorada num dispositivo é testada depois dele na subida e nunca é testada na descida que parte dele, então é pulada quando ele também é marca; (d) `find` devolve só a primeira exclusão de uma âncora.
- A âncora (`createElemento`) é o dispositivo imediatamente acima, sem caput (caput e articulação de alteração viram o artigo) e, para o primeiro artigo, o último dispositivo da parte inicial (preâmbulo ou ementa). Ela continua apontando para o dispositivo acima mesmo depois de ele ser excluído: o excluído de cima é achado pela âncora (inclusive último descendente) ou, em documento reaberto, pelo encadeamento `_encadeado` (`principalDoExcluido` e `excluidoImediatamenteAntes`, hoje privadas em `atualizaRevisao.ts`).
- A troca de página na articulação paginada já é decidida a partir do elemento encontrado e não muda.

## Goals / Non-Goals

**Goals:**
- Uma única ordem de navegação, a mesma nos dois sentidos, que inclui todas as marcas principais.

**Non-Goals:**
- Revisões que não são principais (descendentes de dispositivo incluído ou excluído) continuam fora da navegação, como hoje.
- A revisão de inclusão do inciso sem número do arquivo da issue, que não se liga ao inciso ao abrir (issue a abrir).

## Decisions

**1. Lista na ordem de leitura, montada a cada navegação.** Percorrer ementa, preâmbulo e a articulação (sem caput) e, depois de cada item, inserir os excluídos ancorados nele, na ordem de `state.revisoes`, repetindo para os excluídos ancorados em excluídos. A posição atual é o item do dispositivo da linha (ou da exclusão principal, quando a linha é um excluído ou descendente dele), e o destino é o próximo item com marca na direção pedida.
- Alternativa descartada: corrigir cada defeito no laço atual. A ordem de teste da âncora é diferente em cada sentido, e os casos de excluídos seguidos exigiriam um terceiro caminho de busca; a lista dá a mesma ordem nos dois sentidos por construção.
- Alternativa descartada: ler a ordem das linhas do Quill. O reducer não conhece a tela, e a navegação também é usada sem o editor (testes de reducer, host).

**2. Âncora de excluído em excluído pelas funções que já existem.** Mover `principalDoExcluido` e `excluidoImediatamenteAntes` para `revisaoUtil.ts`, exportadas, e usá-las em `atualizaRevisao.ts` e na navegação, para que a ordem da navegação e a da reaplicação de posições não divirjam.

**3. Custo.** Montar a lista é linear no tamanho da articulação, como o laço atual no pior caso, e só roda no clique do botão.

## Risks / Trade-offs

- [Dois excluídos com a mesma âncora em ordem diferente da tela] → a ordem de `state.revisoes` é a ordem da exclusão; o cenário "Dois excluídos seguidos" e o E2E conferem a ordem da tela na sessão (excluindo nas duas ordens possíveis) e o teste de reducer confere o documento reaberto.
- [Excluído cuja âncora não é achada] → entra no fim da lista, para continuar alcançável, em vez de sumir da navegação.
