import { html } from 'lit';

export const notaRodapeCss = html`
  <style>
    .nota-rodape {
      position: relative;
      cursor: pointer;
      font-size: 0.8em;
      line-height: 1;
      vertical-align: super;
      z-index: 1;
      margin-left: 0.1em;
    }

    .nota-rodape::after {
      content: attr(data-nota);
      color: transparent;
      position: absolute;
      bottom: 50%;
      left: 50%;
      transform: translate(-50%, 50%);
      opacity: 0;
      background-color: var(--sl-color-red-300);
      color: black;
      width: 20px;
      height: 20px;
      line-height: 20px;
      text-align: center;
      border-radius: 50%;
      font-size: 0.7em;
      text-indent: 0;
      z-index: -1;
      transition: transform opacity 0.3s ease;
    }

    .nota-rodape:hover::after {
      animation: pulseAnimation 1s infinite;
      opacity: 0.5;
    }

    @keyframes pulseAnimation {
      0% {
        transform: translate(-50%, 50%) scale(0.8);
        opacity: 0;
      }
      50% {
        transform: translate(-50%, 50%) scale(1.2);
        opacity: 0.5;
      }
      100% {
        transform: translate(-50%, 50%) scale(1.6);
        opacity: 0;
      }
    }

    .nota-rodape.pulse::after {
      animation: pulseAnimation 1s infinite;
    }
  </style>
`;
