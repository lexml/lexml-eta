import { html } from 'lit';

export const quillTableCss = html`<style>
  .ql-editor table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    overflow: hidden;
    white-space: nowrap;
    margin-left: auto;
    margin-right: auto;
  }

  .ql-editor table td {
    border: 1px solid black;
    padding: 2px 5px;
    height: 25px;
    vertical-align: top;
    white-space: pre-wrap; /* https://github.com/quilljs/quill/issues/1760 */
  }

  .ql-editor table td[rowspan='2'] {
    height: 50px;
  }

  .ql-editor table td[rowspan='3'] {
    height: 75px;
  }

  .ql-editor table td[rowspan='4'] {
    height: 100px;
  }

  .ql-editor table td[rowspan='5'] {
    height: 125px;
  }

  .ql-editor table td[rowspan='6'] {
    height: 150px;
  }

  .ql-editor table td[rowspan='7'] {
    height: 175px;
  }

  .ql-editor table td[rowspan='8'] {
    height: 200px;
  }

  .ql-editor table td[rowspan='9'] {
    height: 225px;
  }

  .ql-editor table td.ql-cell-selected {
    background-color: #cce0f8;
  }

  .ql-editor table td[merge_id] {
    display: none;
  }

  .quill-better-table-wrapper {
    overflow-x: auto;
  }

  .ql-picker.ql-table {
    width: auto !important;
    margin-right: 0;
  }

  .ql-picker.ql-table .ql-picker-label svg {
    display: none;
  }

  .ql-picker.ql-table .ql-picker-label::before {
    display: block;
    font-size: 14px;
  }

  .ql-table:nth-of-type(1) .ql-picker-label {
    background: url('data:image/svg+xml;utf8, <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-table" viewBox="0 0 16 16"><path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 2h-4v3h4V4zm0 4h-4v3h4V8zm0 4h-4v3h3a1 1 0 0 0 1-1v-2zm-5 3v-3H6v3h4zm-5 0v-3H1v2a1 1 0 0 0 1 1h3zm-4-4h4V8H1v3zm0-4h4V4H1v3zm5-3v3h4V4H6zm4 4H6v3h4V8z"/></svg>')
        no-repeat center,
      white;
    background-size: 16px;
  }

  .ql-picker.ql-table .ql-picker-label::before {
    font-family: 'Font Awesome 6 Free';
    font-weight: 900;
    padding-top: 2px;
    line-height: 1em;
  }

  .ql-table:nth-of-type(1),
  .ql-contain {
    width: 90px;
    margin-right: 0;
  }

  .ql-picker.ql-table:nth-of-type(1) {
    font-size: 11px;
    font-weight: normal;
  }

  .ql-picker.ql-table .ql-picker-label {
    padding: 2px 3px;
    width: 23px;
  }

  .ql-picker.ql-table:nth-of-type(1) .ql-picker-options {
    width: 180px;
  }

  .ql-picker.ql-table:nth-of-type(1) .ql-picker-item {
    display: block;
    float: left;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    padding: 0px;
    margin: 1px;
  }

  .ql-toolbar .ql-picker.ql-table .ql-picker-item {
    display: none;
  }

  .ql-toolbar .ql-picker.ql-table .ql-picker-item.enabled {
    display: block;
  }

  .ql-picker.ql-table:nth-of-type(2) {
    display: flex;
    width: 145px;
  }

  .ql-table:nth-of-type(2) .ql-picker-label {
    background: url('data:image/svg+xml;utf8, <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-border" viewBox="0 0 16 16"><path d="M0 0h.969v.5H1v.469H.969V1H.5V.969H0V0zm2.844 1h-.938V0h.938v1zm1.875 0H3.78V0h.938v1zm1.875 0h-.938V0h.938v1zm.937 0V.969H7.5V.5h.031V0h.938v.5H8.5v.469h-.031V1H7.53zm2.813 0h-.938V0h.938v1zm1.875 0h-.938V0h.938v1zm1.875 0h-.938V0h.938v1zM15.5 1h-.469V.969H15V.5h.031V0H16v.969h-.5V1zM1 1.906v.938H0v-.938h1zm6.5.938v-.938h1v.938h-1zm7.5 0v-.938h1v.938h-1zM1 3.78v.938H0V3.78h1zm6.5.938V3.78h1v.938h-1zm7.5 0V3.78h1v.938h-1zM1 5.656v.938H0v-.938h1zm6.5.938v-.938h1v.938h-1zm7.5 0v-.938h1v.938h-1zM.969 8.5H.5v-.031H0V7.53h.5V7.5h.469v.031H1v.938H.969V8.5zm1.875 0h-.938v-1h.938v1zm1.875 0H3.78v-1h.938v1zm1.875 0h-.938v-1h.938v1zm1.875-.031V8.5H7.53v-.031H7.5V7.53h.031V7.5h.938v.031H8.5v.938h-.031zm1.875.031h-.938v-1h.938v1zm1.875 0h-.938v-1h.938v1zm1.875 0h-.938v-1h.938v1zm1.406 0h-.469v-.031H15V7.53h.031V7.5h.469v.031h.5v.938h-.5V8.5zM0 10.344v-.938h1v.938H0zm7.5 0v-.938h1v.938h-1zm8.5-.938v.938h-1v-.938h1zM0 12.22v-.938h1v.938H0zm7.5 0v-.938h1v.938h-1zm8.5-.938v.938h-1v-.938h1zM0 14.094v-.938h1v.938H0zm7.5 0v-.938h1v.938h-1zm8.5-.938v.938h-1v-.938h1zM.969 16H0v-.969h.5V15h.469v.031H1v.469H.969v.5zm1.875 0h-.938v-1h.938v1zm1.875 0H3.78v-1h.938v1zm1.875 0h-.938v-1h.938v1zm.937 0v-.5H7.5v-.469h.031V15h.938v.031H8.5v.469h-.031v.5H7.53zm2.813 0h-.938v-1h.938v1zm1.875 0h-.938v-1h.938v1zm1.875 0h-.938v-1h.938v1zm.937 0v-.5H15v-.469h.031V15h.469v.031h.5V16h-.969z"/></svg>')
        no-repeat center,
      white;
    background-size: 16px;
  }
  .ql-picker.ql-table:nth-of-type(2) {
    color: #444;
  }

  .ql-picker.ql-table:nth-of-type(1) .ql-picker-item {
    border: 1px solid #444;
    color: #444;
  }

  .ql-table:nth-of-type(2) .ql-picker-label.ql-active {
    color: #444 !important;
  }

  .ql-toolbar .ql-picker-item.ql-selected:before,
  .ql-picker.ql-table:nth-of-type(2) .ql-picker-item {
    color: #444;
  }

  /* .ql-picker-label.ql-active .ql-stroke {
    stroke: #444 !important;
  } */

  .ql-picker-item[data-value='remove-table'] {
    border: none !important;
    width: 100%;
  }

  .ql-picker-item[data-value='newtable_1_1']:before {
    content: '1x1';
  }

  .ql-picker-item[data-value='newtable_1_2']:before {
    content: '1x2';
  }

  .ql-picker-item[data-value='newtable_1_3']:before {
    content: '1x3';
  }

  .ql-picker-item[data-value='newtable_1_4']:before {
    content: '1x4';
  }

  .ql-picker-item[data-value='newtable_1_5']:before {
    content: '1x5';
  }

  .ql-picker-item[data-value='newtable_2_1']:before {
    content: '2x1';
  }

  .ql-picker-item[data-value='newtable_2_2']:before {
    content: '2x2';
  }

  .ql-picker-item[data-value='newtable_2_3']:before {
    content: '2x3';
  }

  .ql-picker-item[data-value='newtable_2_4']:before {
    content: '2x4';
  }

  .ql-picker-item[data-value='newtable_2_5']:before {
    content: '2x5';
  }

  .ql-picker-item[data-value='newtable_3_1']:before {
    content: '3x1';
  }

  .ql-picker-item[data-value='newtable_3_2']:before {
    content: '3x2';
  }

  .ql-picker-item[data-value='newtable_3_3']:before {
    content: '3x3';
  }

  .ql-picker-item[data-value='newtable_3_4']:before {
    content: '3x4';
  }

  .ql-picker-item[data-value='newtable_3_5']:before {
    content: '3x5';
  }

  .ql-picker-item[data-value='newtable_4_1']:before {
    content: '4x1';
  }

  .ql-picker-item[data-value='newtable_4_2']:before {
    content: '4x2';
  }

  .ql-picker-item[data-value='newtable_4_3']:before {
    content: '4x3';
  }

  .ql-picker-item[data-value='newtable_4_4']:before {
    content: '4x4';
  }

  .ql-picker-item[data-value='newtable_4_5']:before {
    content: '4x5';
  }

  .ql-picker-item[data-value='newtable_5_1']:before {
    content: '5x1';
  }

  .ql-picker-item[data-value='newtable_5_2']:before {
    content: '5x2';
  }

  .ql-picker-item[data-value='newtable_5_3']:before {
    content: '5x3';
  }

  .ql-picker-item[data-value='newtable_5_4']:before {
    content: '5x4';
  }

  .ql-picker-item[data-value='newtable_5_5']:before {
    content: '5x5';
  }

  p:has(img) {
    text-align: center !important;
    text-indent: 0 !important;
  }
</style>`;
