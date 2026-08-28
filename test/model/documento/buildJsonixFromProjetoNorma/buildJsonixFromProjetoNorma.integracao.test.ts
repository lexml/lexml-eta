import { expect } from '@open-wc/testing';
import { buildJsonixFromProjetoNorma } from '../../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from '../../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { MPV_1078_2021 } from '../../../assets/mpv_1078_2021';
import { MPV_1085_2021 } from '../../../assets/mpv_1085_2021';
import { MPV_1100_2022 } from '../../../assets/mpv_1100_2022';
import { MPV_1160_2023 } from '../../../assets/mpv_1160_2023';
import { MPV_1170_2023 } from '../../../assets/mpv_1170_2023';
import { MPV_1210_2024 } from '../../../assets/mpv_1210_2024';
import { MPV_1232_2024 } from '../../../assets/mpv_1232_2024';
import { MPV_885_2019 } from '../../../assets/mpv_885_2019';
import { MPV_905_2019 } from '../../../assets/mpv_905_2019';
import { MPV_930_2020 } from '../../../assets/mpv_930_2020';
import { PDL_343_2023 } from '../../../assets/pdl_343_2023';
import { PEC_48_2023 } from '../../../assets/pec_48_2023';
import { PL_4687_2023 } from '../../../assets/pl_4687_2023';
import { Plc_142_2018 } from '../../../assets/plc_142_2018';
import { PL_5008_2023 } from '../../../assets/pl_5008_2023';
import { PLP_68_2024 } from '../../../assets/plp_68_2024';
import { PLP_197_2023 } from '../../../assets/plp_197_2023';
import { PLS_547_2018 } from '../../../assets/pls_547_2018';
import { PRS_92_2023 } from '../../../assets/prs_92_2023';
import { validarRecursivo } from '../../../../demo/components/jsonValidator';
import type { LogErro } from '../../../../demo/components/jsonValidator';
import {
  filtrarErrosAspasCurvas,
  filtrarErrosConteudoParagrafo,
  filtrarErrosLinksNomeAgrupador,
  filtrarErrosNotaAlteracaoOmissis,
  filtrarErrosPreambuloVazio,
  filtrarErrosSpanParaRemissao,
} from './buildJsonixHelpers';

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
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando conversão de span para Remissao e aspas curvas)', () => {
      testarConversaoJsonix(MPV_885_2019, 'MPV 885/2019', [filtrarErrosSpanParaRemissao, filtrarErrosAspasCurvas]);
    });
  });

  describe('MPV 905/2019', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando links em nomeAgrupador, conversão de span para Remissao e aspas curvas)', () => {
      testarConversaoJsonix(MPV_905_2019, 'MPV 905/2019', [filtrarErrosLinksNomeAgrupador, filtrarErrosSpanParaRemissao, filtrarErrosAspasCurvas]);
    });
  });

  describe('MPV 1085/2021', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando links em nomeAgrupador e conversão de span para Remissao)', () => {
      testarConversaoJsonix(MPV_1085_2021, 'MPV 1085/2021', [filtrarErrosLinksNomeAgrupador, filtrarErrosSpanParaRemissao]);
    });
  });

  describe('MPV 930/2020', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando elementos vazios no preâmbulo)', () => {
      testarConversaoJsonix(MPV_930_2020, 'MPV 930/2020', [filtrarErrosPreambuloVazio]);
    });
  });

  describe('MPV 1078/2021', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando conversão de span para Remissao)', () => {
      testarConversaoJsonix(MPV_1078_2021, 'MPV 1078/2021', [filtrarErrosSpanParaRemissao]);
    });
  });

  describe('MPV 1100/2022', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando elementos vazios no preâmbulo e conversão de span para Remissao)', () => {
      testarConversaoJsonix(MPV_1100_2022, 'MPV 1100/2022', [filtrarErrosPreambuloVazio, filtrarErrosSpanParaRemissao]);
    });
  });

  describe('MPV 1160/2023', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando conversão de span para Remissao)', () => {
      testarConversaoJsonix(MPV_1160_2023, 'MPV 1160/2023', [filtrarErrosSpanParaRemissao]);
    });
  });

  describe('MPV 1170/2023', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando elementos vazios no preâmbulo e conteúdo de parágrafos)', () => {
      testarConversaoJsonix(MPV_1170_2023, 'MPV 1170/2023', [filtrarErrosPreambuloVazio, filtrarErrosConteudoParagrafo]);
    });
  });

  describe('MPV 1232/2024', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando conteúdo de parágrafos com elementos inline e conversão de span para Remissao)', () => {
      testarConversaoJsonix(MPV_1232_2024, 'MPV 1232/2024', [filtrarErrosConteudoParagrafo, filtrarErrosSpanParaRemissao]);
    });
  });

  describe('PDL 343/2023', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando conversão de span para Remissao)', () => {
      testarConversaoJsonix(PDL_343_2023, 'PDL 343/2023', [filtrarErrosSpanParaRemissao]);
    });
  });

  describe('PL 4687/2023', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando conversão de span para Remissao)', () => {
      testarConversaoJsonix(PL_4687_2023, 'PL 4687/2023', [filtrarErrosSpanParaRemissao]);
    });
  });

  describe('PLC 142/2018', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando elementos vazios no preâmbulo e conversão de span para Remissao)', () => {
      testarConversaoJsonix(Plc_142_2018, 'PLC 142/2018', [filtrarErrosPreambuloVazio, filtrarErrosSpanParaRemissao]);
    });
  });

  describe('PL 5008/2023', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando links em nomeAgrupador, elementos vazios no preâmbulo e conversão de span para Remissao)', () => {
      testarConversaoJsonix(PL_5008_2023, 'PL 5008/2023', [filtrarErrosLinksNomeAgrupador, filtrarErrosPreambuloVazio, filtrarErrosSpanParaRemissao]);
    });
  });

  describe('PLP 68/2024', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando links em nomeAgrupador, atributos notaAlteracao em omissis e conversão de span para Remissao)', () => {
      testarConversaoJsonix(PLP_68_2024, 'PLP 68/2024', [filtrarErrosLinksNomeAgrupador, filtrarErrosNotaAlteracaoOmissis, filtrarErrosSpanParaRemissao]);
    });
  });

  describe('PLP 197/2023', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando conteúdo de parágrafos com elementos inline e conversão de span para Remissao)', () => {
      testarConversaoJsonix(PLP_197_2023, 'PLP 197/2023', [filtrarErrosConteudoParagrafo, filtrarErrosSpanParaRemissao]);
    });
  });

  describe('PLS 547/2018', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando elementos vazios no preâmbulo e aspas curvas)', () => {
      testarConversaoJsonix(PLS_547_2018, 'PLS 547/2018', [filtrarErrosPreambuloVazio, filtrarErrosAspasCurvas]);
    });
  });

  describe('PRS 92/2023', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando conversão de span para Remissao)', () => {
      testarConversaoJsonix(PRS_92_2023, 'PRS 92/2023', [filtrarErrosSpanParaRemissao]);
    });
  });

  describe('PEC_48_2023', () => {
    it('Deveria gerar estrutura jsonix idêntica ao arquivo JSON esperado (ignorando elementos vazios no preâmbulo e conversão de span para Remissao)', () => {
      testarConversaoJsonix(PEC_48_2023, 'PEC_48_2023', [filtrarErrosPreambuloVazio, filtrarErrosSpanParaRemissao]);
    });
  });
});
