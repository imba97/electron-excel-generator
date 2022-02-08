import { ipcMain } from 'electron'
const dialog = require('electron').dialog
import fs from 'fs'
import _ from 'lodash'
import xlsx from 'node-xlsx'

export default class Listener {
  public static start() {
    ipcMain.on('saveFile', (e, filename, buffer) => {
      dialog
        .showSaveDialog({
          title: '请选择要保存的文件名',
          buttonLabel: '保存',
          filters: [{ name: '表格', extensions: ['xlsx'] }]
        })
        .then((result) => {
          if (!result.canceled)
            fs.writeFileSync(result.filePath, buffer, 'binary')
        })
        .catch((err) => {
          console.log(err)
        })
    })

    ipcMain.on('writeFile', (e, excelData) => {
      dialog
        .showOpenDialog({
          title: '请选择表格文件保存的文件夹',
          buttonLabel: '选择',
          properties: ['openDirectory']
        })
        .then((result) => {
          if (!result.canceled) {
            const dir = result.filePaths[0].replace(/\\\\/g, '/')
            console.log(excelData)
            _.forEach(excelData, (data) => {
              const buffer = xlsx.build(data.sheet)
              fs.writeFileSync(
                `${dir}/${data.name}.xlsx`,
                buffer as any,
                'binary'
              )
            })
          }
        })
    })

    ipcMain.on('getXlsx', (e, path: string) => {
      return new Promise((resolve, reject) => {
        resolve(xlsx.parse(path))
      })
    })
  }
}
