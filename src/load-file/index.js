const loadJsonFile = document.querySelector("#upload-file-json")

loadJsonFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const invalidFile = file.type !== "application/json"
  if (invalidFile) showErrorMessage();

  const reader = new FileReader()
  reader.readAsText(file)
  reader.onload = function() {
    showJsonTreeViewer(file.name, reader.result)
  }
  reader.onerror = function() {
    showErrorMessage()
  }
})

function showErrorMessage() {
  const filefield = document.querySelector('.filefield')
  const input = document.querySelector('#upload-file-json')

  filefield.classList.add('filefield--invalid')
  input.setAttribute('aria-describedby', "invalid-file-error")
  input.setAttribute('aria-invalid', "true")
}

function showJsonTreeViewer(filename, json) {
  const content = document.querySelector('.content')
  const jsonTreeViewer = document.querySelector("#json-tree-viewer")
  const jsonFileName = document.querySelector("#json-file-name")

  content.classList.remove('content--presentation')
  content.classList.add('content--treeviewer')
  
  jsonFileName.innerHTML = filename
  jsonTreeViewer.innerHTML = parseJson(json)
}

function parseJson(json) {
  console.log(JSON.parse(json))
  return JSON.stringify(json)
}