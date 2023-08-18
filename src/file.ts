import Div from './div'
import Menu from './contextMenu'
import Folder from './folder'
import globals from './globals'
import { leftEditor, rightEditor, leftTabs, rightTabs } from './editor'
// import { previewMarkdown } from './markdown'
//import { compileTypescript } from './compile'
import * as monaco from 'monaco-editor'
import {compileTSFile} from './compile'

export default class File {


	public handle: FileSystemFileHandle;
	public model: monaco.editor.ITextModel;
	public modifiedModel: monaco.editor.ITextModel;

	public parentFolder: Folder;

	public container: HTMLDivElement
	public label: HTMLDivElement;
	public input: HTMLInputElement;
	public leftTab: HTMLDivElement;
	public rightTab: HTMLDivElement;

	public state: {
		viewState?: monaco.editor.ICodeEditorViewState;
		// diffViewState?: monaco.editor.IDiffEditorViewState;
		loaded?: boolean;
	}

	public saveTimer: any;


	constructor(handle: FileSystemFileHandle, parentFolder: Folder) {
		this.handle = handle;
		this.parentFolder = parentFolder;
		this.state = { loaded: parentFolder.state.loaded };

		this.container = Div({
			className: 'container file'
		})
	}

	name() {
		return this.handle.name;
	}

	extension() {
		return this.name().split('.').pop();
	}

	path() {
		if (this.parentFolder === globals.rootFolder) {
			return this.name();
		} else {
			return this.parentFolder.path() + '/' + this.name();
		}
	}

	language() {
		switch (this.extension()) {
			case 'html': return 'html';
			case 'hta': return 'html';
			case 'jsx': return 'javascript';
			case 'css': return 'css';
			case 'scss': return 'scss';
			case 'js': return 'javascript';
			case 'mjs': return 'javascript';
			case 'json': return 'json';
			case 'md': return 'markdown';
			case 'vb': return 'vb';
			case 'vbs': return 'vb';
			case 'bas': return 'vb';
			case 'cls': return 'vb';
			case 'sql': return 'sql';
			case 'cs': return 'cs';
			case 'ts': return 'typescript';
			case 'tsx': return 'typescript';
			case 'txt': return 'text';
			default: return null;
		}
	}

	icon() {
		switch (this.language()) {
			case 'javascript': return '<i class="fa-brands fa-square-js"></i>';
			case 'typescript': return '<i class="fa-brands fa-square-js typescript"></i>';
			case 'css': return '<i class="fa-solid fa-palette"></i>';
			case 'scss': return '<i class="fa-solid fa-palette scss"></i>';
			case 'html': return '<i class="fa-solid fa-code"></i>';
			case 'json': return '<i class="fa-solid fa-gear"></i>';
			case 'sql': return '<i class="fa-solid fa-database"></i>';
			case 'vb': return '<i class="fa-solid fa-scroll"></i>';
			case 'text': return '<i class="fa-solid fa-font"></i>';
			case 'markdown': return '<i class="fa-solid fa-book"></i>';
			default: return '<i class="fa-solid fa-file"></i>';
		}
	}

	async getText() {
		if (this.model) {
			return this.model.getValue();
		} else {
			const file = await this.handle.getFile();
			return await file.text();
		}
	}

	async setText(text: string) {
		if (this.model) {
			return this.model.setValue(text);
		} else {
            // @ts-ignore
			const writable = await this.handle.createWritable();
			await writable.write(text);
			await writable.close();
		}
	}

	async loadModel() {
		if (this.model) {
			this.unloadModel();
		}
		const self = this;
		const text = await this.getText();
		this.model = monaco.editor.createModel(text, this.language(), monaco.Uri.file(this.path()));
		this.model.onDidChangeContent(function (e) {
			autoSave(self, e.isFlush ? 0 : 2000)
		})
		this.input.checked = true;
	}

	async loadTree() {
		globals.files[this.path()] = this;

		return this.createTreeElement();
	}

