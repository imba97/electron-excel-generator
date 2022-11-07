import { ipcMain } from 'electron'
const dialog = require('electron').dialog
import fs from 'fs'
import _ from 'lodash'
import xlsx from 'node-xlsx'
import GenerateExcel from '@/background/generateExcel'

export default class Listener {
  public static start() {
    ipcMain.on('saveFile', (e, filename, buffer) => {
      saveFile(buffer)
    })

    ipcMain.on('writeFile', (e, excelData) => {
      writeFile(excelData)
    })

    ipcMain.on('getXlsx', (e, path: string) => {
      return new Promise((resolve, reject) => {
        resolve(xlsx.parse(path))
      })
    })

    // 读取文件夹 遍历里面用得到的表格
    ipcMain.on('generateExcel', (e, path: string) => {
      GenerateExcel.load(path)
    })
  }
}

export function saveFile(buffer: any) {
  dialog
    .showSaveDialog({
      title: '请选择要保存的文件名',
      buttonLabel: '保存',
      filters: [{ name: '表格', extensions: ['xlsx'] }]
    })
    .then((result) => {
      if (!result.canceled) fs.writeFileSync(result.filePath, buffer, 'binary')
    })
    .catch((err) => {
      console.log(err)
    })
}

export function writeFile(excelData: any[]) {
  dialog
    .showOpenDialog({
      title: '请选择表格文件保存的文件夹',
      buttonLabel: '选择',
      properties: ['openDirectory']
    })
    .then((result) => {
      if (!result.canceled) {
        const dir = result.filePaths[0].replace(/\\\\/g, '/')
        _.forEach(excelData, (data) => {
          const buffer = xlsx.build(data.sheet)
          fs.writeFileSync(`${dir}/${data.name}.xlsx`, buffer as any, 'binary')
        })
      }
    })
}
