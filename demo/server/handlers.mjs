// Backend simulado da demo: handlers puros (url → { status, tipo, corpo }), sem dependência do servidor HTTP.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PREFIXO = '/demo-api/';

const pastaServidor = path.dirname(fileURLToPath(import.meta.url));
const pastaDocs = path.resolve(pastaServidor, '../doc');

// Proposição sem texto estruturado: existe na verificação, mas o texto devolve 404 (cobre o alerta "texto indisponível").
const PROPOSICAO_SEM_TEXTO = { sigla: 'PL', numero: '3', ano: '2023', arquivo: null, ementa: 'Proposição de teste sem texto estruturado disponível para edição.' };

// PLS existe como lei ordinária e como complementar: a verificação informa `complementar` (omitido = false).
const PROPOSICOES_PLS = [
  { sigla: 'PLS', numero: '7', ano: '2015', arquivo: null, complementar: true, ementa: 'Projeto de Lei Complementar do Senado de teste, sem texto estruturado disponível.' },
  { sigla: 'PLS', numero: '8', ano: '2015', arquivo: null, ementa: 'Projeto de Lei do Senado de teste, sem texto estruturado disponível.' },
];

const lerJson = arquivo => JSON.parse(fs.readFileSync(path.join(pastaServidor, 'dados', arquivo), 'utf8'));

const json = (status, objeto) => ({ status, tipo: 'application/json', corpo: JSON.stringify(objeto) });
const naoEncontrado = () => ({ status: 404, tipo: 'application/json', corpo: JSON.stringify({ erro: 'Não encontrado' }) });

const texto = (status, mensagem) => ({ status, tipo: 'text/plain; charset=utf-8', corpo: mensagem });

const TIPO_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// Conversão simulada: decide só pelo Content-Type; o XML devolve um documento qualquer da demo, sem relação com o enviado.
const tratarImportacao = contentType => {
  const tipo = String(contentType ?? '')
    .split(';')[0]
    .trim()
    .toLowerCase();
  if (tipo === 'application/xml' || tipo === 'text/xml') {
    const { arquivo } = lerJson('proposicoes.json').find(p => p.arquivo);
    return { status: 200, tipo: 'application/json', corpo: fs.readFileSync(path.join(pastaDocs, arquivo), 'utf8') };
  }
  if (tipo === 'application/pdf') return texto(500, 'Falha interna.');
  if (tipo === TIPO_DOCX || tipo === 'text/plain') return texto(400, 'Conversão de DOCX ou TXT não implementada.');
  return texto(400, 'Tipo de arquivo não suportado.');
};

const semZeros = valor => String(valor).replace(/^0+(?=\d)/, '');

const buscarProposicao = (sigla, numero, ano) => {
  const chave = [sigla.toUpperCase(), semZeros(numero), ano].join('/');
  return [...lerJson('proposicoes.json'), PROPOSICAO_SEM_TEXTO, ...PROPOSICOES_PLS].find(p => [p.sigla, p.numero, p.ano].join('/') === chave);
};

/** @returns {{status:number, tipo:string, corpo:string}|undefined} undefined quando a URL não é da demo. */
export const tratarRequisicaoDemo = (url, metodo = 'GET', contentType = '') => {
  const { pathname } = new URL(url, 'http://localhost');
  if (!pathname.startsWith(PREFIXO)) return undefined;
  const partes = pathname.slice(PREFIXO.length).split('/').map(decodeURIComponent);

  if (partes[0] === 'importacao' && partes.length === 1 && metodo.toUpperCase() === 'POST') return tratarImportacao(contentType);

  if (partes[0] === 'comissoes' && partes.length === 2) {
    return json(
      200,
      lerJson('comissoes.json').filter(c => c.siglaCasaLegislativa === partes[1].toUpperCase())
    );
  }

  if (partes[0] === 'proposicoes' && (partes.length === 4 || (partes.length === 5 && partes[4] === 'texto'))) {
    const proposicao = buscarProposicao(partes[1], partes[2], partes[3]);
    if (!proposicao) return naoEncontrado();
    if (partes.length === 4)
      return json(200, { ementa: proposicao.ementa, textoEstruturadoDisponivel: !!proposicao.arquivo, ...(proposicao.complementar && { complementar: true }) });
    if (!proposicao.arquivo) return naoEncontrado();
    return { status: 200, tipo: 'application/json', corpo: fs.readFileSync(path.join(pastaDocs, proposicao.arquivo), 'utf8') };
  }

  return naoEncontrado();
};
