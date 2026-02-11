import { expect } from '@open-wc/testing';
import { buildJsonixFromProjetoNorma } from '../../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from '../../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { MPV_1210_2024 } from '../../../assets/mpv_1210_2024';
import { MPV_885_2019 } from '../../../assets/mpv_885_2019';
// import { MPV_905_2019 } from '../../../assets/mpv_905_2019'; // Desabilitado: formato inconsistente
import { PDL_343_2023 } from '../../../assets/pdl_343_2023';
import { PL_4687_2023 } from '../../../assets/pl_4687_2023';
import { validarRecursivo } from '../../../../demo/components/jsonValidator';
import type { LogErro } from '../../../../demo/components/jsonValidator';

describe('buildJsonixFromProjetoNorma - Assets Integration Tests', () => {
  const testarConversaoJsonix = (asset: any, nomeAsset: string): void => {
    // Converter de jsonix para ProjetoNorma e de volta para jsonix
    const projetoNorma = buildProjetoNormaFromJsonix(asset);
    const resultado = buildJsonixFromProjetoNorma(projetoNorma, asset.value.metadado.identificacao.urn);

    // Validar recursivamente
    const erros: LogErro[] = [];
    validarRecursivo(erros, asset, resultado, 'raiz');

    // Exibir erros de forma detalhada se houver
    if (erros.length > 0) {
      console.error(`\n=== Erros de validação encontrados para ${nomeAsset} ===`);
      erros.forEach((erro, i) => {
        console.error(`${i + 1}. [${erro.caminho}] ${erro.mensagem}`);
      });
      console.error('=====================================\n');
    }

    expect(erros.length).to.equal(0, `Estrutura jsonix gerada difere do esperado para ${nomeAsset}. Verifique o console para detalhes.`);
  };

  describe('MPV 1210/2024', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado', () => {
      testarConversaoJsonix(MPV_1210_2024, 'MPV 1210/2024');
    });
  });

  describe('MPV 885/2019', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado', () => {
      testarConversaoJsonix(MPV_885_2019, 'MPV 885/2019');
    });
  });

  // describe('MPV 905/2019', () => {
  //   it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado', () => {
  //     testarConversaoJsonix(MPV_905_2019, 'MPV 905/2019');
  //   });
  // });

  describe('PDL 343/2023', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado', () => {
      testarConversaoJsonix(PDL_343_2023, 'PDL 343/2023');
    });
  });

  describe('PL 4687/2023', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado', () => {
      testarConversaoJsonix(PL_4687_2023, 'PL 4687/2023');
    });
  });
});
