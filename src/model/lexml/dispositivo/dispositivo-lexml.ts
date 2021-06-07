import { GeneroFeminino, GeneroIndefinido, GeneroMasculino } from '../../dispositivo/genero';
import { ValidacaoDispositivo } from '../../dispositivo/validacao';
import { BlocoAlteracaoNaoPermitido, BlocoAlteracaoPermitido } from '../alteracao/bloco-alteracao-lexml';
import { ConteudoDispositivo } from '../conteudo/conteudo-dispositivo';
import { ConteudoOmissis } from '../conteudo/conteudo-omissis';
import { HierarquiaAgrupador } from '../hierarquia/hierarquia-agrupador';
import { HierarquiaArtigo } from '../hierarquia/hierarquia-artigo';
import { HierarquiaDispositivo } from '../hierarquia/hierarquia-dispositivo';
import { NumeracaoAgrupador } from '../numeracao/numeracao-agrupador';
import { NumeracaoAlinea } from '../numeracao/numeracao-alinea';
import { NumeracaoArtigo } from '../numeracao/numeracao-artigo';
import { NumeracaoGenerico } from '../numeracao/numeracao-generico';
import { NumeracaoInciso } from '../numeracao/numeracao-inciso';
import { NumeracaoIndisponivel } from '../numeracao/numeracao-indisponivel';
import { NumeracaoItem } from '../numeracao/numeracao-item';
import { NumeracaoParagrafo } from '../numeracao/numeracao-paragrafo';
import { DispositivoNovo } from '../situacao/dispositivo-novo';
import { TipoArticulacao } from '../tipo/tipo-articulacao';
import { TipoArtigo } from '../tipo/tipo-artigo';
import { TipoLexml } from '../tipo/tipo-lexml';

export const AlineaLexml = ValidacaoDispositivo(
  GeneroFeminino(BlocoAlteracaoNaoPermitido(DispositivoNovo(ConteudoDispositivo(NumeracaoAlinea(HierarquiaDispositivo(TipoLexml))))))
);
export const ArtigoLexml = ValidacaoDispositivo(GeneroMasculino(BlocoAlteracaoPermitido(DispositivoNovo(NumeracaoArtigo(HierarquiaArtigo(TipoArtigo))))));
export const CaputLexml = ValidacaoDispositivo(
  GeneroMasculino(BlocoAlteracaoNaoPermitido(DispositivoNovo(ConteudoDispositivo(NumeracaoIndisponivel(HierarquiaDispositivo(TipoLexml))))))
);
export const DispositivoGenericoLexml = ValidacaoDispositivo(
  GeneroIndefinido(BlocoAlteracaoNaoPermitido(DispositivoNovo(ConteudoDispositivo(NumeracaoGenerico(HierarquiaDispositivo(TipoLexml))))))
);
export const IncisoLexml = ValidacaoDispositivo(
  GeneroMasculino(BlocoAlteracaoNaoPermitido(DispositivoNovo(ConteudoDispositivo(NumeracaoInciso(HierarquiaDispositivo(TipoLexml))))))
);
export const ItemLexml = ValidacaoDispositivo(GeneroMasculino(BlocoAlteracaoNaoPermitido(DispositivoNovo(ConteudoDispositivo(NumeracaoItem(HierarquiaDispositivo(TipoLexml)))))));
export const ParagrafoLexml = ValidacaoDispositivo(
  GeneroMasculino(BlocoAlteracaoNaoPermitido(DispositivoNovo(ConteudoDispositivo(NumeracaoParagrafo(HierarquiaDispositivo(TipoLexml))))))
);
export const ArticulacaoLexml = ValidacaoDispositivo(
  GeneroIndefinido(BlocoAlteracaoNaoPermitido(DispositivoNovo(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoArticulacao))))))
);
export const CapituloLexml = ValidacaoDispositivo(
  GeneroMasculino(BlocoAlteracaoNaoPermitido(DispositivoNovo(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml))))))
);
export const DispositivoAgrupadorGenericoLexml = ValidacaoDispositivo(
  GeneroIndefinido(BlocoAlteracaoNaoPermitido(DispositivoNovo(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml))))))
);
export const LivroLexml = ValidacaoDispositivo(
  GeneroMasculino(BlocoAlteracaoNaoPermitido(DispositivoNovo(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml))))))
);
export const ParteLexml = ValidacaoDispositivo(
  GeneroFeminino(BlocoAlteracaoNaoPermitido(DispositivoNovo(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml))))))
);
export const SubsecaoLexml = ValidacaoDispositivo(
  GeneroFeminino(BlocoAlteracaoNaoPermitido(DispositivoNovo(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml))))))
);
export const SecaoLexml = ValidacaoDispositivo(
  GeneroFeminino(BlocoAlteracaoNaoPermitido(DispositivoNovo(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml))))))
);
export const TituloLexml = ValidacaoDispositivo(
  GeneroMasculino(BlocoAlteracaoNaoPermitido(DispositivoNovo(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml))))))
);

export const OmissisLexml = GeneroMasculino(DispositivoNovo(BlocoAlteracaoNaoPermitido(ConteudoOmissis(NumeracaoIndisponivel(HierarquiaDispositivo(TipoLexml))))));
