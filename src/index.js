
const concat = require('concat-stream')
const gunzip = require('gunzip-maybe')
const MemoryFs = require('memory-fs')
const fileType = require('file-type')
const { dirname } = require('path')
const tar = require('tar')
const fs = require('fs')

module.exports = untarToMemory

function untarToMemory (file) {
  const mfs = new MemoryFs()

  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(gunzip())
      .pipe(tar.Parse())
      .on('entry', (entry) => {
        const path = '/' + entry.props.path
        mfs.mkdirpSync(dirname(path))

        entry.pipe(concat((buf) => {
          const encoding = fileType(buf) ? 'binary' : 'utf8'
          mfs.writeFileSync(path, buf, encoding)
        }))
      })
      .on('end', () => resolve(mfs))
      .on('error', reject)
  })
}