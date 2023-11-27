import { SlMenuItem } from '@shoelace-style/shoelace';

export async function showMenuImagem(editorTextoRico: any, img: any, top: number, left: number): Promise<any> {
  const content = document.createRange().createContextualFragment(`
    <div>
      <style>
      #bg-wp-menu-img {
        position:absolute; top:0; left:0; width:100%; height:100%; z-index:999;
      }
      #menu-img {
        position:absolute; z-index:9999;
      }
      </style>
      <div id="bg-wp-menu-img">
        <sl-menu id="menu-img" style="top:${top}px;left:${left}px;">
          <sl-menu-item id="item-menu-largura-img" value="alterar-largura-imagem">Alterar a largura da imagem</sl-menu-item>
        </sl-menu>
      </div>
    </div>
  `);

  const itemMenu = content.querySelector('#item-menu-largura-img') as SlMenuItem;
  const bgWpMenuImagem = content.querySelector('#bg-wp-menu-img') as HTMLDivElement;

  itemMenu.onclick = (): void => {
    const width = img.style.width;
    editorTextoRico.showAlterarLarguraImagemModal(img, width);
  };

  bgWpMenuImagem.onclick = (): void => {
    bgWpMenuImagem.parentElement?.remove();
  };

  await editorTextoRico.appendChild(content);
}
