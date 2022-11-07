<style scoped lang="scss">
* {
  margin: 0;
  padding: 0;
}

.dropBox {
  position: absolute;
  top: 0;
  left: 0;
  width: 80%;
  height: 40%;

  background-color: #f0f0f0;

  .drop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: 10;
  }

  p {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 100%;
    transform: translate(-50%, -50%);
    font-size: 2rem;
    z-index: 1;
  }
}

.control {
  position: absolute;
  top: 40%;
  left: 0;

  width: 80%;
  height: 100px;
  background-color: #ccc;

  div {
    width: 100%;
    height: 50px;
    line-height: 50px;
    text-align: center;

    font-size: 20px;
    cursor: pointer;
    user-select: none;

    &:hover {
      background-color: #666;
      color: #fff;
    }
  }

  .button {
    background-color: #ccc;
  }
}
</style>

<template>
  <div class="home">
    <div class="dropBox">
      <div v-show="!loaded">
        <p>拖拽到此处</p>
        <div class="drop"></div>
      </div>
      <div v-show="loaded">
        <p>读取成功</p>
      </div>
    </div>

    <div v-show="loaded" class="control">
      <div
        class="button"
        @click="generateNoResidenceInfoList"
      >下载需要手动统计表格 {{ noResidenceInfoList.length }}</div>

      <div class="button" @click="generateData">生成表格</div>
      <div class="button" @click="back">返回</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import xlsx from 'node-xlsx'
import _ from 'lodash'
import $ from 'jquery'

import { ipcRenderer } from 'electron';
import { IGenerateData, ISheet } from '@/typings/excelColumn'
import TransferPersonnel from '@/utils/transferPersonnel'
import { generateData } from '@/enums/excelColumn'

@Component({
  components: {}
})
export default class Home extends Vue {

  public loaded = false

  private currentDropBox: JQuery<HTMLElement>;

  public list: IGenerateData[] = []
  public noResidenceInfoList: any[] = []

  public mounted() {
    // test

    _.forEach(document.querySelectorAll('.drop'), (drop: Element | null) => {
      if (drop) {
        // 热更新原因 先移除
        drop.removeEventListener('dragenter', this.onDrag);
        drop.removeEventListener('dragover', this.onDragover);
        drop.removeEventListener('dragleave', this.onDragLeave);
        drop.removeEventListener('drop', this.onDrop);

        drop.addEventListener('dragenter', this.onDrag, false);
        drop.addEventListener('dragover', this.onDragover, false);
        drop.addEventListener('dragleave', this.onDragLeave, false);
        drop.addEventListener('drop', this.onDrop, false);
      }
    });
    document.removeEventListener('mouseleave', this.onDragLeave);
    document.addEventListener('mouseleave', this.onDragLeave, false);
  }

  private onDrag(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.currentDropBox = $(e.target).parents('.dropBox');
    this.currentDropBox.css('background-color', '#F66')
  }

  private onDragover(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    if (
      (e.target as HTMLElement).getAttribute('class') !== null &&
      (e.target as HTMLElement).getAttribute('class').indexOf('drop') !== -1
    ) {
      this.currentDropBox = $(e.target).parents('.dropBox');
      this.currentDropBox.css('background-color', '#F66')
    }
  }

  private onDragLeave(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if (!this.currentDropBox) {
      return;
    }
    this.currentDropBox.css('background-color', '')
    this.currentDropBox = null;
  }

