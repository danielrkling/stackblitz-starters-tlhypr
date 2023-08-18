import Div from './div'
import Menu from './contextMenu'
import File from './file'
import globals from './globals';



export default class Folder {

  public handle: FileSystemDirectoryHandle;
  public parentFolder: Folder;

  public container: HTMLDivElement
  private label: HTMLDivElement;
  private childrenContainer: HTMLDivElement;
  private fileContainer: HTMLDivElement;
  private folderContainer: HTMLDivElement;

  public files: Record<string, File>;
  public folders: Record<string, Folder>;

  public state: {
    expanded: boolean;
    loaded: boolean;
  }

  constructor(handle: FileSystemDirectoryHandle, parentFolder?: Folder) {
    this.handle = handle;
    this.parentFolder = parentFolder;
    this.state = { expanded: false, loaded: parentFolder?.state.loaded ?? false };

    this.files = {};
    this.folders = {};

    this.container = Div({
      className: 'container folder'
    })
  }

  name() {
    return this.handle.name;
  }

  path() {
    if (this.parentFolder === globals.rootFolder) {
      return this.name();
    } else {
      return this.parentFolder.path() + '/' + this.name();
    }
  }

  icon() {
    return '<i class="fa-solid fa-folder"></i>';
  }

  contextMenu() {
    const self = this;

    return new Menu(this,
      [
        {
          icon: '<i class="fa-solid fa-file-circle-plus"></i>',
          label: 'New File',
          action: async function () { var file = await self.newFile(); file.activate({left:true}); self.expand(); }
        },
        {
          icon: '<i class="fa-solid fa-folder-plus"></i>',
          label: 'New Folder',
          action: async function () { await self.newFolder(); self.expand(); }
        },
        {
          icon: '<i class="fa-solid fa-rotate"></i>',
          label: 'Refresh',
          action: async function () { await self.reload() }
        },
        {
          icon: '<i class="fa-solid fa-circle-plus"></i>',
          label: 'Load Models',
          action: async function () { await self.loadModels() }
        },
        {
          icon: '<i class="fa-solid fa-circle-minus"></i>',
          label: 'Unload Models',
          action: async function () { await self.unloadModels() }
        },
        {
          icon: '<i class="fa-solid fa-trash-can"></i>',
          label: 'Delete',
          action: async function () { await self.remove() }
        },
      ])
  }

  createTreeElement() {
    const self = this;
    this.container.innerHTML = '';

    this.label = Div({
      parent: this.container,
      className: 'label',
      listeners: [
        {
          type: 'click', listener: function () {
            (self.state.expanded) ? self.collapse() : self.expand();
          }
        },
        {
          type: 'contextmenu', listener: function (mouseEvent: MouseEvent) {
            contextMenu.show(mouseEvent);
          }
        }
      ]
    })

    this.childrenContainer = Div({
      parent: this.container,
      className: 'children hidden'
    })

    this.folderContainer = Div({
      parent: this.childrenContainer,
    })

    this.fileContainer = Div({
      parent: this.childrenContainer,
    })

    const contextMenu = this.contextMenu();
    this.container.appendChild(contextMenu.container);

    this.collapse();
    return this.container;
  }

  collapse() {
    this.label.innerHTML = `
		<i class='fa-solid fa-chevron-right'></i>
		<i class='fa-solid fa-folder'></i>
		<span class='tree-label-name'>${this.name()}</span>`;
    this.childrenContainer.classList.toggle('hidden', true);
    this.state.expanded = false;
  }

  expand() {
    this.label.innerHTML = `
		<i class='fa-solid fa-chevron-down'></i>
		<i class='fa-solid fa-folder-open'></i>
		<span class='tree-label-name'>${this.name()}</span>`;
    this.childrenContainer.classList.toggle('hidden', false);
    this.state.expanded = true;
  }

  async loadTree() {
    await this.unloadModels()

    this.files = {};
    this.folders = {};

    const treeElement = this.createTreeElement();

    // @ts-ignore
    for await (const child of this.handle.values()) {
      if (child.kind == 'directory') {
        this.loadFolder(new Folder(child, this))
      } else {
        this.loadFile(new File(child, this))
      }
    }

    return treeElement;
  }

  async loadFolder(folder: Folder) {
    this.folders[folder.name()] = folder;
    let keys = Object.keys(this.folders).sort();
    let nextIndex = keys.indexOf(folder.name()) + 1;
    let nextItem = this.folders[keys[nextIndex]];

    const elem = await folder.loadTree();
    this.folderContainer.insertBefore(elem, nextItem?.container)

  }

  async loadFile(file: File) {
    this.files[file.name()] = file;

    let keys = Object.keys(this.files).sort();
    let nextIndex = keys.indexOf(file.name()) + 1;
    let nextItem = this.files[keys[nextIndex]];

    const elem = await file.loadTree();
    this.fileContainer.insertBefore(elem, nextItem?.container)

  }

  async loadModels() {
    for await (const [key, file] of Object.entries(this.files)) {
      if (file.language()) {
        await file.loadModel()
      }
    }

    for await (const [key, folder] of Object.entries(this.folders)) {
      if (folder.name()[0] !== '!') {
        await folder.loadModels();
      }
    }
  }

  async unloadModels() {
    for await (const [key, file] of Object.entries(this.files)) {
      file.unloadModel();
    }

    for await (const [key, folder] of Object.entries(this.folders)) {
      await folder.unloadModels();
    }

  }

  async reload() {
    await this.loadTree();
    (this.state.expanded) ? this.collapse() : this.expand();

  }

  async remove(hideWarning?: boolean) {
    if (hideWarning || confirm(`Are you sure you want to delete ${this.name()}`)) {

      for await (const [key, file] of Object.entries(this.files)) {
        await file.remove(true)
      }

      for await (const [key, folder] of Object.entries(this.folders)) {
        await folder.remove(true)
      }

      this.container.remove();
      // @ts-ignore
      await this.handle.remove({ recursive: true });
    }

  }



  async newFile(filePath?: string): Promise<File> {
    const path = filePath ?? prompt("Name of new file with extension");
    if (!path) return null;

    const pathArray = path.split('/')

    const fileName = pathArray.pop()
    const folderName = pathArray.join('/');

    var folder = await this.newFolder(folderName)
    if (!fileName) return null

    try {
      var handle = await folder.handle.getFileHandle(fileName);
      var file = folder.files[fileName]
      return file
    } catch (e) {
      var handle = await folder.handle.getFileHandle(fileName, { create: true });
      var file = new File(handle, folder);
      await folder.loadFile(file)
      return file
    }

  }

  async newFolder(folderPath?: string): Promise<Folder> {
    const path = folderPath ?? prompt("Name of new folder");
    if (!path) return this;

    const pathArray = path.split('/')
    const firstFolderName = pathArray.shift()
    const nextFolderName = pathArray.join('/')

    try {
      var handle = await this.handle.getDirectoryHandle(firstFolderName);
      var folder = this.folders[firstFolderName]
      return await folder.newFolder(nextFolderName)
    } catch (e) {
      var handle = await this.handle.getDirectoryHandle(firstFolderName, { create: true });
      var folder = new Folder(handle, this);
      await this.loadFolder(folder)
      return await folder.newFolder(nextFolderName)
    }
  }
}