	unloadModel() {
		this.deactivate({ left: true, right: true })
		this.leftTab?.remove();
		this.leftTab = null;
		this.rightTab?.remove();
		this.rightTab = null;
		this.model?.dispose();
		this.model = undefined;
		this.input.checked = false;
	}

	async save() {
		if (!this.language()) {
			if (!confirm('File Type not supported. Okay to save?')) {
				return
			}
		}

        // @ts-ignore
		const writable = await this.handle.createWritable();
		await writable.write(this.model.getValue());
		await writable.close();
	}

	async remove(hideWarning?: boolean) {
		if (hideWarning || confirm(`Are you sure you want to delete ${this.name()}`)) {
			this.unloadModel();
			delete globals.files[this.path()];
			delete this.parentFolder.files[this.name()];
			this.container.remove();
			// @ts-ignore
			await this.handle.remove({ recursive: true });
		}
	}


	async rename() {

		var fileName = prompt("New filename", this.name());
		if (fileName) {
			if (this.parentFolder.files[fileName]) {
				alert('File already exists with that name: ' + fileName)
				return false
			}

			//let active = {(globals.leftActiveFile === this);}
			let loaded = this.input.checked;
			let leftActive = leftEditor.activeFile === this;
			let rightActive = rightEditor.activeFile === this;

			this.unloadModel();
			delete globals.files[this.path()];
			delete this.parentFolder.files[this.name()];
// @ts-ignore
			await this.handle.move(fileName);
			this.container.remove();
			await this.parentFolder.loadFile(this)

			if (loaded) {
				await this.loadModel()

				this.activate({ left: leftActive, right: rightActive })
			}

			// if (active) {
			//   await this.activate()
			// }
		}
	}

