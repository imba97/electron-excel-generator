import { getDayByDate } from '@/utils/date';

export default class Car {
  /**
   * 根据车座分类的车
   */
  public static carsInfo: { [key: string]: { [key: string]: Car[] } } = {};

  /**
   * 车辆总数
   */
  public static total: number = 0;

  public name: string;
  public seat: string;
  public carNumber: string;
  // 日期
  public date: number;
  // 里程
  public mileage: number;
  public price: number;
  // 升数
  public liters: number;

  constructor(carData, carType: string) {
    // 车辆基础数据
    const carInfo = carData.name.split(',');
    this.carNumber = carInfo[0];
    this.name = carInfo[1];
    this.seat = carInfo[2];

    // 合计
    let dateTotal: number = 0;
    let mileageTotal: number = 0;
    let priceTotal: number = 0;
    let litersTotal: number = 0;

    // 表格 index
    const carTableIndex = this.getIndexByCarType(carType);

    for (let i = carTableIndex.start_row; i < carData.data.length; i++) {
      const item = carData.data[i];

      // 到合计后停止
      if (new String(item[0]).replace(/\s/g, '') === '合计') {
        // 过滤没数据的
        if (
          dateTotal === 0 &&
          mileageTotal === 0 &&
          priceTotal === 0 &&
          litersTotal === 0
        ) {
          break;
        }

        // 统计结束 赋值给成员变量
        this.date = parseFloat(dateTotal.toFixed(2));
        this.mileage = parseFloat(mileageTotal.toFixed(2));
        this.price = parseFloat(priceTotal.toFixed(2));
        this.liters = parseFloat(litersTotal.toFixed(2));

        // 没有 key 自动创建
        if (!Car.carsInfo.hasOwnProperty(this.name)) {
          Car.carsInfo[this.name] = {};
        }

        if (!Car.carsInfo[this.name].hasOwnProperty(this.seat)) {
          Car.carsInfo[this.name][this.seat] = new Array<Car>();
        }

        // 合格后车加入对象中
        Car.carsInfo[this.name][this.seat].push(this);
        // 车 + 1
        Car.total++;
        break;
      }

      // 没到合计则统计
      // 大车日期直接计算 小车日期转成天数再计算
      dateTotal +=
        carType === 'bigCar'
          ? this.verification(item[carTableIndex.date])
          : this.verification(getDayByDate(item[carTableIndex.date]));
      mileageTotal += this.verification(item[carTableIndex.mileage]);
      priceTotal += this.verification(item[carTableIndex.price]);
      // 升数 站上加油+途中加油 小车只统计站内
      litersTotal += this.verification(item[carTableIndex.station_liters]);
      if (carType === 'bigCar') {
        litersTotal += this.verification(item[carTableIndex.liters]);
      }
    }
  }

  /**
   * 验证数字是否正确 不正确返回 0
   * @param val 数字或字符串
   * @returns
   */
  private verification(val): number {
    // 如果不是 undefined null NaN 返回保留两位小数点的浮点型数字
    return typeof val !== 'undefined' &&
      val !== null &&
      !Number.isNaN(parseFloat(val))
      ? parseFloat(parseFloat(val).toFixed(2))
      : 0;
  }

  /**
   * 根据车类型获取表index
   * @param type 车辆类型
   */
  private getIndexByCarType(type: string): ICarTableIndex {
    switch (type) {
      case 'smallCar':
        return {
          start_row: 2,
          date: 2,
          mileage: 6,
          price: 4,
          liters: 8,
          station_liters: 7
        };

      case 'bigCar':
        return {
          start_row: 6,
          date: 2,
          mileage: 4,
          price: 8,
          liters: 14,
          station_liters: 12
        };

      default:
        new Error('未知车辆类型');
    }
  }
}

/**
 * 车数据表对应Index
 */
interface ICarTableIndex {
  /** 数据起始行 */
  start_row: number;
  /** 日期 */
  date: number;
  /** 里程 */
  mileage: number;
  /** 金额 */
  price: number;
  /** 途中加油 */
  liters: number;
  /** 站内加油 */
  station_liters: number;
}
