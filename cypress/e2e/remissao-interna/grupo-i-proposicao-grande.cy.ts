/**
 * Grupo I — Atualização de remissão em proposição real de grande porte
 *
 * Os grupos A-H usam documentos construídos via novaProposicao() + menu de contexto — árvores
 * pequenas e limpas, sem o ruído estrutural de um documento real (blocos de alteração aninhados,
 * capítulos, centenas de dispositivos). Este grupo abre proposições reais e grandes já disponíveis
 * no demo (mapProjetosNormas em demo/components/demoview.ts) para validar que a atualização de
 * remissões por renumeração (sincronizarRemissoes.ts) se comporta corretamente em escala.
 *
 * Nenhuma das proposições pré-existentes tem remissão interna serializada (a feature é posterior a
 * esses fixtures) — por isso a remissão é injetada via digitarTextoRemissao + dispararDeteccaoRemissao
 * sobre o texto real do documento, e não lida diretamente de um arquivo já pronto.
 *
 * CT-I-01 usa mpv_905_2019 (chave SEM "_" no select — a variante "_mpv_905_2019" tem dispositivos
 * bloqueados via mapDispositivosBloqueados, o que não interessa aqui). O documento tem 53 artigos de
 * nível 0 (Art. 1º a Art. 53), confirmado via inspeção do DOM renderizado.
 *
 * CT-I-02 usa _codcivil_parcial1 (Código Civil, arts. 1 a 1023) — documento bem maior: 1023
 * dispositivos no state, 722 artigos no nível 0 no DOM. Escolhido em vez de _pl_4_2025 (que também
 * não tem paginação configurada e seria do mesmo porte): PL 4/2025 não renderiza no editor —
 * trava indefinidamente com um TypeError ("Cannot read properties of undefined (reading 'descricao')")
 * logado no console, reproduzível independente de remissão (bug pré-existente do editor, fora do
 * escopo deste trabalho; registrar para investigação futura).
 *
 * CT-I-03 (exploratório) — diferente de CT-I-01/02 (texto injetado via digitarTextoRemissao), este
 * teste dispara a detecção sobre um trecho de PROSA LEGISLATIVA GENUÍNA que já vem no documento, em
 * _codcivil_parcial1. Escopo deliberadamente menor que CT-I-01/02: valida só a DETECÇÃO (criação do
 * link correto), não o ciclo de renumeração.
 *
 * Achado ao construir este teste: uma primeira tentativa usou a MPV 905/2019 (referência real a um
 * art. 634-A inserido na CLT pela própria MPV, repetida dezenas de vezes em blocos de alteração de
 * outras leis) — não funcionou. O alvo nunca resolve porque dispositivos dentro de blocoAlteracao não
 * são alcançáveis pela mesma travessia de hierarquia que buscaDispositivoById usa para o resto da
 * árvore. Limitação real da resolução de alvo dentro de blocos de alteração — fora do escopo deste
 * grupo, registrada para investigação futura (ver comentário no describe do CT-I-03 abaixo).
 *
 * IMPORTANTE: digitarTextoRemissao('') sozinho NÃO dispara a detecção — verificarSomenteFormatoMudou
 * (editor.component.ts) compara o texto plano antes/depois e pula adicionarRemissaoInternaAction
 * quando o conteúdo não mudou de verdade (proteção deliberada contra recriar remissão recém-excluída
 * pelo usuário). Por isso injeta-se um espaço real (mudança mínima e inofensiva) antes de disparar.
 */
