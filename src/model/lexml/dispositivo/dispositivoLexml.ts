import { GeneroFeminino, GeneroIndefinido, GeneroMasculino } from '../../dispositivo/genero';
import { ValidacaoDispositivo } from '../../dispositivo/validacao';
import { BlocoAlteracaoNaoPermitido, BlocoAlteracaoPermitido } from '../alteracao/blocoAlteracaoLexml';
import { ConteudoDispositivo } from '../conteudo/conteudoDispositivo';
import { ConteudoOmissis } from '../conteudo/conteudoOmissis';
import { HierarquiaAgrupador } from '../hierarquia/hierarquiaAgrupador';
import { HierarquiaArtigo } from '../hierarquia/hierarquiaArtigo';
import { HierarquiaDispositivo } from '../hierarquia/hierarquiaDispositivo';
import { NumeracaoAgrupador } from '../numeracao/numeracaoAgrupador';
import { NumeracaoAlinea } from '../numeracao/numeracaoAlinea';
import { NumeracaoArtigo } from '../numeracao/numeracaoArtigo';
import { NumeracaoGenerico } from '../numeracao/numeracaoGenerico';
import { NumeracaoInciso } from '../numeracao/numeracaoInciso';
import { NumeracaoIndisponivel } from '../numeracao/numeracaoIndisponivel';
import { NumeracaoItem } from '../numeracao/numeracaoItem';
import { NumeracaoParagrafo } from '../numeracao/numeracaoParagrafo';
import { DispositivoNovo } from '../situacao/dispositivoNovo';
import { TipoArticulacao } from '../tipo/tipoArticulacao';
import { TipoArtigo } from '../tipo/tipoArtigo';
import { TipoLexml } from '../tipo/tipoLexml';

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
