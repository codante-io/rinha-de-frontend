onmessage = function(e) {
  const file = e.data    
  const reader = new FileReader()
  reader.readAsText(file)
  reader.onload = function() {
    postMessage({
      name: file.name,
      json: reader.result,
    })
  }
  reader.onerror = function() {
    throw new Error('Error reading file')
  }
}