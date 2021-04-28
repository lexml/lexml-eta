import{g as e,r as t,f as s,a as i,B as n,b as r,j as o,C as l,c as a,u as c,v as u,t as d,o as b,h,m as f,D as p,w as g,s as m,E as v,l as y,i as A,q as x,F as L,R as w,G as E}from"./e94213f9.js";const k=document.createElement("div");k.attachShadow({mode:"open",delegatesFocus:!0});const j=k.shadowRoot.delegatesFocus;function O(e){if("selectedText"in e)return e.selectedText;if("value"in e&&"options"in e){const t=e.value,s=e.options.find((e=>e.value===t));return s?s.innerText:""}return"value"in e?e.value:e.innerText}function C(e,t){const{ariaLabel:s,ariaLabelledby:i}=t,n=e.isConnected?e.getRootNode():null;let r=null;if(i&&n){r=i.split(" ").map((s=>{const i=n.getElementById(s);return i?i===e&&null!==t.value?t.selectedText:O(i):""})).join(" ")}else if(s)r=s;else if(n){const t=e.id;if(t){const e=n.querySelector(`[for="${t}"]`);e instanceof HTMLElement&&(r=O(e))}if(null===r){const t=e.closest("label");t&&(r=O(t))}}return r&&(r=r.trim()),r}let S,V,P=e=>e,T=!1;const I=Symbol("focusVisibleChangedListener");function F(s){return class extends s{constructor(){super(),this.addEventListener("focusout",(e=>{Promise.resolve().then((()=>{const t=e.relatedTarget||document.activeElement,s=this===t,i=u(this,t);!s&&!i&&(this[r]({focusVisible:!1}),document.removeEventListener("focusvisiblechange",this[I]),this[I]=null)}))})),this.addEventListener("focusin",(()=>{Promise.resolve().then((()=>{this[i].focusVisible!==T&&this[r]({focusVisible:T}),this[I]||(this[I]=()=>{this[r]({focusVisible:T})},document.addEventListener("focusvisiblechange",this[I]))}))}))}get[e](){return Object.assign(super[e]||{},{focusVisible:!1})}[t](e){if(super[t]&&super[t](e),e.focusVisible){const{focusVisible:e}=this[i];this.toggleAttribute("focus-visible",e)}}get[d](){const e=super[d]||b.html(S||(S=P``));return e.content.append(h.html(V||(V=P`
        <style>
          :host {
            outline: none;
          }

          :host([focus-visible]:focus-within) {
            outline-color: Highlight; /* Firefox */
            outline-color: -webkit-focus-ring-color; /* All other browsers */
            outline-style: auto;
          }
        </style>
      `))),e}}}function q(e){if(T!==e){T=e;const t=new CustomEvent("focus-visible-changed",{detail:{focusVisible:T}});document.dispatchEvent(t);const s=new CustomEvent("focusvisiblechange",{detail:{focusVisible:T}});document.dispatchEvent(s)}}function $(e){return class extends e{get[f](){return!0}focus(e){const t=this[p];t&&t.focus(e)}get[p](){return g(this[m])}}}window.addEventListener("keydown",(()=>{q(!0)}),{capture:!0}),window.addEventListener("mousedown",(()=>{q(!1)}),{capture:!0});let D,R=e=>e;const B=Symbol("extends"),H=Symbol("delegatedPropertySetters"),M={a:!0,area:!0,button:!0,details:!0,iframe:!0,input:!0,select:!0,textarea:!0},N={address:["scroll"],blockquote:["scroll"],caption:["scroll"],center:["scroll"],dd:["scroll"],dir:["scroll"],div:["scroll"],dl:["scroll"],dt:["scroll"],fieldset:["scroll"],form:["reset","scroll"],frame:["load"],h1:["scroll"],h2:["scroll"],h3:["scroll"],h4:["scroll"],h5:["scroll"],h6:["scroll"],iframe:["load"],img:["abort","error","load"],input:["abort","change","error","select","load"],li:["scroll"],link:["load"],menu:["scroll"],object:["error","scroll"],ol:["scroll"],p:["scroll"],script:["error","load"],select:["change","scroll"],tbody:["scroll"],tfoot:["scroll"],thead:["scroll"],textarea:["change","select","scroll"]},z=["click","dblclick","mousedown","mouseenter","mouseleave","mousemove","mouseout","mouseover","mouseup","wheel"],G={abort:!0,change:!0,reset:!0},J=["address","article","aside","blockquote","canvas","dd","div","dl","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","header","hgroup","hr","li","main","nav","noscript","ol","output","p","pre","section","table","tfoot","ul","video"],K=["accept-charset","autoplay","buffered","challenge","codebase","colspan","contenteditable","controls","crossorigin","datetime","dirname","for","formaction","http-equiv","icon","ismap","itemprop","keytype","language","loop","manifest","maxlength","minlength","muted","novalidate","preload","radiogroup","readonly","referrerpolicy","rowspan","scoped","usemap"],Q=$(w);class U extends Q{constructor(){super();const e=this;!this[v]&&e.attachInternals&&(this[v]=e.attachInternals())}attributeChangedCallback(e,t,s){if(K.indexOf(e)>=0){const t=Object.assign({},this[i].innerAttributes,{[e]:s});this[r]({innerAttributes:t})}else super.attributeChangedCallback(e,t,s)}blur(){this.inner.blur()}get[e](){return Object.assign(super[e],{innerAttributes:{}})}get[y](){return M[this.extends]?0:-1}get extends(){return this.constructor[B]}get inner(){const e=this[A]&&this[A].inner;return e||console.warn("Attempted to get an inner standard element before it was instantiated."),e}static get observedAttributes(){return[...super.observedAttributes,...K]}[t](e){super[t](e);const n=this.inner;if(this[s]){(N[this.extends]||[]).forEach((e=>{n.addEventListener(e,(()=>{const t=new Event(e,{bubbles:G[e]||!1});this.dispatchEvent(t)}))})),"disabled"in n&&z.forEach((e=>{this.addEventListener(e,(e=>{n.disabled&&e.stopImmediatePropagation()}))}))}if(e.tabIndex&&(n.tabIndex=this[i].tabIndex),e.innerAttributes){const{innerAttributes:e}=this[i];for(const t in e)W(n,t,e[t])}this.constructor[H].forEach((t=>{if(e[t]){const e=this[i][t];("selectionEnd"===t||"selectionStart"===t)&&null===e||(n[t]=e)}}))}[a](e){if(super[a](e),e.disabled){const{disabled:e}=this[i];void 0!==e&&x(this,"disabled",e)}}get[d](){const e=J.includes(this.extends)?"block":"inline-block",t=this.extends;return b.html(D||(D=R`
      <style>
        :host {
          display: ${0}
        }
        
        [part~="inner"] {
          box-sizing: border-box;
          height: 100%;
          width: 100%;
        }
      </style>
      <${0} id="inner" part="inner ${0}">
        <slot></slot>
      </${0}>
    `),e,t,t,t)}static wrap(e){class t extends U{}t[B]=e;const s=document.createElement(e);return function(e,t){const s=Object.getOwnPropertyNames(t);e[H]=[],s.forEach((s=>{const n=Object.getOwnPropertyDescriptor(t,s);if(!n)return;const o=function(e,t){if("function"==typeof t.value){if("constructor"!==e)return function(e,t){const s=function(...t){this.inner[e](...t)};return{configurable:t.configurable,enumerable:t.enumerable,value:s,writable:t.writable}}(e,t)}else if("function"==typeof t.get||"function"==typeof t.set)return function(e,t){const s={configurable:t.configurable,enumerable:t.enumerable};t.get&&(s.get=function(){return function(e,t){return e[i][t]||e[m]&&e.inner[t]}(this,e)});t.set&&(s.set=function(t){!function(e,t,s){e[i][t]!==s&&e[r]({[t]:s})}(this,e,t)});t.writable&&(s.writable=t.writable);return s}(e,t);return null}(s,n);o&&(Object.defineProperty(e.prototype,s,o),o.set&&e[H].push(s))}))}(t,Object.getPrototypeOf(s)),t}}function W(e,t,s){L[t]?"string"==typeof s?e.setAttribute(t,""):null===s&&e.removeAttribute(t):null!=s?e.setAttribute(t,s.toString()):e.removeAttribute(t)}let X,Y=e=>e;const Z=function(r){return class extends r{get[e](){return Object.assign(super[e]||{},{composeFocus:!j})}[t](e){super[t]&&super[t](e),this[s]&&this.addEventListener("mousedown",(e=>{if(this[i].composeFocus&&0===e.button&&e.target instanceof Element){const t=n(e.target);t&&(t.focus(),e.preventDefault())}}))}}}(function(n){return class extends n{get ariaLabel(){return this[i].ariaLabel}set ariaLabel(e){this[i].removingAriaAttribute||this[r]({ariaLabel:String(e)})}get ariaLabelledby(){return this[i].ariaLabelledby}set ariaLabelledby(e){this[i].removingAriaAttribute||this[r]({ariaLabelledby:String(e)})}get[e](){return Object.assign(super[e]||{},{ariaLabel:null,ariaLabelledby:null,inputLabel:null,removingAriaAttribute:!1})}[t](e){if(super[t]&&super[t](e),this[s]&&this.addEventListener("focus",(()=>{this[o]=!0;const e=C(this,this[i]);this[r]({inputLabel:e}),this[o]=!1})),e.inputLabel){const{inputLabel:e}=this[i];e?this[l].setAttribute("aria-label",e):this[l].removeAttribute("aria-label")}}[a](e){if(super[a]&&super[a](e),this[s]){(window.requestIdleCallback||setTimeout)((()=>{const e=C(this,this[i]);this[r]({inputLabel:e})}))}const{ariaLabel:t,ariaLabelledby:n}=this[i];e.ariaLabel&&!this[i].removingAriaAttribute&&this.getAttribute("aria-label")&&(this.setAttribute("delegated-label",t),this[r]({removingAriaAttribute:!0}),this.removeAttribute("aria-label")),e.ariaLabelledby&&!this[i].removingAriaAttribute&&this.getAttribute("aria-labelledby")&&(this.setAttribute("delegated-labelledby",n),this[r]({removingAriaAttribute:!0}),this.removeAttribute("aria-labelledby")),e.removingAriaAttribute&&this[i].removingAriaAttribute&&this[r]({removingAriaAttribute:!1})}[c](e,t){const s=super[c]?super[c](e,t):{};if(t.ariaLabel&&e.ariaLabel||t.selectedText&&e.ariaLabelledby&&this.matches(":focus-within")){const t=C(this,e);Object.assign(s,{inputLabel:t})}return s}}}(F(U.wrap("button"))));class _ extends Z{get[e](){return Object.assign(super[e],{role:"button"})}get[l](){return this[A].inner}[E](){const e=new MouseEvent("click",{bubbles:!0,cancelable:!0});this.dispatchEvent(e)}get[d](){const e=super[d];return e.content.append(h.html(X||(X=Y`
        <style>
          :host {
            display: inline-flex;
            outline: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          [part~="button"] {
            align-items: center;
            background: none;
            border: none;
            color: inherit;
            flex: 1;
            font: inherit;
            outline: none;
            padding: 0;
          }
        </style>
      `))),e}}let ee,te=e=>e;class se extends(function(e){return class extends e{get[d](){const e=super[d];return e.content.append(h.html(ee||(ee=te`
        <style>
          :host([disabled]) ::slotted(*) {
            opacity: 0.5;
          }

          [part~="button"] {
            display: inline-flex;
            justify-content: center;
            margin: 0;
            position: relative;
          }
        </style>
      `))),e}}}(_)){}let ie,ne=e=>e;class re extends se{get[d](){const e=super[d];return e.content.append(h.html(ie||(ie=ne`
        <style>
          [part~="button"] {
            background: #eee;
            border: 1px solid #ccc;
            padding: 0.25em 0.5em;
          }
        </style>
      `))),e}}export{$ as D,F,re as P};
