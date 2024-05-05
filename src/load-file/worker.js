onmessage = function(e) {
  const file = e.data    
  const reader = new FileReader()
  reader.readAsText(file)

  reader.onload = function(event) {
    const result = event.target.result;
    const [jsonParsed, error] = parseJson(result)
    if (error) {
      throw new Error('Error on parsing json')
    }

    postMessage({
      name: file.name,
      jsonEntries: Object.entries(jsonParsed),
    })
  }
  reader.onerror = function() {
    throw new Error('Error reading file')
  }
}

function parseJson(json) {
  try {
    return [JSON.parse(json), undefined]
  } catch (e) {
    return [undefined, e]
  }
}