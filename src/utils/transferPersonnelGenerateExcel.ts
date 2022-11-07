/**
 * 蓝天救援队 疫情 转运人员统计
 */
import { generateExcelData } from '@/enums/generateExcelColumn'
import { IGenerateData, IResidenceInfo } from '@/typings/excelColumn'
import _ from 'lodash'

export default class TransferPersonnelGenerateExcel {
  /**
   * 数据列表
   */
  static list: IGenerateData[] = []

  static idCards: string[] = []
  static originalList: any[] = []

  /**
   * 程序无法分辨住所的数据列表
   */
  static noResidenceInfoList: any[] = []

  constructor(data: any[]) {
    _.forEach(data, (item, index) => {
      // 身份证号不对
      if (!/\d{18}/.test(_.trim(item[generateExcelData.idCard]))) {
        return true
      }

      // 避免重复添加
      if (
        !~TransferPersonnelGenerateExcel.idCards.indexOf(
          item[generateExcelData.idCard]
        )
      ) {
        // 添加身份证
        TransferPersonnelGenerateExcel.idCards.push(
          item[generateExcelData.idCard]
        )

        // 添加信息
        TransferPersonnelGenerateExcel.originalList.push(item)
      }

      // 过滤前 4 行 和 最后一行 带有签名的一行
      // if (index < 4 || /签名/.test(_.get(item, '0', ''))) {
      //   return true
      // }

      // const residenceInfo = this.getResidenceInfo(
      //   item[generateExcelData.residenceInfo]
      // )

      // if (residenceInfo) {
      //   const info = _.find(TransferPersonnelGenerateExcel.list, {
      //     idCard: item[generateExcelData.idCard]
      //   })

      //   // 避免重复添加
      //   if (!info) {
      //     TransferPersonnelGenerateExcel.list.push({
      //       name: item[generateExcelData.name],
      //       gender: item[generateExcelData.gender],
      //       idCard: item[generateExcelData.idCard],
      //       contact: item[generateExcelData.contact],
      //       community: _.trim(item[generateExcelData.community]),
      //       residenceInfo: residenceInfo,
      //       remarks: item[generateExcelData.remarks] || ''
      //     })
      //   }
      // } else {
      //   // 原始数据
      //   // TransferPersonnelGenerateExcel.noResidenceInfoList.push(item)
      // }
    })
  }

  /**
   * 获取 数据列表
   */
  public getList() {
    return TransferPersonnelGenerateExcel.list
  }

  /**
   * 获取 程序无法分辨住所的数据列表
   */
  public getNoResidenceInfoList() {
    return TransferPersonnelGenerateExcel.noResidenceInfoList
  }

  /**
   * 获取住所信息
   */
  private getResidenceInfo(residenceInfo: string): IResidenceInfo | null {
    // 楼号-单元号-房间号
    const case1 = /(\d+)(?:-|—|一)(\d+)(?:-|—|一)(\d+)/
    // 楼号 单元号 房间号
    const case2 = /(\d+)(?:幢|栋|号楼)(\d+)单元(\d+)(?:室|号)?/
    // 楼号 房间号
    const case3 = /(\d+)(?:幢|栋)(\d+)室?/
    // 楼号-房间号
    const case4 = /(\d+)(?:-|—)(\d+)/

    if (case1.test(residenceInfo)) {
      const residenceInfoReg = case1.exec(residenceInfo)

      return {
        buildingNumber: residenceInfoReg[1],
        unitNumber: residenceInfoReg[2],
        roomNumber: residenceInfoReg[3]
      }
    } else if (case2.test(residenceInfo)) {
      const residenceInfoReg = case2.exec(residenceInfo)

      return {
        buildingNumber: residenceInfoReg[1],
        unitNumber: residenceInfoReg[2],
        roomNumber: residenceInfoReg[3]
      }
    } else if (case3.test(residenceInfo)) {
      const residenceInfoReg = case3.exec(residenceInfo)

      return {
        buildingNumber: residenceInfoReg[1],
        unitNumber: '1',
        roomNumber: residenceInfoReg[2]
      }
    } else if (case4.test(residenceInfo)) {
      const residenceInfoReg = case4.exec(residenceInfo)

      return {
        buildingNumber: residenceInfoReg[1],
        unitNumber: '1',
        roomNumber: residenceInfoReg[2]
      }
    }
  }
}
