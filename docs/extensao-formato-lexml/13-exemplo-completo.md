# Exemplo completo

## Objetivo

Este arquivo não introduz nenhuma decisão nova: reúne, num único documento LexML coerente, os exemplos apresentados nos demais arquivos desta especificação, para mostrar como os diversos grupos de elementos de `lexedit:Metadado` convivem entre si e com o restante do documento. Os ids, usuários e datas usados abaixo são os mesmos das seções referenciadas, reaproveitados e amarrados numa única história para deixar clara a relação entre eles.

A história do exemplo: o art. 4º original ([Revisão da hierarquia](11-revisao-da-hierarquia.md)) foi excluído numa revisão; por isso a remissão a ele, no art. 2º, ficou inválida ([Remissões internas](10-remissoes-internas.md)) — o que motivou um comentário ([Comentários](08-comentarios.md)) trocado entre os dois usuários cadastrados ([Registro de usuários](12-registro-usuarios.md)), ancorado no caput do próprio dispositivo. A justificação ([Justificação e conteúdo rico](06-justificacao-e-conteudo-rico.md)) recebeu ainda uma revisão textual pontual ([Revisão de texto](09-revisao-de-texto.md)), um segundo comentário ancorado num trecho do seu texto rico por meio de um `span` com id prefixado `_tc`, e uma nota de rodapé ([Notas de rodapé](07-notas-de-rodape.md)) remetendo ao anexo com as diretrizes do programa.

## Documento de exemplo

