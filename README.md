# Editor de Textos Articulados

<p align="center">O lexml-eta é um <i>web component</i> especializado em edição de dispositivos de normas legais e proposições legislativas, inclusive emendas.</p>

[![Integração Contínua](https://github.com/lexml/lexml-eta/actions/workflows/deploy-demo.yml/badge.svg)](https://github.com/lexml/lexml-eta/actions/workflows/deploy-demo.yml)

## Demo

- https://lexml.github.io/lexml-eta/

## Motivação
A autoria de normas jurídicas pode se beneficiar de uma solução que codifique as regras de técnica legislativa estabelecidas em normas jurídicas como também as regras convencionadas pela tradição legislativa do Brasil. 

Uma norma jurídica se expressa por meio de textos e outros elementos visuais, sendo todos eles manifestados em edições de algum periódico oficial. Além de texto hierárquico e articulado, a norma jurídica pode se manifestar por outros meios, tais como fórmulas, figuras, tabelas, texto corrido não articulado e partitura. 

Este projeto visa desenvolver um componente para elaboração de componentes que suportem a edição do texto articulado de uma norma ou proposição legislativa.

Trata-se de uma proposta inicial, a ser discutida com todos os interessados em sua implementação. Mas, desde já, apresentamos o que seriam alguns objetivos específicos da solução proposta:

- Implementar uma plataforma tecnológica que possa suportar a redação de textos normativos articulados; 
- Desenvolver um ambiente para a autoria legislativa baseado na edição e manipulação de textos estruturados, como a norma e a proposição;
- Permitir a validação da articulação de documentos disponíveis em outros formatos, como o DOCX;
- Especificar formato de documento para atender às necessidades de todos os tipos de documento previstos para o LexEdit e que seja sustentável a longo prazo;
- Atender a requisitos de usabilidade e portabilidade, ampliando as possibilidades de uso da ferramenta sem necessidade de treinamento e de plataformas de hardware e ambiente operacional específicos;
- Desenvolver um produto que possa ser distribuído e incorporado em diferentes ambientes e sistemas, e extensível para atender a necessidades de outras instituições;
- Criar um  ambiente de colaboração, de modo a facilitar a incorporação de desenvolvedores de outras instituições, empresas ou indivíduos no esforço de desenvolvimento do editor e de outras ferramentas relacionadas.

## Principais funcionalidades

- Apresentar o texto articulado em consonância com padrões previstos em normas vigentes (LC 95 e Decreto 9.191/2017, entre outros);
- Permitir que sejam utilizadas mais de uma instância do editor para a edição de textos articulados;
- Oferecer recursos de navegação com o teclado, de maneira similar ao que ocorre em processadores de texto;
- Permitir a criação e edição do texto articulado em consonância com as normas vigentes (LC 95) e a especificação contida no padrão LexML;
- Oferecer recursos básicos de formatação de dispositivo, quando isso for permitido;
- Numerar automaticamente os dispositivos do texto articulado que estejam em consonância com as normas vigentes;
- Permitir a numeração manual do dispositivo quando se tratar de alteração de norma existente;
- Numerar dispositivos agrupadores (Livros, Partes, Capítulos, Títulos, Seções e Subseções)
- Definir regras de edição do texto articulado;
- Oferecer ações permitidas sobre os dispositivos, segundo as regras previstas e dependentes do contexto; 
- Possibilitar a criação de dispositivos automaticamente, à medida que o usuário for digitando, inclusive gerando automaticamente os rótulos de dispositivo:
  - O uso dos dois pontos comanda o desdobramento dos dispositivos em filhos;
  - O uso de ponto e vírgula indica continuação de sequência de dispositivos do mesmo tipo, admitindo-se o uso de " ; e " e "; ou " quando se tratar do penúltimo dispositivo
  - No caso de artigos e parágráfos não há distinção entre continuação e fim de sequência pois só é admitido o uso de ponto final;
  - Essas regras não se aplicam a dispositivos agrupadores, pois esses não podem possuir pontuação.
- Bloquear a edição dos rótulos de dispositivo, a menos que se trate de alteração de norma existente;
- Promover mudança estrutural de artigos e dispositivos de artigo, considerando os dispositivos dependentes;
- Suporte a emendamento de proposições, inclusive com geração automática do comando de emenda;
- Manter histórico das modificações efetuadas sobre a articulação, permitindo desfazer e refazer operações efetuadas no documento;
- Validar a situação do dispositivo;
- Permitir a incorporação dos componentes desenvolvidos em página HTML e sua utilização em frameworks JavaScript;
- Permitir a edição de um texto articulado independente do seu tamanho;
- Definir estilos consistentes e protegidos contra alteração não intencional;

## Versão para uso em produção

Somente a partir do segundo semestre de 2022

## Executando o demo localmente

Para testar, basta seguir os seguintes passos:

```
git clone https://github.com/lexml/lexml-eta.git
npm install
npm start
```
Será aberta uma janela do browser com uma aplicação exemplo que permite testar o componente. Em breve, iremos disponibilizar um link aqui para testar a aplicação sem necessidade de baixar o projeto.

Quando estiver disponível uma versão para uso, teremos instruções mais detalhadas de como utilizar o componente em página html e frameworks mais populares. 

## Teste

Para executar os testes apenas uma vez:

```
npm run test

```

Para executar os testes em modo de desenvolvimento:

```
npm run test:watch

```

Para executar um teste apenas:

```
npm run test -- --grep out-tsc/test/**/parte.test.js
```

## Linting

Para varrer o projeto em buscar de erros (lint):

```
npm run lint
```

## Créditos

Este projeto partiu de muita idéias do editor [Lexedit](https://legis.senado.leg.br/lexedit/), do projeto Lexml, e do [Editor de Articulação](https://silegis-mg.github.io/editor-articulacao/) da Assembléia Legislativa de Minas Gerais, disponível como código aberto, no [github]( https://github.com/silegis-mg/editor-articulacao). Desse último editor, devemos muito à sua abordagem moderna e amigável de edição.

Este componente segue as recomendações do [open-wc](https://github.com/open-wc/open-wc) e utiliza-se dos seguintes softwares e componentes, entre outros:

- [LitElement](https://lit-element.polymer-project.org/) 
- [Quill](https://quilljs.com/docs/quickstart/)
- [Redux](https://redux.js.org/)


## Patrocínio

- Câmara dos Deputados
- Senado Federal

## Contribua com o projeto
O projeto está apenas iniciando. Toda ajuda é bem-vinda!

