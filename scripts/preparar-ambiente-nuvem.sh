#!/usr/bin/env bash
# Prepara o ambiente de uma sessão do Claude na nuvem para trabalhar no lexml-eta.
# Idempotente: pode rodar de novo a qualquer momento. Cole este arquivo (ou chame-o) no
# "script de preparo" do ambiente em claude.ai/code.
#
# Variáveis opcionais:
#   INSTALAR_NAVEGADORES=1  baixa o Chromium do Playwright e o binário do Cypress (precisa de rede
#                           para cdn.playwright.dev e download.cypress.io); sem isso, só rodam
#                           test:collab, tsc e eslint.
#   VERSAO_OPENSPEC=latest  versão do @fission-ai/openspec a instalar.
set -euo pipefail

NODE_MINIMO=20
VERSAO_OPENSPEC="${VERSAO_OPENSPEC:-latest}"

log() { printf '\n==> %s\n' "$*"; }

cd "$(git rev-parse --show-toplevel)"

log "Node $(node --version) / npm $(npm --version)"
major="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$major" -lt "$NODE_MINIMO" ]; then
  echo "Node $NODE_MINIMO ou superior é necessário (o projeto é validado no Node 22)." >&2
  exit 1
fi

log "Instalando dependências do projeto"
# Sem os binários dos navegadores por padrão: são pesados e nem toda sessão precisa deles.
if [ "${INSTALAR_NAVEGADORES:-0}" != "1" ]; then
  export CYPRESS_INSTALL_BINARY=0
  export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
fi
npm ci

log "Instalando o CLI do OpenSpec (@fission-ai/openspec@${VERSAO_OPENSPEC})"
# Atenção ao escopo: existe um pacote "openspec" sem escopo, de outro autor, sem relação com o projeto.
if ! command -v openspec >/dev/null 2>&1; then
  npm install -g "@fission-ai/openspec@${VERSAO_OPENSPEC}"
fi
openspec --version

log "Gerando a integração do OpenSpec com o Claude Code (.claude/, ignorado pelo git)"
# O init detecta o openspec/config.yaml existente e só recria os arquivos em .claude/.
openspec init --tools claude --language pt-BR

if [ "${INSTALAR_NAVEGADORES:-0}" = "1" ]; then
  log "Instalando o Chromium do Playwright (E2E colaborativo e wtr)"
  npx playwright install --with-deps chromium

  log "Instalando o binário do Cypress (E2E single-user)"
  npx cypress install
fi

log "Compilando para conferir o ambiente"
npx tsc --noEmit -p tsconfig.json

log "Rodando o harness da colaboração (Node puro, sem navegador)"
npm run test:collab

log "Ambiente pronto"
openspec list --json
