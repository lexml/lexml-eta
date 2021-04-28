import{E as e,p as t,g as s,r as n,a as r,q as c,c as i,b as a,R as l,t as u,o as h}from"./e94213f9.js";import{D as o}from"./1975e423.js";class d extends(function(l){return class extends l{constructor(){super();const t=this;!this[e]&&t.attachInternals&&(this[e]=t.attachInternals())}attributeChangedCallback(e,s,n){if("current"===e){const s=t(e,n);this.current!==s&&(this.current=s)}else super.attributeChangedCallback(e,s,n)}get[s](){return Object.assign(super[s]||{},{current:!1})}[n](e){if(super[n](e),e.current){const{current:e}=this[r];c(this,"current",e)}}[i](e){if(super[i]&&super[i](e),e.current){const{current:e}=this[r],t=new CustomEvent("current-changed",{bubbles:!0,detail:{current:e}});this.dispatchEvent(t);const s=new CustomEvent("currentchange",{bubbles:!0,detail:{current:e}});this.dispatchEvent(s)}}get current(){return this[r].current}set current(e){this[a]({current:e})}}}(o(function(t){return class extends t{constructor(){super();const t=this;!this[e]&&t.attachInternals&&(this[e]=t.attachInternals())}get[s](){return Object.assign(super[s]||{},{selected:!1})}[n](e){if(super[n](e),e.selected){const{selected:e}=this[r];c(this,"selected",e)}}[i](e){if(super[i]&&super[i](e),e.selected){const{selected:e}=this[r],t=new CustomEvent("selected-changed",{bubbles:!0,detail:{selected:e}});this.dispatchEvent(t);const s=new CustomEvent("selectedchange",{bubbles:!0,detail:{selected:e}});this.dispatchEvent(s)}}get selected(){return this[r].selected}set selected(e){this[a]({selected:e})}}}(l)))){}let p,b=e=>e;class m extends d{get[u](){return h.html(p||(p=b`
      <style>
        :host {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          font-size: 10pt;
          white-space: nowrap;
        }

        :host([disabled]) {
          opacity: 0.5;
        }

        #checkmark {
          height: 1em;
          visibility: hidden;
          width: 1em;
        }

        :host([selected]) #checkmark {
          visibility: visible;
        }
      </style>
      <svg id="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="4 6 18 12">
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
      </svg>
      <slot></slot>
    `))}}customElements.define("elix-menu-item",class extends m{});
