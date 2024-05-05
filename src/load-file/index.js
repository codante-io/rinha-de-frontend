const loadJsonFile = document.querySelector("#upload-file-json")

const worker = new Worker("src/load-file/worker.js");

loadJsonFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const invalidFile = file.type !== "application/json"
  if (invalidFile) showErrorMessage();

  worker.postMessage(file);
})

worker.onmessage = function(event) {
  const { name, json } = event.data
  showJsonTreeViewer(name, json)
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

function showJsonTreeViewer(filename, json) {
  const [jsonParsed, error] = parseJson(json)
  if (error) {
    showErrorMessage();
    return
  }

  const content = document.querySelector('.content')
  const jsonTreeViewer = document.querySelector("#json-tree-viewer")
  const jsonFileName = document.querySelector("#json-file-name")

  content.classList.remove('content--presentation')
  content.classList.add('content--treeviewer')
  
  jsonFileName.innerHTML = filename
  jsonTreeViewer.innerHTML = parseJsonToHtml(jsonParsed)
}

function parseJson(json) {
  try {
    return [JSON.parse(json), undefined]
  } catch (e) {
    return [undefined, e]
  }
}

function parseJsonToHtml(json, fromArray) {
  let innerHtml = ""
  if (typeof json !== 'object') {
    return json
  }

  const e = Object.entries(json)

  for (const [k, v] of e) {
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
          ${parseJsonToHtml(v, true)}
        </details>
      `
      continue
    }

    innerHtml += `
      <details class="tree__obj" open>
        <summary class="${fromArray ? "tree__position" : "tree__key"}">
          ${k}:
        </summary>
        ${parseJsonToHtml(v)}
      </details>
    `
  }

  return innerHtml;
}