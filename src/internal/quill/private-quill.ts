import Quill from 'quill/dist/quill';
import { QuillRuntime } from './quill-types';

/**
 * Fronteira interna para o Quill usado pela biblioteca.
 *
 * Nesta etapa, a referência ainda é capturada do build UMD atual. Os próximos
 * passos substituirão a origem sem exigir novas mudanças nos consumidores.
 */
const PrivateQuill = Quill as unknown as typeof QuillRuntime;

const PrivateParchment = PrivateQuill.import('parchment');
const PrivateDelta = PrivateQuill.import('delta');
const PrivateDefaultClipboardModule = PrivateQuill.import('modules/clipboard');
const PrivateDefaultKeyboardModule = PrivateQuill.import('modules/keyboard');

export { PrivateDefaultClipboardModule, PrivateDefaultKeyboardModule, PrivateDelta, PrivateParchment, PrivateQuill };
export default PrivateQuill;
