/**
 * 蓝天救援队 疫情 转运人员统计
 */
import { originalData } from '@/enums/excelColumn'
import { IGenerateData, IResidenceInfo } from '@/typings/excelColumn'
import _ from 'lodash'

export default class TransferPersonnel {
  /**
   * 数据列表
   */
  private _list: IGenerateData[] = []

  /**
   * 程序无法分辨住所的数据列表
   */
  private _noResidenceInfoList: any[] = []

  constructor(data: any[]) {
    _.forEach(data, (item, index) => {
      // 过滤前两行
      if (index <= 1) return true

      const residenceInfo = this.getResidenceInfo(
        item[originalData.residenceInfo]
      )

      if (residenceInfo) {
        this._list.push({
          name: item[originalData.name],
          gender: item[originalData.gender],
          idCard: item[originalData.idCard],
          contact: item[originalData.contact],
          community: _.trim(item[originalData.community]),
          residenceInfo: residenceInfo,
          remarks: item[originalData.remarks] || ''
        })
      } else {
        // 原始数据
        this._noResidenceInfoList.push(item)
      }
    })
  }

  /**
   * 获取 数据列表
   */
  public getList() {
    return this._list
  }

  /**
   * 获取 程序无法分辨住所的数据列表
   */
  public getNoResidenceInfoList() {
    return this._noResidenceInfoList
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

/**
 * 转运人员数据类型
 */
export enum transferPersonnelType {
  /**
   * 区内
   */
  inner,

  /**
   * 区外
   */
  external
}
