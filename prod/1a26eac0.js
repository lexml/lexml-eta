import{g as t,k as e,r as s,a as n,n as o,b as i,w as c,s as r,v as a,i as u,f as l,h,t as d,j as p,A as m,u as f}from"./e94213f9.js";import{B as y,K as g,O as v,c as b,P as w}from"./953d27ae.js";import{P as B}from"./32fa8a71.js";const x=Symbol("previousBodyStyleOverflow"),C=Symbol("previousDocumentMarginRight");let E,P=t=>t;const T=Symbol("wrap"),j=Symbol("wrappingFocus");function O(t){return class extends t{[e](t){const s=c(this[r]);if(s){const e=document.activeElement&&(document.activeElement===s||document.activeElement.contains(s)),n=this[r].activeElement,o=n&&(n===s||a(n,s));(e||o)&&"Tab"===t.key&&t.shiftKey&&(this[j]=!0,this[u].focusCatcher.focus(),this[j]=!1)}return super[e]&&super[e](t)||!1}[s](t){super[s]&&super[s](t),this[l]&&this[u].focusCatcher.addEventListener("focus",(()=>{if(!this[j]){const t=c(this[r]);t&&t.focus()}}))}[T](t){const e=h.html(E||(E=P`
        <style>
          #focusCapture {
            display: flex;
            height: 100%;
            overflow: hidden;
            width: 100%;
          }

          #focusCaptureContainer {
            align-items: center;
            display: flex;
            flex: 1;
            flex-direction: column;
            justify-content: center;
            position: relative;
          }
        </style>
        <div id="focusCapture">
          <div id="focusCaptureContainer"></div>
          <div id="focusCatcher" tabindex="0"></div>
        </div>
      `)),s=e.getElementById("focusCaptureContainer");s&&(t.replaceWith(e),s.append(t))}}}O.wrap=T;class k extends y{constructor(){super(),"PointerEvent"in window||this.addEventListener("touchmove",(t=>{1===t.touches.length&&t.preventDefault()}))}}let S,L=t=>t;const R=function(c){return class extends c{get[t](){return Object.assign(super[t]||{},{role:"dialog"})}[e](t){let s=!1;switch(t.key){case"Escape":this.close({canceled:"Escape"}),s=!0}return s||super[e]&&super[e](t)||!1}[s](t){if(super[s]&&super[s](t),t.opened)if(this[n].opened&&document.documentElement){const t=document.documentElement.clientWidth,e=window.innerWidth-t;this[x]=document.body.style.overflow,this[C]=e>0?document.documentElement.style.marginRight:null,document.body.style.overflow="hidden",e>0&&(document.documentElement.style.marginRight=`${e}px`)}else null!=this[x]&&(document.body.style.overflow=this[x],this[x]=null),null!=this[C]&&(document.documentElement.style.marginRight=this[C],this[C]=null);if(t.role){const{role:t}=this[n];this.setAttribute("role",t)}}get role(){return super.role}set role(t){super.role=t,this[o]||this[i]({role:t})}}}(O(g(v)));class W extends R{get[t](){return Object.assign(super[t],{backdropPartType:k,tabIndex:-1})}get[d](){const t=super[d],e=t.content.querySelector("#frame");return this[O.wrap](e),t.content.append(h.html(S||(S=L`
        <style>
          :host {
            height: 100%;
            left: 0;
            pointer-events: initial;
            top: 0;
            width: 100%;
          }
        </style>
      `))),t}}let D,K=t=>t;class q extends W{get choiceButtons(){return this[n].choiceButtons}get choiceButtonPartType(){return this[n].choiceButtonPartType}set choiceButtonPartType(t){this[i]({choiceButtonPartType:t})}get choices(){return this[n].choices}set choices(t){this[i]({choices:t})}get[t](){return Object.assign(super[t],{choiceButtonPartType:"button",choiceButtons:[],choices:["OK"]})}[e](t){let s=!1;const n=1===t.key.length&&t.key.toLowerCase();if(n){const t=this.choices.find((t=>t[0].toLowerCase()===n));t&&(this.close({choice:t}),s=!0)}return s||super[e]&&super[e](t)||!1}[s](t){super[s](t),this[l]&&this[u].choiceButtonContainer.addEventListener("click",(async t=>{const e=t.target;if(e instanceof HTMLElement){const t=e.textContent;this[p]=!0,await this.close({choice:t}),this[p]=!1}})),t.choiceButtons&&m(this[u].choiceButtonContainer,this[n].choiceButtons)}[f](t,e){const s=super[f](t,e);if(e.choiceButtonPartType||e.choices){const e=t.choices.map((e=>{const s=b(t.choiceButtonPartType);return"part"in s&&(s.part="choice-button"),s.textContent=e,s}));Object.freeze(e),Object.assign(s,{choiceButtons:e})}return s}get[d](){const t=super[d],e=t.content.querySelector("slot:not([name])");return e&&e.replaceWith(h.html(D||(D=K`
        <div id="alertDialogContent">
          <slot></slot>
          <div id="choiceButtonContainer" part="choice-button-container"></div>
        </div>
      `))),t}}let A,I=t=>t;class M extends k{get[d](){const t=super[d];return t.content.append(h.html(A||(A=I`
        <style>
          :host {
            background: rgba(0, 0, 0, 0.2);
          }
        </style>
      `))),t}}let z,F=t=>t;class H extends(function(e){return class extends e{get[t](){return Object.assign(super[t]||{},{backdropPartType:M,framePartType:w})}}}(q)){get[t](){return Object.assign(super[t],{choiceButtonPartType:B})}get[d](){const t=super[d];return t.content.append(h.html(z||(z=F`
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
      `))),t}}customElements.define("elix-alert-dialog",class extends H{});
