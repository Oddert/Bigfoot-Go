import fs from 'fs'
import path from 'path'

const dirname = path.resolve(path.dirname(''))

const readFile = (path, opts = 'utf8') =>
    new Promise((resolve, reject) => {
        fs.readFile(path, opts, (err, data) => {
            if (err) reject(err)
            else resolve(data)
        })
    })

export const getGeneratedBfootDataList = (cb) => {
    fs.readdir(path.join(dirname, './data/bfoot-datasets/csv/'), async (err, files) => {
        const converted = []
        for (let file of files) {
            const item = await readFile(`./data/bfoot-datasets/csv/${file}`)
            const jsonObj = []
        
            const bufferString = item.toString()
            const arr = bufferString.split('\n')
            const headers = arr[0].split(',')
            
            for(let i = 1; i < arr.length; i++) {
                const _data = arr[i].split(',')
                const obj = {}
                for(let j = 0; j < _data.length; j++) {
                    obj[headers[j].trim()] = _data[j].trim()
                }
                jsonObj.push(obj)
            }
        
            converted.push(jsonObj)

        }
        cb(converted, files)
    })
}
