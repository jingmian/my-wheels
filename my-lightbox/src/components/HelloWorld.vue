<template>
  <main>
    <div v-for="(url,index) in urls" class="img-wrapper" @click="onOpenLightbox(urls,index)">
      <div class="img-box">
        <img :src="url">
      </div>
    </div>
  </main>
</template>

<script>
import Lightbox from './Lightbox';

export default {
  name: 'HelloWorld',
  data () {
    return {
      urls: ['https://blank121.github.io/my-wheels/my-carousel/img/1.jpg', 'https://blank121.github.io/my-wheels/my-carousel/img/2.jpg', 'https://blank121.github.io/my-wheels/my-carousel/img/3.jpg', 'https://blank121.github.io/my-wheels/my-carousel/img/4.jpg','https://blank121.github.io/my-wheels/my-carousel/img/5.jpg']
    }
  },
  methods: {
    onOpenLightbox: function (urls, index) {
      Lightbox.open({urls: urls, index: index})
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .img-wrapper {
    padding: 10%;
    position: relative;
    display: inline-block;
    .img-box {
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      box-sizing: border-box;
      position: absolute;
      border: 0.5em solid #eeeeee;
      cursor: pointer;
      overflow: hidden;
      img {
        max-width: 100%;
        max-height: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
      }
    }
    .img-box:after {
      content: '点击预览大图';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      font-size: .7em;
      height: 3em;
      line-height: 3em;
      text-align: center;
      transform: translateY(100%);
      transition: transform 0.25s;
    }
    .img-box:hover {
      border-color: #409EFF;
    }
    .img-box:hover:after {
      transform: translateY(0);
    }
  }

</style>
