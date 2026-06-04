/**
 * Korean translation for bootstrap-datepicker
 * This is a port from https: //github.com/moment/moment/blob/develop/src/locale/ko.js
 */
(function () {
  Datepicker.locales.ko = {
    days: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    daysShort: ['일', '월', '화', '수', '목', '금', '토'],
    daysMin: ['일', '월', '화', '수', '목', '금', '토'],
    months: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'], // 수정 : 월 표기 제거
    monthsShort: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], // 수정 : 월 표기 제거
    today: '오늘',
    clear: '삭제',
    format: 'yyyy-mm-dd',
    titleFormat: 'yyyy mm월', // 수정 : YYYY년 MMM월 표기 변경
    weekStart: 0,
  };
})();
