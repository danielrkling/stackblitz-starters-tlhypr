import Folder from './folder'
import File from './file'

export const files: Record<string, File> = {};
export var rootFolder: Folder;
export var leftActiveFile: File;
export var rightActiveFile: File;
export var dragFile: File
//export var activeEditor: monaco.editor.IEditor | monaco.editor.IDiffEditor;

export const globals = {files, rootFolder, leftActiveFile,rightActiveFile,dragFile}

export default globals