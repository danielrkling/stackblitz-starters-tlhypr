export default function Div(config: {
  className?: string
  parent?: HTMLElement
  innerHTML?: string
  children?: HTMLElement[]
  listeners?: { type: keyof HTMLElementEventMap, listener: EventListener }[]
}) {
  const div = document.createElement('div');

  if (!config) {
    return div;
  }

  div.className = config.className ?? '';
  if (config.listeners) {
    for (const listener of config.listeners) {
      div.addEventListener(listener.type, listener.listener)
    }
  }

  if (config.innerHTML) {
    div.innerHTML = config.innerHTML
  }

  if (config.children) {
    for (const child of config.children) {
      div.appendChild(child);
    }
  }

  if (config.parent) {
    config.parent.appendChild(div)
  }

  return div

}

