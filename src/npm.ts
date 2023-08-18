document.getElementById('npmButton').addEventListener('click', async function npmDownload() {
  try {
    const npmPackageName = document.getElementById('npmPackageName') as HTMLInputElement
    const response = await fetch(`https://registry.npmjs.org/${npmPackageName.value}/latest`);
    const json = await response.json();

    const tarball = json.dist.tarball;

    downloadLink(tarball, json.name)


  } catch (e) { console.log(e) }

  function downloadLink(url: string, fileName: string) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";

    a.href = url;
    a.download = fileName;
    a.target = "_blank"
    a.click();
    a.remove();

  }
})

export default true