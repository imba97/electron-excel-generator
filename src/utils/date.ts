import _ from 'lodash';

/**
 * 从文件名获取月份，如果获取不到则用当前月份
 * @param filename 文件名
 * @returns X月
 */
export const getMonthByFilename = (filename: string) => {
  const monthReg = /(一|二|三|四|五|六|七|八|九|十|十一|十二|1|2|3|4|5|6|7|8|9|10|11|12)月/.exec(
    filename
  );
  // 如果文件名中匹配到月份 就用文件名的
  if (monthReg !== null) {
    return /\d+/.test(monthReg[1])
      ? `${monthNumberToText(parseInt(monthReg[1], 10))}月`
      : monthReg[0];
  }

  // 如果没有 则用当前月份
  const currentMonth = new Date().getMonth() + 1;
  return `${monthNumberToText(currentMonth)}月`;
};

/**
 * 根据月份数字获取中月份中文数字
 * @param monthNumber 月份数字
 */
export const monthNumberToText = (monthNumber: number) => {
  let text = '';
  switch (monthNumber) {
    case 1:
      text = '一';
      break;
    case 2:
      text = '二';
      break;
    case 3:
      text = '三';
      break;
    case 4:
      text = '四';
      break;
    case 5:
      text = '五';
      break;
    case 6:
      text = '六';
      break;
    case 7:
      text = '七';
      break;
    case 8:
      text = '八';
      break;
    case 9:
      text = '九';
      break;
    case 10:
      text = '十';
      break;
    case 11:
      text = '十一';
      break;
    case 12:
      text = '十二';
      break;
  }

  return text;
};

export const getDayByDate = (date: string): number => {
  // 第一种情况 xx.xx 返回 1 天
  if (/^\d{1,2}\.\d{1,2}$/.test(date)) {
    return 1;
  }
  // 第二种情况 xx.xx-xx 返回 后面的时间 - 前面的时间 + 1
  if (/^(\d{1,2}).(\d{1,2})-(\d{1,2})$/.test(date)) {
    const reg = /^(\d{1,2}).(\d{1,2})-(\d{1,2})$/.exec(date);
    if (reg === null) return 0;
    return parseInt(reg[3]) - parseInt(reg[2]) + 1;
  }
  // 第三种情况 xx.xx-xx.xx
  if (/^(\d{1,2})\.(\d{1,2})-(\d{1,2})\.(\d{1,2})$/.test(date)) {
    const reg = /^(\d{1,2})\.(\d{1,2})-(\d{1,2})\.(\d{1,2})$/.exec(date);
    if (reg === null) return 0;
    const year = new Date().getFullYear();
    const date1 = new Date(`${year}/${reg[1]}/${reg[2]}`).getTime();
    const date2 = new Date(`${year}/${reg[3]}/${reg[4]}`).getTime();
    return (date2 - date1) / 60 / 60 / 24 / 1000 + 1;
  }
  // 第四种情况 xx.xx/xx/xx
  if (/\//.test(date)) {
    const dateSplit = date.split('/');
    let day = 0;
    _.forEach(dateSplit, (d) => {
      day += getDayByDate(d);
    });
    return day;
  }

  return 0;
};
