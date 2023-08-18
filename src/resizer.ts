
const resizer = document.getElementById("resizer");
const sideBar = document.getElementById("sidebar");
const container = document.getElementById("container");

resizer.addEventListener("mousedown", (event) => {
    document.addEventListener("mousemove", resize, false);
    document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", resize, false);
    }, false);
});

function resize(e) {
    const size = `${e.x}px`;
    sideBar.style.width = size;
    container.style.width = `${document.body.offsetWidth - e.x}px`;
}
resize({ x: 250 })

export default true
