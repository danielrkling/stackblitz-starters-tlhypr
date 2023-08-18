import './resizer'
import './npm'
import './editor'
import globals from './globals';
import Folder from './folder';
//import './compile'



window.addEventListener('error', function (ev) {
  console.log(ev.message)
})


console.log = function(text:string){
  document.getElementById('log').innerText += '\n' + text
  document.getElementById('viewLog').classList.add('orange');
}


const logContainer =document.getElementById('logContainer')
document.getElementById('viewLog').addEventListener('click', function(){
  logContainer.classList.toggle('hidden');
  document.getElementById('viewLog').classList.remove('orange');
  
})

logContainer.addEventListener('click',function(ev){
    if (ev.target===logContainer){
        logContainer.classList.add('hidden')
        document.getElementById('log').innerHTML=''
    }
})





// export var rootFolder: Folder;
document.getElementById('openFolder').addEventListener('click', async function () {
  try {
    // @ts-ignore
    const folderHandle = await window.showDirectoryPicker();
    await verifyPermission(folderHandle);

    globals.rootFolder = new Folder(folderHandle);

    document.title = globals.rootFolder.name();

    const tree = document.getElementById('tree');
    tree.innerHTML = '';


    tree.appendChild(await globals.rootFolder.loadTree())
    await globals.rootFolder.loadModels();
  } catch (e) { console.log(e) }

  async function verifyPermission(folderHandle: FileSystemDirectoryHandle) {

    // Check if we already have permission, if so, return true.
    // @ts-ignore
    if ((await folderHandle.queryPermission({ mode: 'readwrite' })) === "granted") {
      return true;
    }

    // Request permission to the file, if the user grants permission, return true.
    // @ts-ignore
    if ((await folderHandle.requestPermission({ mode: 'readwrite' })) === "granted") {
      return true;
    }

    // The user did not grant permission, return false.
    return false;
  }
});
