!window.MyCarousel && (window.MyCarousel = function MyCarousel (el, options) {
  "use strict";

  /** {
    *   el://required
    *   urls:[]//required
    *   curIndex:0 //初始显示第几张 0开始
    *   isAutoPlay:true//是否自动播放
    *   cycle:999//切换时间间隔（误差几毫秒）
    *   change:function(newIndex,oldIndex);（即将切换之前的回调）return false表示阻止本次切换
    *  }
   */
  var LEFT = 0, RIGHT = 1;

  var urls = []//只有1张图片怎么办 TODO
  var boxes = [];
  var curIndex = 0;
  var isAutoPlay = true;
  var cycle = 3333//ms
  var timerId = null;
  var changeCallback = null;
  var guide = null;
  var throttleOption = {
    leading: true,  // 第一次调用事件是否立即执行
    trailing: true // 最后一次延迟调用是否执行
  }
  var toggleTime = '500'

  function onNext () {
    jumpTo(curIndex + 1); // 统一入口来节流
  }


  function onPrevious () {
    jumpTo(curIndex - 1);// 统一入口来节流
  }


  //跳到第几张
  var jumpTo = _throttle(function (i) {
    i = parseInt(i)
    if (i > curIndex) {
      next(i);
    } else if (i < curIndex) {
      previous(i);
    }
  }, 500, throttleOption);

  function init (options) {
    initData(options);
    initDom(options);
    boxes[1].imgEL.src = urls[curIndex];
    buildImgUrl(boxes);
    isAutoPlay && (timerId = setTimeout(autoPlay, cycle))
  }

  function initData (options) {
    if (!options.urls || options.urls instanceof Array == false || options.urls.length === 0) {
      throw new Error('urls must be an Array');
    }
    urls = options.urls;
    options.curIndex && (curIndex = options.curIndex);
    typeof options.isAutoPlay === 'boolean' && (isAutoPlay = options.isAutoPlay)

    typeof options.cycle === 'number' && (cycle = options.cycle)
    changeCallback = options.change || noop;
    options.toggleTime && (toggleTime = options.toggleTime)
  }

  function initDom () {
    var fragment = document.createDocumentFragment();
    var carouselDiv = document.createElement('div');
    carouselDiv.classList.add('carousel');
    fragment.appendChild(carouselDiv);

    var main = document.createElement('main');
    main.classList.add('main');
    carouselDiv.appendChild(main);

    _buildButtons(main);
    _buildImgWrappers(main);
    _buildGuideCircles(main, urls.length);
    el.appendChild(fragment);

    function _buildButtons (main) {
      //previous
      var previous = document.createElement('div');
      previous.classList.add('previous');
      previous.addEventListener('click', onPrevious);
      var previousBtn = document.createElement('div');
      previousBtn.classList.add('previous-button');
      previous.appendChild(previousBtn);

      //next
      var next = document.createElement('div');
      next.classList.add('next');
      next.addEventListener('click', onNext);
      var nextBtn = document.createElement('div');
      nextBtn.classList.add('next-button');
      next.appendChild(nextBtn);

      main.appendChild(previous);
      main.appendChild(next);
    }

    function _buildImgWrappers (main) {
      main.addEventListener('mouseenter', mouseenterHandler);
      main.addEventListener('mouseleave', mouseleaveHandler);
      for (var i = 1; i <= 3; i += 1) {
        var imgWrapper = document.createElement('div');
        imgWrapper.classList.add('img-wrapper');
        var img = document.createElement('img');
        imgWrapper.appendChild(img);
        main.appendChild(imgWrapper);
        boxes.push(
          {
            el: imgWrapper,
            imgEL: img
          }
        );
      }
      boxes[0].el.classList.add('left');
      boxes[1].el.classList.add('current');
      boxes[2].el.classList.add('right');
    }

    function _buildGuideCircles (main, length) {
      guide = document.createElement('div');
      guide.classList.add('guide');
      guide.addEventListener('click', guideClickHandler);//委托
      _buildIndicators(guide, length);
      initActiveIndicators();
      main.appendChild(guide);

      function _buildIndicators (guide, length) {
        var frag = document.createDocumentFragment();
        for (var i = 0; i < length; i++) {
          var div = document.createElement('div');
          div.classList.add('indicator');
          div.dataset.index = i;
          frag.appendChild(div);
        }
        guide.appendChild(frag);
      }
    }
  }

  function mouseenterHandler () {
    timerId && clearTimeout(timerId);
  }

  function mouseleaveHandler () {
    isAutoPlay && (timerId = setTimeout(autoPlay, cycle))
  }

  function guideClickHandler (e) {
    if (typeof e.target.dataset.index === 'undefined' || (typeof e.target.dataset.index === 'object' && !e.target.dataset.index)) {
      return;
    }
    jumpTo(e.target.dataset.index);
  }

  function buildImgUrl (boxes) {
    boxes[0].imgEL.src = urls[curIndex === 0 ? urls.length - 1 : curIndex - 1];
    boxes[2].imgEL.src = urls[curIndex === urls.length - 1 ? 0 : curIndex + 1];
  }


  function previous (index) {//index:第几张，可能超过length
    typeof index !== 'number' && (index = curIndex - 1);//index不存在，默认移动一步
    var oldIndex = curIndex;
    if (index < 0) {
      curIndex = urls.length + index;
    } else {
      curIndex = index;
    }

    if (changeCallback(curIndex, oldIndex) === false) {// 用户回调return false阻止本次切换
      return;
    }
    var footer = boxes.pop();
    boxes.unshift(footer);

    move(boxes, LEFT);
  }

  function next (index) {
    typeof index !== 'number' && (index = curIndex + 1);//index不存在，默认移动一步
    var oldIndex = curIndex;
    if (index >= urls.length) {
      curIndex = index - urls.length;
    } else {
      curIndex = index;
    }

    if (changeCallback(curIndex, oldIndex) === false) {
      return;
    }
    var head = boxes.shift();
    boxes.push(head);
    move(boxes, RIGHT);
  }

//执行切换 入口只有next和previous
  function move (boxes, direction) {
    window.requestAnimationFrame(function () {
      var transitionDuration = toggleTime + 'ms';

      var leftNode = boxes[0].el;
      if (direction === RIGHT) {
        leftNode.style.transitionDuration = transitionDuration;
      } else {
        leftNode.style.transitionDuration = null;
      }
      leftNode.classList.add('left');
      leftNode.classList.remove('current');
      leftNode.classList.remove('right');

      boxes[1].imgEL.src = urls[curIndex];//先渲染主图
      var currentNode = boxes[1].el;
      currentNode.style.transitionDuration = transitionDuration;
      currentNode.classList.add('current');
      currentNode.classList.remove('left');
      currentNode.classList.remove('right');

      var rightNode = boxes[2].el;
      if (direction === LEFT) {
        rightNode.style.transitionDuration = transitionDuration;
      } else {
        rightNode.style.transitionDuration = null;
      }
      rightNode.classList.add('right');
      rightNode.classList.remove('left');
      rightNode.classList.remove('current');

      initActiveIndicators();
      setTimeout(function () {
        buildImgUrl(boxes);
      }, toggleTime);//这里toggleTime与动画时间保持一致,动画结束后更新两侧的图片
    });
  }

  function initActiveIndicators () {
    guide.querySelectorAll('[data-index]').forEach(function (item) {//ie11 throw error TODO
      var index = stringToNumber(item.dataset.index);
      if (index === curIndex) {
        item.style.borderColor = '#328bff';
      } else {
        item.style.borderColor = 'white';
      }
    })
  }

  function autoPlay () {
    next();
    isAutoPlay && (timerId = setTimeout(autoPlay, cycle))
  }

  function destroy () {
    //移除各种事件监听
    isAutoPlay = false;
    timerId && clearTimeout(timerId);
    var next = el.querySelector('.next');
    next.removeEventListener('click', onNext);

    var previous = el.querySelector('.previous');
    previous.removeEventListener('click', onPrevious);

    var main = el.querySelector('.main');
    main.removeEventListener('mouseenter', mouseenterHandler);
    main.removeEventListener('mouseleave', mouseleaveHandler);

    var guide = el.querySelector('.guide');
    guide.removeEventListener('click', guideClickHandler);//委托
  }

  function noop () {
  }

  function stringToNumber (str) {
    if (typeof str === 'number') {
      return str;
    }
    if (typeof str !== 'string') {
      throw new Error('str is not a string');
    }
    return Number(str);
  }

  function _throttle (fn, wait, options) {
    var timeout, context, args, result
    var previous = 0
    if (!options) options = {}

    var later = function () {
      previous = options.leading === false ? 0 : +new Date()
      timeout = null
      result = fn.apply(context, args)
      if (!timeout) context = args = null
    }

    var throttled = function () {
      var now = +new Date()
      if (!previous && options.leading === false) previous = now
      var remaining = wait - (now - previous)
      context = this
      args = arguments
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
        previous = now
        result = fn.apply(context, args)
        if (!timeout) context = args = null
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining)
      }
      return result
    }

    return throttled
  }

  if (!el) {
    throw new Error('el does not exist');
  }
  init(options);
  return {
    jumpTo: jumpTo,
    next: onNext,
    previous: onPrevious,
    destroy: destroy
  }
})