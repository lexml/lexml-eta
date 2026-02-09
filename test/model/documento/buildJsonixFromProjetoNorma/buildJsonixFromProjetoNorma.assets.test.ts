import { expect } from '@open-wc/testing';
import { buildJsonixFromProjetoNorma } from '../../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from '../../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { MPV_1210_2024 } from '../../../assets/mpv_1210_2024';
import { PDL_343_2023 } from '../../../assets/pdl_343_2023';
import { validarRecursivo } from '../../../../demo/components/jsonValidator';
import type { LogErro } from '../../../../demo/components/jsonValidator';

describe('buildJsonixFromProjetoNorma - Assets Integration Tests', () => {
  describe('MPV 1210/2024', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado', () => {
      // Converter de jsonix para ProjetoNorma e de volta para jsonix
      const projetoNorma = buildProjetoNormaFromJsonix(MPV_1210_2024);
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, MPV_1210_2024.value.metadado.identificacao.urn);

      // Validar recursivamente
      const erros: LogErro[] = [];
      validarRecursivo(erros, MPV_1210_2024, resultado, 'raiz');

      // Exibir erros de forma detalhada se houver
      if (erros.length > 0) {
        console.error('\n=== Erros de validação encontrados ===');
        erros.forEach((erro, i) => {
          console.error(`${i + 1}. [${erro.caminho}] ${erro.mensagem}`);
        });
        console.error('=====================================\n');
      }

      expect(erros.length).to.equal(0, `Estrutura jsonix gerada difere do esperado. Verifique o console para detalhes.`);
    });
  });

  describe('PDL 343/2023', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado', () => {
      // Converter de jsonix para ProjetoNorma e de volta para jsonix
      const projetoNorma = buildProjetoNormaFromJsonix(PDL_343_2023);
      const resultado = buildJsonixFromProjetoNorma(projetoNorma, PDL_343_2023.value.metadado.identificacao.urn);

      // Validar recursivamente
      const erros: LogErro[] = [];
      validarRecursivo(erros, PDL_343_2023, resultado, 'raiz');

      // Exibir erros de forma detalhada se houver
      if (erros.length > 0) {
        console.error('\n=== Erros de validação encontrados ===');
        erros.forEach((erro, i) => {
          console.error(`${i + 1}. [${erro.caminho}] ${erro.mensagem}`);
        });
        console.error('=====================================\n');
      }

      expect(erros.length).to.equal(0, `Estrutura jsonix gerada difere do esperado. Verifique o console para detalhes.`);
    });
  });
});
