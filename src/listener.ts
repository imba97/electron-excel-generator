import { ipcMain } from 'electron';
const dialog = require('electron').dialog;
import fs from 'fs';
import xlsx from 'node-xlsx';

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
            fs.writeFileSync(result.filePath, buffer, 'binary');
        })
        .catch((err) => {
          console.log(err);
        });
    });

    ipcMain.on('getXlsx', (e, path: string) => {
      return new Promise((resolve, reject) => {
        resolve(xlsx.parse(path));
      });
    });
  }
}
