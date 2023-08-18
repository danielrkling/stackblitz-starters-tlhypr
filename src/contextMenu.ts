import Div from './div'
import File from './file';
import Folder from './folder';


interface ContextMenuItem {
  icon: string
  label: string
  action: () => void;
}

export default class Menu {
  public container: HTMLDivElement;

  constructor(item: File | Folder, contextMenuItems: ContextMenuItem[]) {
    const self = this;
    this.container = Div({
      className: 'context-menu hidden',
      children: [
        Div({
          innerHTML: `${item.icon()}<span class='tree-label-name'>${item.name()}</span>`,
        }),
        document.createElement('HR'),
        ...contextMenuItems.map(function (item) {
          return Div({
            className: 'context-menu-action',
            innerHTML: item.icon + item.label,
            listeners: [{
              type: 'click',
              listener: async function () {
                self.hide();
                item.action();
              }
            }]
          })
        })

      ]
    })
  }

  show(event: MouseEvent) {
    closeContextMenus();
    this.container.classList.remove('hidden');

    this.container.style.top = event.clientY + 'px';
    this.container.style.left = event.clientX + 'px';

    var rect = this.container.getBoundingClientRect();
    if (rect.bottom > window.innerHeight) {
      this.container.style.top = (event.clientY - this.container.offsetHeight) + 'px';
    }

    event.stopPropagation();
    event.preventDefault();
  }

  hide() {
    this.container.classList.add('hidden');
  }
}

document.addEventListener('click', closeContextMenus)
document.addEventListener('contextmenu', closeContextMenus)
function closeContextMenus() {
  const dropdowns = document.getElementsByClassName('context-menu');
  for (const dropdown of dropdowns) {
    dropdown.classList.add('hidden');
  }
}


