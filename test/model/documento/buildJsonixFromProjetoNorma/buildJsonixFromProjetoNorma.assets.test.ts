import { expect } from '@open-wc/testing';
import { buildJsonixFromProjetoNorma } from '../../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from '../../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { MPV_1078_2021 } from '../../../assets/mpv_1078_2021';
import { MPV_1085_2021 } from '../../../assets/mpv_1085_2021';
import { MPV_1210_2024 } from '../../../assets/mpv_1210_2024';
import { MPV_885_2019 } from '../../../assets/mpv_885_2019';
import { MPV_905_2019 } from '../../../assets/mpv_905_2019';
import { MPV_930_2020 } from '../../../assets/mpv_930_2020';
import { PDL_343_2023 } from '../../../assets/pdl_343_2023';
import { PL_4687_2023 } from '../../../assets/pl_4687_2023';
import { Plc_142_2018 } from '../../../assets/plc_142_2018';
import { PL_5008_2023 } from '../../../assets/pl_5008_2023';
import { PLP_68_2024 } from '../../../assets/plp_68_2024';
import { PLP_197_2023 } from '../../../assets/plp_197_2023';
import { PLS_547_2018 } from '../../../assets/pls_547_2018';
import { PRS_92_2023 } from '../../../assets/prs_92_2023';
import { validarRecursivo } from '../../../../demo/components/jsonValidator';
import type { LogErro } from '../../../../demo/components/jsonValidator';
import { filtrarErrosConteudoParagrafo, filtrarErrosLinksNomeAgrupador, filtrarErrosNotaAlteracaoOmissis, filtrarErrosPreambuloVazio } from './buildJsonixHelpers';

describe('buildJsonixFromProjetoNorma - Assets Integration Tests', () => {
  const testarConversaoJsonix = (asset: any, nomeAsset: string, filtros: ((erros: LogErro[]) => LogErro[])[] = []): void => {
    // Converter de jsonix para ProjetoNorma e de volta para jsonix
    const projetoNorma = buildProjetoNormaFromJsonix(asset);
    const resultado = buildJsonixFromProjetoNorma(projetoNorma, asset.value.metadado.identificacao.urn);

    const erros: LogErro[] = [];
    validarRecursivo(erros, asset, resultado, 'raiz');

    // Aplicar filtros fornecidos
    let errosFiltrados = erros;
    for (const filtro of filtros) {
      errosFiltrados = filtro(errosFiltrados);
    }

    if (errosFiltrados.length > 0) {
      console.error(`\n=== Erros de validação encontrados para ${nomeAsset} ===`);
      errosFiltrados.forEach((erro, i) => {
        console.error(`${i + 1}. [${erro.caminho}] ${erro.mensagem}`);
      });
      console.error('=====================================\n');
    }

    expect(errosFiltrados.length).to.equal(0, `Estrutura jsonix gerada difiere do esperado para ${nomeAsset}. Verifique o console para detalhes.`);
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

  describe('MPV 905/2019', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando links em nomeAgrupador)', () => {
      testarConversaoJsonix(MPV_905_2019, 'MPV 905/2019', [filtrarErrosLinksNomeAgrupador]);
    });
  });

  describe('MPV 1085/2021', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando links em nomeAgrupador)', () => {
      testarConversaoJsonix(MPV_1085_2021, 'MPV 1085/2021', [filtrarErrosLinksNomeAgrupador]);
    });
  });

  describe('MPV 930/2020', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando elementos vazios no preâmbulo)', () => {
      testarConversaoJsonix(MPV_930_2020, 'MPV 930/2020', [filtrarErrosPreambuloVazio]);
    });
  });

  describe('MPV 1078/2021', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado', () => {
      testarConversaoJsonix(MPV_1078_2021, 'MPV 1078/2021');
    });
  });

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

  describe('PLC 142/2018', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando elementos vazios no preâmbulo)', () => {
      testarConversaoJsonix(Plc_142_2018, 'PLC 142/2018', [filtrarErrosPreambuloVazio]);
    });
  });

  describe('PL 5008/2023', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando links em nomeAgrupador e elementos vazios no preâmbulo)', () => {
      testarConversaoJsonix(PL_5008_2023, 'PL 5008/2023', [filtrarErrosLinksNomeAgrupador, filtrarErrosPreambuloVazio]);
    });
  });

  describe('PLP 68/2024', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando links em nomeAgrupador e atributos notaAlteracao em omissis)', () => {
      testarConversaoJsonix(PLP_68_2024, 'PLP 68/2024', [filtrarErrosLinksNomeAgrupador, filtrarErrosNotaAlteracaoOmissis]);
    });
  });

  describe('PLP 197/2023', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando conteúdo de parágrafos com elementos inline)', () => {
      testarConversaoJsonix(PLP_197_2023, 'PLP 197/2023', [filtrarErrosConteudoParagrafo]);
    });
  });

  describe('PLS 547/2018', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando elementos vazios no preâmbulo)', () => {
      testarConversaoJsonix(PLS_547_2018, 'PLS 547/2018', [filtrarErrosPreambuloVazio]);
    });
  });

  describe('PRS 92/2023', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado', () => {
      testarConversaoJsonix(PRS_92_2023, 'PRS 92/2023');
    });
  });
});