	contextMenu() {
		const self = this;

		return new Menu(this,
			[
				...(this.language() === 'javascript' || this.language() === 'typescript' ? [{
					icon: '<i class="fa-solid fa-gear"></i>',
					label: 'Compile',
					action: async function () { await compileTSFile(self) }
				}] : []),
				...(this.language() === 'markdown' ? [{
					icon: '<i class="fa-solid fa-gear"></i>',
					label: 'PreviewMarkdown',
					action: function () { /* previewMarkdown(self) */ }
				}] : []),
				{
					icon: '<i class="fa-solid fa-pencil"></i>',
					label: 'Rename',
					action: async function () { await self.rename() }
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
			innerHTML: `${this.icon()}<span>${this.name()}</span>`,
			listeners: [
				{
					type: 'click', listener: function () {
						self.activate({ left: true })
					}
				},
				{
					type: 'contextmenu', listener: function (mouseEvent) {
						contextMenu.show(mouseEvent as MouseEvent);
					}
				}
			]
		})
		this.label.draggable = true
		this.label.addEventListener('dragstart', function (ev) {
			globals.dragFile = self;
		})


		this.input = document.createElement('input');
		this.input.type = 'checkbox';
		this.input.checked = false;
		this.input.addEventListener('change', async function () {
			if (self.input.checked) {
				await self.loadModel();

				//self.activate({ left: (leftEditor.activeFile === self), right: (rightEditor.activeFile === self) });

			} else {
				self.unloadModel();
			}
		})



		const contextMenu = this.contextMenu();

		this.container.appendChild(this.input)
		this.container.appendChild(this.label);
		this.container.appendChild(contextMenu.container);
		return this.container;
	}

	async activate(editor?: { left?: boolean, right?: boolean }, createTab?: boolean) {

		if (!this.input.checked) {
			this.input.checked = true;
			await this.loadModel()
		}

		//this.model.setValue(this.model.getValue())

		if (editor.left) {
			leftEditor.activeFile?.deactivate({ left: true });
			leftEditor.setModel(this.model);
			leftEditor.restoreViewState(this.state.viewState)
			this.label.classList.add('active', 'left')
			leftEditor.activeFile = this;
			if (!this.leftTab) {
				this.createTab({ left: true })
			} else {
				this.leftTab.classList.add('active')
			};
		}

		if (editor.right) {
			rightEditor.activeFile?.deactivate({ right: true });
			rightEditor.setModel(this.model);
			rightEditor.restoreViewState(this.state.viewState)
			this.label.classList.add('active', 'right')
			rightEditor.activeFile = this;
			if (!this.rightTab) {
				this.createTab({ right: true })
			} else {
				this.rightTab.classList.add('active')
			};
		}

	}

	deactivate(editor?: { left?: boolean, right?: boolean }) {
		this.state.viewState = leftEditor.saveViewState();

		// if (editor === undefined) {
		//   editor.left = true
		// }

		if (editor.left) {
			this.label?.classList.remove('left')
			leftEditor.activeFile = null;
			leftEditor.setModel(null);
			this.leftTab?.classList.remove('active')
		}

		if (editor.right) {
			this.label?.classList.remove('right')
			rightEditor.activeFile = null
			rightEditor.setModel(null)
			this.rightTab?.classList.remove('active')
		}

		if (!(rightEditor.activeFile === this || leftEditor.activeFile === this)) {
			this.label?.classList.remove('active')
		}


	}

	createTab(side?: { left?: boolean, right?: boolean }) {
		const self = this;
		const contextMenu = new Menu(this,
			[
				{
					icon: '<i class="fa-solid fa-circle-left"></i>',
					label: 'Move Left',
					action: async function () {
						if (tab.previousElementSibling) {
							tab.parentNode.insertBefore(tab, tab.previousElementSibling);
						}
					}
				},
				{
					icon: '<i class="fa-solid fa-circle-right"></i>',
					label: 'Move Right',
					action: async function () {
						if (tab.nextElementSibling) {
							tab.parentNode.insertBefore(tab, tab.nextElementSibling);
						}
					}
				},
				{
					icon: '<i class="fa-solid fa-xmark"></i>',
					label: 'Close',
					action: async function () {
						tab.remove();
						self.deactivate(side)
						if (side.left) {
							self.leftTab = null;
						}
						if (side.right) {
							self.rightTab = null;
						}
					}
				},
			])

		const tab = Div({
			parent: this.container,
			className: 'tab active',
			innerHTML: `${this.icon()}<span>${this.name()}</span>`,
			listeners: [
				{
					type: 'click', listener: function (mouseEvent) {
						if (!contextMenu.container.contains(mouseEvent.target as Node)) {
							self.activate(side)
						}

					}
				},
				{
					type: 'contextmenu', listener: function (mouseEvent) {
						if (!contextMenu.container.contains(mouseEvent.target as Node)) {
							contextMenu.show(mouseEvent as MouseEvent);
						}
					}
				}
			]
		})

		tab.appendChild(contextMenu.container)

		if (side.left) {
			this.leftTab = tab;
			leftTabs.appendChild(tab)
		}

		if (side.right) {
			this.rightTab = tab;
			rightTabs.appendChild(tab)
		}
	}

	async run() {
		// if (this.language() === 'typescript') {
		// 	var code = compileTypescript(await this.getText(), {
		// 		parserOpts: {
		// 			allowReturnOutsideFunction: true
		// 		}
		// 	});
		// } else {
		// 	var code = await this.getText();
		// }

		// Function(code)()
	}
}

const saveTimers: Record<string, any> = {};
var saveCount = 0;
function autoSave(file: File, timer: number) {
	document.getElementById('autoSave').classList.add('orange');
	document.getElementById('compileButton').classList.add('orange');

	clearTimeout(saveTimers[file.path()]);
	saveTimers[file.path()] = setTimeout(async function () {
		document.getElementById('autoSave').children[0].classList.add('fa-flip');
		saveCount++
		await file.save();
		saveCount--
		if (saveCount === 0) {
			document.getElementById('autoSave').children[0].classList.remove('fa-flip');
		}

		delete saveTimers[file.path()];
		if (Object.keys(saveTimers).length == 0) {
			document.getElementById('autoSave').classList.remove('orange');

		}
	}, timer)
}
