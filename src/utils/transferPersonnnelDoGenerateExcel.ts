import { IGenerateData, ISheet } from '@/typings/excelColumn'
import { generateData } from '@/enums/excelColumn'
import _ from 'lodash'
import { ipcRenderer } from 'electron'

import { saveFile, writeFile } from '@/listener'
import { generateExcelData } from '@/enums/generateExcelColumn'

import xlsx from 'node-xlsx'

export function doGenerateOriginalData(list: any[][]) {
  const sheetData: any[] = []

  sheetData.push([
    '姓名',
    '性别',
    '身份证',
    '联系方式',
    '街道',
    '小区',
    '楼号、单元号、房间号',
    '备注'
  ])

  _.forEach(list, (item) => {
    sheetData.push([
      item[generateExcelData.name],
      item[generateExcelData.gender],
      item[generateExcelData.idCard],
      item[generateExcelData.contact],
      item[generateExcelData.street],
      item[generateExcelData.community],
      item[generateExcelData.residenceInfo],
      item[generateExcelData.remarks]
    ])
  })

  saveFile(
    xlsx.build([
      {
        name: '总表',
        data: sheetData
      }
    ])
  )
}

/**
 * 生成数据
 * @param list
 */
export function doGenerateData(list: IGenerateData[]) {
  const sheetData: ISheet[] = []

  _.forEach(list, (item) => {
    const title = item.community
    const index = _.findIndex(sheetData, { title })

    if (~index) {
      // 没有该楼号 则添加
      if (
        !_.has(sheetData[index].building, item.residenceInfo.buildingNumber)
      ) {
        sheetData[index].building[item.residenceInfo.buildingNumber] = {}
      }

      // 没有该单元 则添加
      if (
        !_.has(
          sheetData[index].building[item.residenceInfo.buildingNumber],
          item.residenceInfo.unitNumber
        )
      ) {
        sheetData[index].building[item.residenceInfo.buildingNumber][
          item.residenceInfo.unitNumber
        ] = {}
      }

      // 没有该房间号 则添加
      if (
        !_.has(
          sheetData[index].building[item.residenceInfo.buildingNumber][
            item.residenceInfo.unitNumber
          ],
          item.residenceInfo.roomNumber
        )
      ) {
        sheetData[index].building[item.residenceInfo.buildingNumber][
          item.residenceInfo.unitNumber
        ][item.residenceInfo.roomNumber] = []
      }

      const info = _.find(
        sheetData[index].building[item.residenceInfo.buildingNumber][
          item.residenceInfo.unitNumber
        ][item.residenceInfo.roomNumber],
        {
          idCard: item.idCard
        }
      )

      // 避免重复添加
      if (!info) {
        // 添加住户信息
        sheetData[index].building[item.residenceInfo.buildingNumber][
          item.residenceInfo.unitNumber
        ][item.residenceInfo.roomNumber].push({
          name: item.name,
          gender: item.gender,
          idCard: item.idCard,
          contact: item.contact,
          remarks: item.remarks,
          unitNumber: item.residenceInfo.unitNumber
        })
      }
    } else {
      sheetData.push({
        title,
        building: {
          [item.residenceInfo.buildingNumber]: {
            [item.residenceInfo.unitNumber]: {
              [item.residenceInfo.roomNumber]: [
                {
                  name: item.name,
                  gender: item.gender,
                  idCard: item.idCard,
                  contact: item.contact,
                  remarks: item.remarks,
                  unitNumber: item.residenceInfo.unitNumber
                }
              ]
            }
          }
        }
      })
    }
  })

  const excel: {
    name: string
    sheet: { name: string; data: any[][]; options?: {} | undefined }[]
  }[] = []

  _.forEach(sheetData, (data) => {
    const commonLine: any[][] = [
      // 第一行
      [data.title],

      // 表头
      ['姓名', '性别', '身份证', '联系方式', '单元', '门牌号', '备注']
    ]

    const sheets = []

    _.forEach(data.building, (units, buildingNumber) => {
      let currentIndex = 0

      // 每个栋楼一个 sheet
      const sheet = [[`${commonLine[0][0]} ${buildingNumber}幢`], commonLine[1]]

      // 表格合并数据
      const merges = []
      // 合并第一行
      merges.push({
        s: { c: 0, r: 0 },
        e: { c: 6, r: 0 }
      })

      // 单元
      _.forEach(units, (unit, unitNumber) => {
        // 合并单元
        const countUnits = _.reduce(
          _.keys(unit),
          (result, unitKey) => {
            result += unit[unitKey].length
            return result
          },
          0
        )

        if (countUnits > 1) {
          // 同一单元 大于1条数据的 单元合并
          merges.push({
            s: { c: generateData.unitNumber, r: currentIndex + 2 },
            e: { c: generateData.unitNumber, r: countUnits + currentIndex + 1 }
          })
        }

        // 房间
        _.forEach(unit, (rooms, roomNumber) => {
          if (rooms.length > 1) {
            // 同一房间号 大于1条数据的 房间号合并
            merges.push({
              s: { c: generateData.roomNumber, r: currentIndex + 2 },
              e: {
                c: generateData.roomNumber,
                r: rooms.length + currentIndex + 1
              }
            })
          }

          _.forEach(rooms, (room) => {
            sheet.push([
              room.name,
              room.gender,
              room.idCard,
              `${room.contact}`.trim(),
              unitNumber,
              roomNumber,
              room.remarks
            ])

            currentIndex++
          })
        })
      })

      sheets.push({
        name: `${data.title} ${buildingNumber}幢`,
        data: sheet,
        options: {
          '!merges': merges
        }
      })
    })

    excel.push({
      name: data.title,
      sheet: sheets
    })
  })

  if (ipcRenderer) {
    ipcRenderer.send('writeFile', excel)
  } else {
    writeFile(excel)
  }
}