describe('Grupo I: atualização de remissão em proposição real de grande porte (MPV 905/2019, 53 artigos)', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao('mpv_905_2019');
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.getContainerArtigoByNumero(53).should('exist');
  });

  it('CT-I-01: remissão ao art. 1º acompanha a renumeração ao inserir um novo artigo antes dele', () => {
    // Art. 53 (caput "Esta Medida Provisória entra em vigor:") não tem texto que colida com o
    // padrão de detecção — seguro para injetar a remissão sem gerar links espúrios.
    cy.getContainerArtigoByNumero(53).digitarTextoRemissao('Conforme o art. 1º, aplica-se o disposto a seguir. ');
    cy.getContainerArtigoByNumero(53).find('p.texto__dispositivo').should('contain.text', 'art. 1º');

    cy.getContainerArtigoByNumero(53).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(53).find('a.lexml-remissao-interna').should('have.length', 1).and('contain.text', 'art. 1º');

    // Insere um novo artigo antes do Art. 1º — desloca os 53 artigos existentes em +1.
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo antes');
    cy.getContainerArtigoByNumero(2).should('exist'); // era o antigo Art. 1º

    // O antigo Art. 53 (com a remissão) agora é o Art. 54; a remissão deve apontar para o novo
    // número do alvo (Art. 2º), sem perder o link nem duplicar.
    cy.getContainerArtigoByNumero(54).find('a.lexml-remissao-interna').should('have.length', 1).and('contain.text', 'art. 2º');
  });
});

describe('Grupo I: atualização de remissão em proposição real de grande porte (Código Civil parcial, 722 artigos no nível 0)', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao('_codcivil_parcial1');
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.getContainerArtigoByNumero(721).should('exist');
  });

  it('CT-I-02: remissão ao art. 1º acompanha a renumeração em documento de mais de 700 artigos', () => {
    // Art. 721 ("Aplicam-se ao contrato de agência e distribuição...") não colide com o detector.
    cy.getContainerArtigoByNumero(721).digitarTextoRemissao('Conforme o art. 1º, aplica-se o disposto a seguir. ');
    cy.getContainerArtigoByNumero(721).find('p.texto__dispositivo').should('contain.text', 'art. 1º');

    cy.getContainerArtigoByNumero(721).dispararDeteccaoRemissao();
    cy.getContainerArtigoByNumero(721).find('a.lexml-remissao-interna').should('have.length', 1).and('contain.text', 'art. 1º');

    // Insere um novo artigo antes do Art. 1º — desloca os 722 artigos de nível 0 em +1.
    cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo antes');
    cy.getContainerArtigoByNumero(2).should('exist'); // era o antigo Art. 1º

    // O antigo Art. 721 (com a remissão) agora é o Art. 722; a remissão deve refletir o novo
    // número do alvo (Art. 2º) mesmo com centenas de dispositivos intermediários renumerados junto.
    cy.getContainerArtigoByNumero(722).find('a.lexml-remissao-interna').should('have.length', 1).and('contain.text', 'art. 2º');
  });
});

describe('Grupo I: detecção sobre prosa legislativa genuína (Código Civil parcial1)', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.novaProposicao('_codcivil_parcial1');
    cy.getContainerArtigoByNumero(1).should('exist');
    cy.getContainerArtigoByNumero(3).should('exist');
  });

  it('CT-I-03: cria link a partir de referência já existente no texto original do documento', () => {
    // texto__dispositivo599 (inciso): "contra os incapazes de que trata o art. 3º;" — texto real,
    // presente no documento desde a abertura, nunca tocado por digitarTextoRemissao.
    //
    // Primeira tentativa usou um trecho da MPV 905/2019 (bloco de alteração inserindo art. 634-A na
    // CLT, referenciado depois por dezenas de outros blocos de alteração) — não funcionou: a árvore
    // de dispositivos desses blocos não é alcançável por buscaDispositivoById/hierarquiaUtil da mesma
    // forma que a árvore normal, então o alvo nunca resolve e nenhum link é criado. Isso é uma
    // limitação real da resolução de alvo dentro de blocoAlteracao — fora do escopo deste grupo,
    // registrado para investigação futura. O Código Civil não tem esse problema: é a árvore normal.
    cy.get('#texto__dispositivo599').closest('div.container__elemento').as('origem');

    // Insere um espaço no início: mudança mínima, real, que satisfaz verificarSomenteFormatoMudou
    // e libera a redetecção sobre o texto inteiro do dispositivo (o trecho pré-existente incluído).
    cy.get('@origem').digitarTextoRemissao(' ');
    cy.get('@origem').dispararDeteccaoRemissao();

    cy.get('@origem').find('a.lexml-remissao-interna').should('have.length', 1).and('contain.text', 'art. 3º');
  });
});
