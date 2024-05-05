const LINE_HEIGHT = 28
const EXTRA_LINES = 2

const uploadJsonFileEl = document.querySelector("#upload-file-json")
const contentEl = document.querySelector('.content')
const jsonFileNameEl = document.querySelector("#json-file-name")
const jsonTreeViewerEl = document.querySelector("#json-tree-viewer")

const worker = new Worker("src/load-file/worker.js");

uploadJsonFileEl.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const invalidFile = file.type !== "application/json"
  if (invalidFile) showErrorMessage();

  worker.postMessage(file);
})

worker.onmessage = function(event) {
  const { name, jsonEntries } = event.data
  showJsonTreeViewer(name, jsonEntries)
}

worker.onmessageerror = function() {
  showErrorMessage()
}

function showErrorMessage() {
  const filefield = document.querySelector('.filefield')
  const input = document.querySelector('#upload-file-json')

  filefield.classList.add('filefield--invalid')
  input.setAttribute('aria-describedby', "invalid-file-error")
  input.setAttribute('aria-invalid', "true")
}

function showJsonTreeViewer(filename, entries) {
  contentEl.classList.remove('content--presentation')
  contentEl.classList.add('content--treeviewer')
  
  jsonFileNameEl.innerHTML = filename
  jsonTreeViewerEl.innerHTML = renderEntries(entries)
}

function renderEntries(entries, fromArray) {
  let innerHtml = ""

  for (const [k, v] of entries) {
    const isNullable = v === null || v === undefined
    const simpleObj = typeof v !== 'object' || isNullable
    if (simpleObj) {
      innerHtml += `<div class="${fromArray ? 'tree__position' : 'tree__key'} tree__inline">
        ${k}: <span class="tree__value ${isNullable ? "tree__nullable" : ""}">${v}</span>
      </div>`
      continue
    }   

    const isArr = Array.isArray(v)
    const emptyArr = isArr && !v.length
    if (emptyArr) {
      innerHtml += `<div class="${fromArray ? 'tree__position' : 'tree__key'} tree__inline">
        ${k}: <span class="tree__value tree__emptyArr">[]</span>
      </div>`
      continue
    } 
    
    if (isArr) {
      innerHtml += `
        <details class="tree__arr" open>
        <summary class="${fromArray ? "tree__position" : "tree__key"}">
            ${k}:
          </summary>
          ${renderEntries(Object.entries(v), true)}
        </details>
      `
      continue
    }

    innerHtml += `
      <details class="tree__obj" open>
        <summary class="${fromArray ? "tree__position" : "tree__key"}">
          ${k}:
        </summary>
        ${renderEntries(Object.entries(v))}
      </details>
    `
  }

  return innerHtml;
}