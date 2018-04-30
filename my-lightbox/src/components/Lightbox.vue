<template>
  <transition name="slide-fade" v-on:after-leave="destroyElement">
    <div class="lightbox" v-show="visible">
      <div class="lightbox-close" @click="onHidden">
        <div class="close-btn"></div>
      </div>
      <div class="lightbox-precious" @click="previous" v-bind:class="{ 'cursor-not-allowed': index <= 0 }"></div>
      <div class="lightbox-wrapper" ref="imgWrapper">
        <div class="lightbox-wrapper-transition" :style="{'width':width+'px','height':height+'px'}">
          <img :src="curUrl" class="lightbox-img" v-on:load="onLoad($event)">
          <strong class="tips">当前第 {{index+1}} 张，共 {{urls.length}} 张</strong>
        </div>
      </div>
      <div class="lightbox-next" @click="next" v-bind:class="{ 'cursor-not-allowed': index >= urls.length - 1 }"></div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Lightbox',
  data: function () {
    return {
      visible: false,
      closed: false,
      urls: [],
      index: 0,
      height: 0,
      width: 0
    }
  },
  computed: {
    curUrl: function () {
      return this.urls[this.index]
    }
  },
  watch: {
    closed: function (val) {
      if (val) {
        this.visible = false
      }
    }
  },
  methods: {
    destroyElement: function () {
      this.$el.parentNode.removeChild(this.$el)
      this.$destroy()
    },
    onHidden: function () {
      this.closed = true
    },
    onLoad: function (e) {
      /*
      取高按图片比例缩放 避免失真
      */
      let vm = this
      let imgWrapper = vm.$refs['imgWrapper']
      let heightIsBigger = imgWrapper.clientHeight / imgWrapper.clientWidth < e.target.naturalHeight / e.target.naturalWidth
      if (heightIsBigger) {
        vm.height = Math.min(e.target.naturalHeight, imgWrapper.clientHeight)
        vm.width = e.target.naturalWidth / e.target.naturalHeight * vm.height
      } else {
        vm.width = Math.min(e.target.naturalWidth, imgWrapper.clientWidth)
        vm.height = e.target.naturalHeight / e.target.naturalWidth * vm.width
      }
    },
    previous () {
      if (this.index <= 0) {
        return
      }
      this.index -= 1
    },

    next () {
      if (this.index >= this.urls.length - 1) {
        return
      }
      this.index += 1
    }
  }
}
</script>

<style scoped lang="scss">
  .slide-fade-enter-active .slide-fade-leave-active { // TODO
    transition: all .3s ease;
  }

  .slide-fade-leave-active {
    transition: all .25s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }

  .slide-fade-enter, .slide-fade-leave-to
    /* .slide-fade-leave-active for below version 2.1.8 */
  {
    transform: translateX(10px);
    opacity: 0;
  }

  .lightbox {
    user-select: none;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, .7);
    z-index: 9999;
    .lightbox-wrapper {
      margin: 99px 155px;
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
      text-align: center;
      .lightbox-wrapper-transition {
        display: inline-block;
        border: 11px solid white;
        background: white;
        transition: all 0.25s;
        box-sizing: border-box;
        max-height: 100%;
        max-width: 100%;
        vertical-align: middle;
        position: relative;
        .lightbox-img {
          width: 100%;
          height: 100%;
        }
        .tips{
          color: white;
          position: absolute;
          top: -2.5em;
          right: 0;
        }
      }
    }
    .lightbox-wrapper:after {
      display: inline-block;
      height: 100%;
      content: '';
      vertical-align: middle;
    }
    .lightbox-close {
      position: fixed;
      right: 55px;
      top: 55px;
      padding: 0px 18px;
      cursor: pointer;
      .close-btn {
        width: 5px;
        height: 40px;
        background: #c5c5c5;
        transform: rotate(45deg);
      }
      .close-btn:after {
        content: " ";
        position: absolute;
        top: 0;
        left: 0;
        width: 5px;
        height: 40px;
        background: #c5c5c5;
        transform: rotate(270deg);
      }
    }
    .lightbox-precious {
      cursor: pointer;
      display: flex;
      justify-content: center;
      left: 55px;
      top: 0;
      bottom: 0;
      margin: auto;
      position: fixed;
      width: 0;
      height: 0;
      border-top: 25px solid transparent;
      border-right: 35px solid #c5c5c5;
      border-bottom: 25px solid transparent;
    }
    .lightbox-next {
      cursor: pointer;
      display: flex;
      justify-content: center;
      right: 55px;
      top: 0;
      bottom: 0;
      margin: auto;
      position: fixed;
      width: 0;
      height: 0;
      border-top: 25px solid transparent;
      border-left: 35px solid #c5c5c5;
      border-bottom: 25px solid transparent;
    }
    .cursor-not-allowed {
      cursor: not-allowed !important;
    }
  }

  .lightbox-hidden {
    display: none;
  }

  .lightbox-show {
    transition: opacity 0.5s cubic-bezier(1, 0, 0.93, 1);
    display: inherit;
  }
</style>
