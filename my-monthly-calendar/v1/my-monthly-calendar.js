window.MyMonthlyCalendar = function MyMonthlyCalendar (el, options) {
  var MONTHS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var month = 1;
  var day = null;
  var input = null;
  var select;
  var confirmBtn;
  var cancelBtn;
  var table;
  var calendarDialog;
  var validateNode;
  if (!el) {
    throw new Error('el does not exist');
  }

  /*
   * {
   *   inputWidth:213(单位px)
   * }
   * */
  options = options || {};
  init(options);

  function init (options) {
    initDom(options);
  }

  function initDom (options) {
    var frag = document.createDocumentFragment();
    var myCalendar = document.createElement('div');
    myCalendar.classList.add('my-calendar');
    frag.appendChild(myCalendar);
    myCalendar.appendChild(_initInput(options));

    calendarDialog = document.createElement('div');
    calendarDialog.classList.add('calendar');

    var calendarMain = document.createElement('div');
    calendarMain.classList.add('main');

    calendarDialog.appendChild(calendarMain);
    myCalendar.appendChild(calendarDialog);

    calendarMain.appendChild(_initMonthBox(options));
    calendarMain.appendChild(_initTable(options));
    calendarMain.appendChild(_initValidateText());
    calendarMain.appendChild(_initButton());

    el.appendChild(frag);

    function _initInput (options) {
      var inputWrapper = document.createElement('span');
      inputWrapper.classList.add('calendar-input-wrapper');

      input = document.createElement('input');
      input.classList.add('calendar-input');
      input.readOnly = true;
      input.type = 'text';
      input.style.width = options.inputWidth || 99 + 'px';

      input.addEventListener('focus', inputFocusHandler)
      inputWrapper.appendChild(input);
      return inputWrapper;
    }

    function _initMonthBox (options) {
      var header = document.createElement('header');
      header.classList.add('month-box');

      var leftArrow = document.createElement('span');
      leftArrow.classList.add('left-arrow');
      leftArrow.innerText = '<';
      leftArrow.addEventListener('click', previousMonth);
      _initSelector();

      var rightArrow = document.createElement('span');
      rightArrow.classList.add('right-arrow');
      rightArrow.innerText = '>';
      rightArrow.addEventListener('click', nextMonth);

      header.appendChild(leftArrow);
      header.appendChild(select);
      header.appendChild(document.createTextNode('月'));
      header.appendChild(rightArrow);

      return header;

      function _initSelector () {
        select = document.createElement('select');
        for (var i = 1; i < 13; i += 1) {
          var option = document.createElement('option');
          option.value = i;
          option.innerText = i;
          select.appendChild(option);
        }
        select.addEventListener('change', selectHandler)
      }
    }

    function _initTable (options) {
      table = document.createElement('table');
      table.classList.add('calendar-table');

      for (var i = 1; i < 6; i += 1) {
        var tr = document.createElement('tr');
        for (var j = 1, curDay = 0; j < 8 && (curDay = (i - 1) * 7 + j) <= 31; j += 1) {
          var td = document.createElement('td');
          td.dataset.day = curDay;
          td.innerText = curDay;
          tr.appendChild(td);
        }
        table.appendChild(tr);
      }
      table.addEventListener('click', tableHandler)
      return table;
    }

    function _initValidateText (options) {
      validateNode = document.createElement('div');
      validateNode.classList.add('validate-tip-text');
      validateNode.innerText = '请选择一个日期！';
      return validateNode;
    }

    function _initButton (options) {
      var div = document.createElement('div');
      div.classList.add('calendar-footer');

      confirmBtn = document.createElement('button');
      confirmBtn.classList.add('calendar-button');
      confirmBtn.classList.add('confirm-button');
      confirmBtn.innerText = '确认';
      confirmBtn.addEventListener('click', confirmHandler)

      cancelBtn = document.createElement('button');
      cancelBtn.classList.add('calendar-button');
      cancelBtn.classList.add('cancel-button');
      cancelBtn.innerText = '取消';
      cancelBtn.addEventListener('click', closeDialog)

      div.appendChild(confirmBtn);
      div.appendChild(cancelBtn);
      return div;
    }
  }

  function nextMonth () {
    if (Number(month) === 12) {
      return;
    }
    month += 1;
    select.value = month;

    initMonthStyles();
    initDay();
  }

  function previousMonth () {
    if (Number(month) === 1) {
      return;
    }
    month -= 1;
    select.value = month;

    initMonthStyles();
    initDay();
  }

  function initData () {
    if (!input || !input.value) {
      reset();
      return;
    }
    initMonth();
    initDay();
  }

  function initMonth () {
    if (!input || !input.value) {
      return;
    }
    var monthDay = input.value.split('-');

    var finalMonth = Number(monthDay[0]);
    if (finalMonth === month) {
      select.value = month;
      initMonthStyles();
    } else {
      resetMonth();
    }
  }

  function initDay () {
    if (!input || !input.value) {
      return;
    }
    var monthDay = input.value.split('-');
    var finalMonth = Number(monthDay[0]);
    if (finalMonth === month) {
      day = Number(monthDay[1]);
      checkDay();
    } else {
      resetDay();
    }
  }

  function reset () {
    input.value = null;
    resetMonth();
    resetDay();
  }

  function resetMonth () {
    select.value = 1;
    month = 1;
  }

  function resetDay () {
    var oldChecked = table.querySelector('.day-selected');
    oldChecked && oldChecked.classList.remove('day-selected');
    day = null;
  }

  function checkDay (dayEl) {
    var oldChecked = table.querySelector('.day-selected');
    oldChecked && oldChecked.classList.remove('day-selected');
    if (dayEl) {
      dayEl.classList.add('day-selected');
    } else {
      var td = table.querySelector('[data-day="' + day + '"]');
      td && td.classList.add('day-selected');
    }
  }

  function confirmHandler () {
    //有选择日
    if (!table.querySelector('.day-selected')) {
      showValidateText();
      return;
    }
    input.value = (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
    closeDialog();
  }

  function inputFocusHandler (e) {
    if (calendarDialog.style.maxHeight) {
      return;
    }
    input.parentElement.classList.add('calendar-input-wrapper-focused');
    //reset();
    openDialog();
  }

  function calendarBlurHandler (e) {
    !calendarDialog.contains(e.target) && !input.contains(e.target) && closeDialog();
  }

  function openDialog () {
    document.addEventListener('click', calendarBlurHandler);
    initData();
    calendarDialog.style.maxHeight = '433px';
  }

  function closeDialog () {
    document.removeEventListener('click', calendarBlurHandler);
    hideValidateText();
    calendarDialog.style.maxHeight = null;
    input.parentElement.classList.remove('calendar-input-wrapper-focused');
  }

  function tableHandler (e) {//
    if (typeof e.target.dataset.day === 'undefined' || (typeof e.target.dataset.day === 'object' && !e.target.dataset.day)) {
      return;
    }
    var oldDay = day;
    day = Number(e.target.dataset.day);
    if (oldDay === day) {
      return;
    }
    checkDay(e.target);
  }

  function selectHandler (e) {//initial
    console.log('select');
    month = Number(e.target.value);
    initMonthStyles();
    initDay();
  }

  function showValidateText () {
    validateNode.style.maxHeight = '2em';
    table.style.borderColor = 'red';
    setTimeout(hideValidateText, 3000);
  }

  function hideValidateText () {
    validateNode.style.maxHeight = 0;
    table.style.borderColor = 'white';
  }

  function initMonthStyles () {
    if (MONTHS[month - 1] === 29) {
      table.querySelector('[data-day="30"]').style.display = 'none';
      table.querySelector('[data-day="31"]').style.display = 'none';
    } else if (MONTHS[month - 1] === 30) {
      table.querySelector('[data-day="30"]').style.display = 'table-cell';
      table.querySelector('[data-day="31"]').style.display = 'none';
    } else {
      table.querySelector('[data-day="30"]').style.display = 'table-cell';
      table.querySelector('[data-day="31"]').style.display = 'table-cell';
    }
  }

  function getValue () {
    if (!input) {
      return null;
    }
    return input.value;
  }

  return {
    getValue: getValue,
    reset: reset
  }
}
