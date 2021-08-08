const { ImageFill } = require('scenegraph')
const uxp = require('uxp')
const fs = uxp.storage.localFileSystem
const formats = uxp.storage.formats

const xhrBinary = (url) => {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest()
    
    req.onload = () => {
      if (req.status === 200) {
        try {
          const arr = new Uint8Array(req.response)
          resolve(arr)
        } catch (err) {
          reject(`Couldn't parse response. ${err.message}, ${req.response}`)
        } 
      } else {
        reject(`Request had an error: ${req.status}`)
      }
    }

    req.onerror = reject
    req.onabort = reject

    req.open('GET', url, true)
    
    req.responseType = 'arraybuffer'
    
    req.send()
  })
}

const applyImageFill = (selection, file) => {
  const imageFill = new ImageFill(file)
  selection.items[0].fill = imageFill
}

const downloadImage = async (selection, jsonResponse) => {
  try {
    const photoUrl = jsonResponse.message
    const photoObj = await xhrBinary(photoUrl)
    const tempFolder = await fs.getTemporaryFolder()
    const tempFile = await tempFolder.createFile('tmp', { overwrite: true })
    await tempFile.write(photoObj, { format: formats.binary })
    applyImageFill(selection, tempFile)
  } catch (err) {
    console.log('error')
    console.log(err.message)
  }
}

const applyImage = (selection) => {
  if (selection.items.length) {
    return fetch('https://dog.ceo/api/breeds/image/random')
      .then(response => response.json())
      .then(jsonResponse => downloadImage(selection, jsonResponse))
  }
}

module.exports = {
  commands: {
    applyImage
  }
}