  private async onDrop(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if (
      $(e.target).parents('.dropBox')[0] !== this.currentDropBox[0] &&
      this.currentDropBox !== null
    ) {
      this.currentDropBox.css('background-color', '')
      this.currentDropBox = null;
      return;
    } else {
      this.currentDropBox.css('background-color', '')
    }

    const drag = e as DragEvent;

    if (drag.dataTransfer === null) {
      return;
    }

    // 拿到拖拽文件
    const files = drag.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      const path = drag.dataTransfer.files.item(i)!.path;

      if (/read$/.test(path)) {
        console.log('文件夹')
        ipcRenderer.send('generateExcel', path)
        return
      }

      if (!/\.xlsx?$/.test(path)) {
        return;
      }

      // 如果是表格 读取
      const table = xlsx.parse(path);

      let list = []
      let noResidenceInfoList = []

      _.forEach(table, item => {
        const instance = new TransferPersonnel(item.data)
        list = _.concat(list, instance.getList())
        noResidenceInfoList = _.concat(noResidenceInfoList, instance.getNoResidenceInfoList())
      })

      this.list = list
      this.noResidenceInfoList = noResidenceInfoList

      this.loaded = true

    }
  }

  public generateData() {
    const sheetData: ISheet[] = []

    _.forEach(this.list, item => {
      const title = item.community
      const index = _.findIndex(sheetData, { title })

      if (~index) {
        // 没有该楼号 则添加
        if (!_.has(sheetData[index].building, item.residenceInfo.buildingNumber)) {
          sheetData[index].building[item.residenceInfo.buildingNumber] = {}
        }

        // 没有该单元 则添加
        if (!_.has(sheetData[index].building[item.residenceInfo.buildingNumber], item.residenceInfo.unitNumber)) {
          sheetData[index].building[item.residenceInfo.buildingNumber][item.residenceInfo.unitNumber] = {}
        }

        // 没有该房间号 则添加
        if (!_.has(sheetData[index].building[item.residenceInfo.buildingNumber][item.residenceInfo.unitNumber], item.residenceInfo.roomNumber)) {
          sheetData[index].building[item.residenceInfo.buildingNumber][item.residenceInfo.unitNumber][item.residenceInfo.roomNumber] = []
        }

        // 添加住户信息
        sheetData[index].building[item.residenceInfo.buildingNumber][item.residenceInfo.unitNumber][item.residenceInfo.roomNumber].push({
          name: item.name,
          gender: item.gender,
          idCard: item.idCard,
          contact: item.contact,
          remarks: item.remarks,
          unitNumber: item.residenceInfo.unitNumber
        })

      } else {
        sheetData.push({
          title,
          building: {
            [item.residenceInfo.buildingNumber]: {
              [item.residenceInfo.unitNumber]: {
                [item.residenceInfo.roomNumber]: [{
                  name: item.name,
                  gender: item.gender,
                  idCard: item.idCard,
                  contact: item.contact,
                  remarks: item.remarks,
                  unitNumber: item.residenceInfo.unitNumber
                }]
              }
            }
          }
        })
      }
    })

    const excel: { name: string, sheet: { name: string; data: any[][]; options?: {} | undefined }[] }[] = []

    _.forEach(sheetData, data => {

      const commonLine: any[][] = [
        // 第一行
        [data.title],

        // 表头
        [
          '姓名',
          '性别',
          '身份证',
          '联系方式',
          '单元',
          '门牌号',
          '备注'
        ]
      ]

      const sheets = []

      _.forEach(data.building, (units, buildingNumber) => {
        let currentIndex = 0

        // 每个栋楼一个 sheet
        const sheet = [
          [`${commonLine[0][0]} ${buildingNumber}幢`],
          commonLine[1]
        ]

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
          const countUnits = _.reduce(_.keys(unit), (result, unitKey) => {
            result += unit[unitKey].length
            return result
          }, 0)

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
                e: { c: generateData.roomNumber, r: rooms.length + currentIndex + 1 }
              })
            }

            _.forEach(rooms, room => {
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

    ipcRenderer.send('writeFile', excel);
  }

  generateNoResidenceInfoList() {
    // 构造生成表格数据 簿
    const sheet: Array<{ name: string; data: any[][]; options?: {} | undefined }> = [];

    const sheetData = [
      // 表头
      [
        '序号',
        '所在区',
        '隔离酒店',
        '房号',
        '入住时间',
        '姓名',
        '性别',
        '身份证号',
        '联系电话',
        '拟居家街道',
        '拟居家社区及小区',
        '拟居家所在楼栋、单元、房间号',
        '备注',
        '解除隔离日期'
      ],

      ...this.noResidenceInfoList.map(item => item.map((val: string) => `${val}`))
    ]

    sheet.push({
      name: '需要手动统计',
      data: sheetData
    })

    const buffer = xlsx.build(sheet);

    ipcRenderer.send('saveFile', '需要手动统计表格', buffer);
  }

  public back() {
    this.loaded = false
    this.list = []
    this.noResidenceInfoList = []
  }
}
</script>
