/**
 * lunar-javascript 库的类型声明
 * 临时类型定义，用于开发阶段
 */

declare module 'lunar-javascript' {
  export class Solar {
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    getLunar(): Lunar;
  }
  
  export class Lunar {
    getEightChar(): EightChar;
  }
  
  export class EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearWuXing(): string;
    getMonthWuXing(): string;
    getDayWuXing(): string;
    getTimeWuXing(): string;
    getYearShiShen(): string;
    getMonthShiShen(): string;
    getTimeShiShen(): string;
  }
}

declare module 'lunar-javascript/package.json' {
  const version: string;
  export { version };
}