import { GeneroFeminino, GeneroIndefinido, GeneroMasculino } from '../../dispositivo/genero';
import { ValidacaoDispositivo } from '../../dispositivo/validacao';
import { AlteracaoNaoPermitidaLexml } from '../alteracao/alteracao-lexml';
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
  GeneroFeminino(AlteracaoNaoPermitidaLexml(DispositivoNovo(ConteudoDispositivo(NumeracaoAlinea(HierarquiaDispositivo(TipoLexml))))))
);
export const ArtigoLexml = ValidacaoDispositivo(GeneroMasculino(DispositivoNovo(NumeracaoArtigo(HierarquiaArtigo(TipoArtigo)))));
export const CaputLexml = ValidacaoDispositivo(
  GeneroMasculino(AlteracaoNaoPermitidaLexml(DispositivoNovo(ConteudoDispositivo(NumeracaoIndisponivel(HierarquiaDispositivo(TipoLexml))))))
);
export const DispositivoGenericoLexml = ValidacaoDispositivo(
  GeneroIndefinido(AlteracaoNaoPermitidaLexml(DispositivoNovo(ConteudoDispositivo(NumeracaoGenerico(HierarquiaDispositivo(TipoLexml))))))
);
export const IncisoLexml = ValidacaoDispositivo(
  GeneroMasculino(AlteracaoNaoPermitidaLexml(DispositivoNovo(ConteudoDispositivo(NumeracaoInciso(HierarquiaDispositivo(TipoLexml))))))
);
export const ItemLexml = ValidacaoDispositivo(GeneroMasculino(AlteracaoNaoPermitidaLexml(DispositivoNovo(ConteudoDispositivo(NumeracaoItem(HierarquiaDispositivo(TipoLexml)))))));
export const ParagrafoLexml = ValidacaoDispositivo(
  GeneroMasculino(AlteracaoNaoPermitidaLexml(DispositivoNovo(ConteudoDispositivo(NumeracaoParagrafo(HierarquiaDispositivo(TipoLexml))))))
);
export const ArticulacaoLexml = ValidacaoDispositivo(
  GeneroIndefinido(AlteracaoNaoPermitidaLexml(DispositivoNovo(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoArticulacao))))))
);
export const CapituloLexml = ValidacaoDispositivo(
  GeneroMasculino(AlteracaoNaoPermitidaLexml(DispositivoNovo(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml))))))
);
export const DispositivoAgrupadorGenericoLexml = ValidacaoDispositivo(
  GeneroIndefinido(AlteracaoNaoPermitidaLexml(DispositivoNovo(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml))))))
);
export const LivroLexml = ValidacaoDispositivo(
  GeneroMasculino(AlteracaoNaoPermitidaLexml(DispositivoNovo(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml))))))
);
export const ParteLexml = ValidacaoDispositivo(
  GeneroFeminino(AlteracaoNaoPermitidaLexml(DispositivoNovo(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml))))))
);
export const SubsecaoLexml = ValidacaoDispositivo(
  GeneroFeminino(AlteracaoNaoPermitidaLexml(DispositivoNovo(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml))))))
);
export const SecaoLexml = ValidacaoDispositivo(
  GeneroFeminino(AlteracaoNaoPermitidaLexml(DispositivoNovo(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml))))))
);
export const TituloLexml = ValidacaoDispositivo(
  GeneroMasculino(AlteracaoNaoPermitidaLexml(DispositivoNovo(ConteudoDispositivo(NumeracaoAgrupador(HierarquiaAgrupador(TipoLexml))))))
);

export const OmissisLexml = GeneroMasculino(DispositivoNovo(AlteracaoNaoPermitidaLexml(ConteudoOmissis(NumeracaoIndisponivel(HierarquiaDispositivo(TipoLexml))))));
