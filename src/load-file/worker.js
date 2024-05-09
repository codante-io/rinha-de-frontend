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
    const r = []
    jsonToArray(Array.isArray(jsonParsed) ? jsonParsed.map((j, i) => [`${i}`, [j]]) : Object.entries(jsonParsed), '', r)
    postMessage({
      name: file.name,
      jsonEntries: Object.entries(jsonParsed),
    })
  }
  reader.onerror = function() {
    throw new Error('Error reading file')
  }
}

function jsonToArray(entries, p, r) {
  for (const [k, v] of entries) {
    if (typeof v !== 'object' || v === null) {
      r.push({ type: getType(v), name: k, value: v, path: `${p}.${k}` })
      continue
    }

    const path = p && p !== k ? `${p}.${k}` : ''
    const newPath = p && !path ? k : path
    const isArray = Array.isArray(v)
    if (isArray && v.length === 0) {
      r.push({ type: 'ARRAY', name: k, path, empty: true })
    } else {
      r.push({ type: isArray ? "ARRAY" : 'OBJECT', name: k, path: newPath })    
      jsonToArray(Object.entries(v), path || k, r)
      r.push({ type: 'END', path: newPath })
    }
  }
}

function getType(value) {
  if (typeof value === 'string') return 'STRING';
  if (typeof value === 'number') return 'NUMBER';
  if (typeof value === 'boolean') return 'BOOLEAN';
  
  return 'NULLABLE';
}

function parseJson(json) {
  try {
    return [JSON.parse(json), undefined]
  } catch (e) {
    return [undefined, e]
  }
}