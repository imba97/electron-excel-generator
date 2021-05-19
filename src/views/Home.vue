<template>
  <div class="home">
    <div id="smallCar" class="dropBox">
      <p>小车</p>
      <div class="drop"></div>
    </div>
    <div id="bigCar" class="dropBox">
      <p>大车</p>
      <div class="drop"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import xlsx from 'node-xlsx';
import Car from '@/utils/car';
import { getMonthByFilename, getDayByDate } from '@/utils/date';
import _ from 'lodash';

import { ipcRenderer } from 'electron';

@Component({
  components: {}
})
export default class Home extends Vue {
  public dropBoxStyle = {
    backgroundColor: '#666'
  };

  private currentDropBox: HTMLElement;

  public mounted() {
    // test

    Car.carsInfo = {};

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
    this.currentDropBox = (e.target as HTMLElement).parentElement;
    this.currentDropBox.style.backgroundColor = '#F66';
  }

  private onDragover(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    if (
      (e.target as HTMLElement).getAttribute('class') !== null &&
      (e.target as HTMLElement).getAttribute('class').indexOf('drop') !== -1
    ) {
      this.currentDropBox = (e.target as HTMLElement).parentElement;
      (e.target as HTMLElement).parentElement.style.backgroundColor = '#F66';
    }
  }

  private onDragLeave(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if (!this.currentDropBox) {
      return;
    }
    this.currentDropBox.style.backgroundColor = '';
    this.currentDropBox = null;
  }

  private async onDrop(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    if (
      (e.target as HTMLElement).parentElement !== this.currentDropBox &&
      this.currentDropBox !== null
    ) {
      this.currentDropBox.style.backgroundColor = '';
      this.currentDropBox = null;
      return;
    } else {
      (e.target as HTMLElement).parentElement.style.backgroundColor = '';
    }
    const carType = (e.target as HTMLElement).parentElement.getAttribute('id');

    const drag = e as DragEvent;

    if (drag.dataTransfer === null) {
      return;
    }

    // 拿到拖拽文件
    const files = drag.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      const path = drag.dataTransfer.files.item(i)!.path;
      const filename = drag.dataTransfer.files
        .item(i)!
        .name.replace(/\.xlsx?$/, '');

      if (!/\.xlsx?$/.test(path)) {
        return;
      }

      // 如果是表格 读取
      const table = xlsx.parse(path);

      // 构造汽车数据
      _.forEach(table, (sheet) => {
        const car = new Car(sheet, carType);
      });

      // 构造生成表格数据 簿
      const dataSheet: any[][] = [
        // 第一行数据
        [
          '车型', // 0
          '车座', // 1
          '车号', // 2
          '期限', // 3
          '里程', // 4
          '金额', // 5
          '升数', // 6
          '合计', // 7 *
          '期限', // 8
          '里程', // 9
          '金额', // 10
          '升数' // 11
        ]
      ];

      // 表格合并数据
      const merges = [];
      /**
       * 当前车辆索引
       */
      let currentIndex = 0;

      if (_.isEmpty(Car.carsInfo)) return;

      _.forEach(Car.carsInfo, (carInfo, carName) => {
        _.forEach(carInfo, (cars, carNumber) => {
          let seatIdentical = 0;
          // 座数相同的合计
          const seatIdenticalTotal = {
            date: 0,
            mileage: 0,
            price: 0,
            liters: 0
          };
          _.forEach(cars, (car, index) => {
            // 座数相同 + 1
            ++seatIdentical;
            // 索引 + 1
            ++currentIndex;
            // 座数相同的合计
            seatIdenticalTotal.date += car.date;
            seatIdenticalTotal.mileage += car.mileage;
            seatIdenticalTotal.price += car.price;
            seatIdenticalTotal.liters += car.liters;
            // 一条数据
            dataSheet.push([
              car.name,
              car.seat,
              car.carNumber,
              car.date,
              car.mileage,
              car.price,
              car.liters,
              null,
              null,
              null,
              null,
              null
            ]);
          });
          // 座数相同车辆循环结束
          // 设置合计 行数为当前索引 - 座数相同车辆数 + (座数相同车辆数 / 2) 向上取整
          const seatIdenticalTotalIndex =
            currentIndex - seatIdentical + Math.ceil(seatIdentical / 2);

          // 数据
          dataSheet[seatIdenticalTotalIndex][8] = parseFloat(
            seatIdenticalTotal.date.toFixed(2)
          );
          dataSheet[seatIdenticalTotalIndex][9] = parseFloat(
            seatIdenticalTotal.mileage.toFixed(2)
          );
          dataSheet[seatIdenticalTotalIndex][10] = parseFloat(
            seatIdenticalTotal.price.toFixed(2)
          );
          dataSheet[seatIdenticalTotalIndex][11] = parseFloat(
            seatIdenticalTotal.liters.toFixed(2)
          );

          // 构造合并信息
          merges.push({
            s: { c: 0, r: currentIndex - seatIdentical + 1 },
            e: { c: 0, r: currentIndex }
          });
          merges.push({
            s: { c: 1, r: currentIndex - seatIdentical + 1 },
            e: { c: 1, r: currentIndex }
          });
        });
        // 相同车名 循环结束
      });

      dataSheet.push([
        null,
        null,
        null,
        { t: 'n', f: `=SUM(D2:D${currentIndex + 1})` },
        { t: 'n', f: `=SUM(E2:E${currentIndex + 1})` },
        { t: 'n', f: `=SUM(F2:F${currentIndex + 1})` },
        { t: 'n', f: `=SUM(G2:G${currentIndex + 1})` },
        null,
        { t: 'n', f: `=SUM(I2:I${currentIndex + 1})` },
        { t: 'n', f: `=SUM(J2:J${currentIndex + 1})` },
        { t: 'n', f: `=SUM(K2:K${currentIndex + 1})` },
        { t: 'n', f: `=SUM(L2:L${currentIndex + 1})` }
      ]);

      // 合计 的合并数据 第8列 从开头到车辆数
      merges.push({ s: { c: 7, r: 0 }, e: { c: 7, r: currentIndex } });
      const sheetOptions = { '!merges': merges };

      const buffer = xlsx.build([
        {
          name: 'sheet1',
          data: dataSheet,
          options: sheetOptions
        }
      ]);

      const month = getMonthByFilename(filename);

      // 清空数据
      Car.carsInfo = {};
      Car.total = 0;

      ipcRenderer.send('saveFile', `${month}合计`, buffer);
    }
  }
}
</script>

<style scoped lang="scss">
* {
  margin: 0;
  padding: 0;
}

.dropBox {
  position: absolute;
  left: 0;
  width: 80%;
  height: 40%;

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
    transform: translate(-50%, -50%);
    font-size: 3rem;
    z-index: 1;
  }
}
#smallCar {
  top: 0;
  background-color: #9f9;
}
#bigCar {
  top: 50%;
  background-color: #99f;
}
</style>
