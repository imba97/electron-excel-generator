/**
 * 原始数据
 */
export interface IOriginalData {
  /**
   * 序号
   */
  number: string

  /**
   * 所在区
   */
  area: string

  /**
   * 酒店
   */
  hotel: string

  /**
   * 房间号
   */
  roomNumber: string

  /**
   * 入住时间
   */
  checkInTime: string

  /**
   * 姓名
   */
  name: string

  /**
   * 性别
   */
  gender: string

  /**
   * 身份证
   */
  idCard: string

  /**
   * 联系方式
   */
  contact: string

  /**
   * 街道
   */
  street: string

  /**
   * 社区
   */
  community: string

  /**
   * 楼号、单元、房间号
   */
  residenceInfo: string

  /**
   * 备注
   */
  remarks: string

  /**
   * 解除隔离日期
   */
  deIsolationDate: string
}

export interface IGenerateData {
  /**
   * 姓名
   */
  name: string

  /**
   * 性别
   */
  gender: string

  /**
   * 身份证
   */
  idCard: string

  /**
   * 联系方式
   */
  contact: string

  /**
   * 社区
   */
  community: string

  /**
   * 住所信息
   */
  residenceInfo: IResidenceInfo

  /**
   * 备注
   */
  remarks: string
}

export interface IResidenceInfo {
  /**
   * 楼号
   */
  buildingNumber: string

  /**
   * 单元号
   */
  unitNumber: string

  /**
   * 房间号
   */
  roomNumber: string
}

/**
 * 工作簿
 */
export interface ISheet {
  /**
   * 小区 + 楼号
   */
  title: string

  rooms: {
    /**
     * 单元号
     */
    [key: string]: {
      /**
       * 门牌号
       */
      [key: string]: {
        /**
         * 姓名
         */
        name: string

        /**
         * 性别
         */
        gender: string

        /**
         * 身份证
         */
        idCard: string

        /**
         * 联系方式
         */
        contact: string

        /**
         * 备注
         */
        remarks: string
      }[]
    }
  }
}
