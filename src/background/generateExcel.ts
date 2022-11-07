import { IGenerateData } from '@/typings/excelColumn'
import TransferPersonnelGenerateExcel from '@/utils/transferPersonnelGenerateExcel'
import {
  doGenerateData,
  doGenerateOriginalData
} from '@/utils/transferPersonnnelDoGenerateExcel'
import fs from 'fs'
import _ from 'lodash'
import xlsx from 'node-xlsx'

export default class GenerateExcel {
  static paths: string[] = []

  static list: IGenerateData[] = []
  static noResidenceInfoList: any[] = []

  static load(path: string) {
    GenerateExcel.paths = []
    GenerateExcel.readdir(path)

    // 循环每个文件夹
    _.forEach(GenerateExcel.paths, (file) => {
      const excel = xlsx.parse(file)

      // 循环读取数据
      _.forEach(excel, (sheet) => {
        // 只查找 区外集中隔离解除人员转运信息表
        // _.get(sheet.data, '0.0', '').trim() === '区外集中隔离解除人员转运信息表'

        if (
          !_.isEmpty(sheet.data) &&
          // 只查找 区外集中隔离解除人员转运信息表
          _.get(sheet.data, '0', []).some(
            (item) => item === '区外集中隔离解除人员转运信息表'
          )
        ) {
          console.log(sheet.name)
          GenerateExcel.getData(sheet.data)
        }
      })
    })

    // let count = 0
    // GenerateExcel.paths.map((p) => {
    //   const sp = p.split('/')
    //   const reg = /(\d+)人/.exec(sp[sp.length - 1])
    //   if (reg) {
    //     console.log(reg)
    //     count += parseInt(reg[1])
    //   } else {
    //     console.log(sp[sp.length - 1])
    //   }
    //   return sp[sp.length - 1]
    // })

    // console.log('最终', count)

    // 文件名
    // GenerateExcel.paths.map((p) => {
    //   const sp = p.split('/')
    //   return sp[sp.length - 1]
    // })

    // console.log(TransferPersonnelGenerateExcel.originalList.length)

    doGenerateOriginalData(TransferPersonnelGenerateExcel.originalList)

    // fs.writeFileSync(
    //   'C:/Users/imba97/Desktop/all.json',
    //   JSON.stringify(TransferPersonnelGenerateExcel.list),
    //   'utf-8'
    // )

    // 生成表格
    // doGenerateData(GenerateExcel.list)
  }

  private static getData(data: any[][]) {
    new TransferPersonnelGenerateExcel(data)

    // GenerateExcel.list = _.concat(GenerateExcel.list, instance.getList())
    // GenerateExcel.noResidenceInfoList = _.concat(
    //   GenerateExcel.list,
    //   instance.getNoResidenceInfoList()
    // )
  }

  private static readdir(path: string) {
    const pa = fs.readdirSync(path)
    pa.forEach((ele) => {
      var info = fs.statSync(`${path}/${ele}`)
      if (info.isDirectory()) {
        GenerateExcel.readdir(`${path}/${ele}`)
      } else {
        GenerateExcel.paths.push(`${path.replaceAll('\\', '/')}/${ele}`)
      }
    })
  }
}
