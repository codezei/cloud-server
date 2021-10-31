const fs = require('fs')
const File = require('../models/File')
const config = require("config")

class FileService {
    createDir(file) {
        const filePath = this.getPath(file)
        //первая часть это путь к папке files
        //вторая часть это название папки по id пользователя, которая будет созданная для каждого
        //file.path ???это отностильеный путь файла. Если этот файл находиться в корневой папке то этот путь будет пустым
        return new Promise((resolve, reject)=>{
            try {
                if (!fs.existsSync(filePath)) {
                    //если файл по такому пути существует тогда будем создавать папку
                    fs.mkdirSync(filePath)
                    return resolve({message: "File was created"})
                } else {
                    return reject({message: "File already exist"})
                }

            } catch (e) {
                return reject({message: 'File error'})
            }
        })
    }
    deleteFile(file) {
        const path = this.getPath(file)

        if (file.type === 'dir') {
            fs.rmdirSync(path)
        } else {
            fs.unlinkSync(path)
        }
    }
    getPath(file) {
        return `${config.get('filePath')}\\${file.user}\\${file.path}`
    }
}

module.exports = new FileService()