```xml
<?xml version="1.0" encoding="UTF-8"?>
<LexML xmlns="http://www.lexml.gov.br/1.0" xmlns:xlink="http://www.w3.org/1999/xlink">
  <Metadado>

    <!-- Identificação provisória e URN -->
    <Identificacao URN="urn:lex:br:senado.federal:projeto.lei:999999;9999"/>

    <MetadadoProprietario>
      <lexedit:Metadado
          xmlns:lexedit='http://www.lexml.gov.br/lexedit/1.0'
          local='Sala das Sessões'
          data='2026-04-24'>

        <!-- Opções de impressão -->
        <lexedit:OpcoesImpressao
            imprimirBrasao='true'
            textoCabecalho=''
            reduzirEspacoEntreLinhas='false'
            tamanhoFonte='14'/>

        <!-- Autoria -->
        <lexedit:Autoria
            tipo='Parlamentar'
            imprimirPartidoUF='true'>
          <lexedit:Parlamentares>
            <lexedit:Parlamentar
                identificacao='1111'
                nome='Davi Alcolumbre'
                sexo='M'
                siglaPartido='UNIÃO'
                siglaUF='AP'
                siglaCasaLegislativa='SF'
                cargo='Presidente do Senado Federal'/>
            <lexedit:Parlamentar
                identificacao='2222'
                nome='Soraya Thronicke'
                sexo='F'
                siglaPartido='PSB'
                siglaUF='MS'
                siglaCasaLegislativa='SF'
                cargo=''/>
          </lexedit:Parlamentares>
        </lexedit:Autoria>

        <!-- Anexos -->
        <lexedit:Anexos>
          <lexedit:Anexo
              idArquivo='f669f339-4c8c-4853-806a-706d9fbe6de1'
              nomeArquivo='diretrizes.docx'
              nomeDocumento='Diretrizes do programa'
              tipo='outro'
              mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'/>
        </lexedit:Anexos>

        <!-- Comentários: uma sequência ancorada no caput do art. 2º (dispositivo da articulação)... -->
        <lexedit:Comentarios>
          <lexedit:SequenciaComentario refIdElementoComentado='art2_cpt'>
            <lexedit:Comentario refIdUsuario='sf:fulano' data='2026-05-11T15:51:00-03:00'>
              <p>Confirmar se o órgão gestor já está definido em outro dispositivo.</p>
            </lexedit:Comentario>
            <lexedit:Comentario refIdUsuario='sf:sicrana' data='2026-05-12T09:00:00-03:00'>
              <p>Já está definido no art. 1º. A remissão ao art. 4º ficou inválida depois que ele foi excluído; ajustar o texto.</p>
            </lexedit:Comentario>
          </lexedit:SequenciaComentario>
          <!-- ...e outra ancorada num trecho de texto da justificação, via span id='_tc...' -->
          <lexedit:SequenciaComentario refIdElementoComentado='_tc1777387565991'>
            <lexedit:Comentario refIdUsuario='sf:fulano' data='2026-05-12T10:00:00-03:00'>
              <p>Essa remissão ao art. 1º continua correta depois da exclusão do art. 4º?</p>
            </lexedit:Comentario>
            <lexedit:Comentario refIdUsuario='sf:sicrana' data='2026-05-12T10:15:00-03:00'>
              <p>Sim, o art. 1º não foi alterado nessa revisão.</p>
            </lexedit:Comentario>
          </lexedit:SequenciaComentario>
        </lexedit:Comentarios>

        <!-- Revisão de texto: troca de "reforma" por "modernização" na justificação -->
        <lexedit:RevisoesTextuais>
          <lexedit:RevisaoTextual refIdRevisao='_rt245245234523' refIdUsuario='sf:fulano' data='2026-05-11T15:51:00-03:00'/>
          <lexedit:RevisaoTextual refIdRevisao='_rt879079079778' refIdUsuario='sf:fulano' data='2026-05-11T15:52:00-03:00'/>
        </lexedit:RevisoesTextuais>

        <!-- Remissões internas inválidas: a remissão ao art. 4º, excluído na revisão abaixo -->
        <lexedit:RemissoesInternasInvalidas refIdsRemissoesInternas='_ri13481093417'/>

        <!-- Revisão da hierarquia: exclusão do art. 4º original -->
        <lexedit:RevisoesArticulacao>
          <lexedit:RevisaoArticulacao
              revisao='excluido'
              refIdUsuario='sf:sicrana'
              data='2026-05-12T09:05:00-03:00'>
            <Artigo id='_art4-exc1'>
              <Rotulo>Art. 4º</Rotulo>
              <Caput id='_art4-exc1_cpt'>
                <p>O Poder Executivo regulamentará esta Lei no prazo de noventa dias.</p>
              </Caput>
            </Artigo>
          </lexedit:RevisaoArticulacao>
        </lexedit:RevisoesArticulacao>

        <!-- Registro de usuários referenciados acima -->
        <lexedit:Usuarios>
          <lexedit:Usuario idUsuario='sf:fulano' nome='Fulano de Tal' sigla='FT'/>
          <lexedit:Usuario idUsuario='sf:sicrana' nome='Sicrana da Silva' sigla='SS'/>
        </lexedit:Usuarios>

      </lexedit:Metadado>
    </MetadadoProprietario>

  </Metadado>

  <ProjetoNorma>
    <Norma>
      <ParteInicial>
        <Epigrafe id="epigrafe">
          PROJETO DE LEI Nº     , DE 
        </Epigrafe>
        <Ementa id="ementa">
          Institui o Programa de Modernização da Gestão Pública
        </Ementa>
        <Preambulo id="preambulo">
          <p>O CONGRESSO NACIONAL decreta:</p>
        </Preambulo>
        <Articulacao>
          <!-- Estado atual da articulação: o art. 4º original não aparece mais -->
          <Artigo id="art1">
            <Rotulo>Art. 1º</Rotulo>
            <Caput id="art1_cpt">
              <p>Fica instituído o Programa de Modernização da Gestão Pública, de que trata esta Lei.</p>
            </Caput>
          </Artigo>
          <Artigo id="art2">
            <Rotulo>Art. 2º</Rotulo>
            <Caput id="art2_cpt">
              <p>Compete ao órgão gestor do Programa, observado o disposto no <Remissao xlink:href='art4' id='_ri13481093417'>art. 4º</Remissao> desta Lei, editar os atos complementares necessários à sua execução.</p>
            </Caput>
          </Artigo>
          <Artigo id="art3">
            <Rotulo>Art. 3º</Rotulo>
            <Caput id="art3_cpt">
              <p>Esta Lei entra em vigor na data de sua publicação.</p>
            </Caput>
          </Artigo>
        </Articulacao>
      </ParteInicial>
      <ParteFinal>
        <!-- Representação textual do fecho e das assinaturas -->
        <LocalDataFecho>
          <p>Sala das Sessões, 24 de abril de 2026.</p>
        </LocalDataFecho>
        <AssinaturaTexto>
          <p><b>Senador Davi Alcolumbre</b></p>
          <p>(UNIÃO - AP)</p>
          <p>Presidente do Senado Federal</p>
        </AssinaturaTexto>
        <AssinaturaTexto>
          <p><b>Senadora Soraya Thronicke</b></p>
          <p>(PSB - MS)</p>
        </AssinaturaTexto>
      </ParteFinal>
    </Norma>

    <Justificacao>
      <PartePrincipal>
        <!-- Mecanismo de revisão de texto rico da justificação, não aplicável à articulação -->
        <p>Esta proposição promove a <del id='_rt245245234523'>reforma</del><ins id='_rt879079079778'>modernização</ins> da gestão pública, <span id='_tc1777387565991'>nos termos do art. 1º</span>.</p>
        <!-- Nota de rodapé: fica inline no texto rico, sem entrada correspondente nos metadados -->
        <p>O detalhamento das ações do Programa consta das diretrizes anexadas a esta proposição<NotaRodape>Anexo I: <i>Diretrizes do programa</i>.</NotaRodape>.</p>
      </PartePrincipal>
    </Justificacao>
  </ProjetoNorma>
</LexML>
```
