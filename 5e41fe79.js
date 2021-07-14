import{a as t,b as e,g as o,k as s,r as c,f as n,i,j as r,A as a,u as h,t as u,h as p}from"./e94213f9.js";import{c as l}from"./953d27ae.js";import{D as d,P as m}from"./dfd77799.js";import{P as f}from"./32fa8a71.js";let g,B=t=>t;class y extends d{get choiceButtons(){return this[t].choiceButtons}get choiceButtonPartType(){return this[t].choiceButtonPartType}set choiceButtonPartType(t){this[e]({choiceButtonPartType:t})}get choices(){return this[t].choices}set choices(t){this[e]({choices:t})}get[o](){return Object.assign(super[o],{choiceButtonPartType:"button",choiceButtons:[],choices:["OK"]})}[s](t){let e=!1;const o=1===t.key.length&&t.key.toLowerCase();if(o){const t=this.choices.find((t=>t[0].toLowerCase()===o));t&&(this.close({choice:t}),e=!0)}return e||super[s]&&super[s](t)||!1}[c](e){super[c](e),this[n]&&this[i].choiceButtonContainer.addEventListener("click",(async t=>{const e=t.target;if(e instanceof HTMLElement){const t=e.textContent;this[r]=!0,await this.close({choice:t}),this[r]=!1}})),e.choiceButtons&&a(this[i].choiceButtonContainer,this[t].choiceButtons)}[h](t,e){const o=super[h](t,e);if(e.choiceButtonPartType||e.choices){const e=t.choices.map((e=>{const o=l(t.choiceButtonPartType);return"part"in o&&(o.part="choice-button"),o.textContent=e,o}));Object.freeze(e),Object.assign(o,{choiceButtons:e})}return o}get[u](){const t=super[u],e=t.content.querySelector("slot:not([name])");return e&&e.replaceWith(p.html(g||(g=B`
        <div id="alertDialogContent">
          <slot></slot>
          <div id="choiceButtonContainer" part="choice-button-container"></div>
        </div>
      `))),t}}let b,P=t=>t;class j extends(m(y)){get[o](){return Object.assign(super[o],{choiceButtonPartType:f})}get[u](){const t=super[u];return t.content.append(p.html(b||(b=P`
        <style>
          [part~="frame"] {
            padding: 1em;
          }

          [part~="choice-button-container"] {
            margin-top: 1em;
          }

          [part~="choice-button"]:not(:first-child) {
            margin-left: 0.5em;
          }
        </style>
      `))),t}}customElements.define("elix-alert-dialog",class extends j{});
