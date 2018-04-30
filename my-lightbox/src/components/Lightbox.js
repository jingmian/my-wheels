import Vue from 'vue'
import Lightbox from './Lightbox.vue';

let LightboxConstructor = Vue.extend(Lightbox);

function openLightbox (options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object')
  }
  if (!options.urls || options.urls instanceof Array === false || options.urls.length === 0) {
    throw new Error('options.urls must be an nonempty array')
  }
  let newLightbox = new LightboxConstructor(
    {
      data: {
        urls: options.urls,
        visible: true,
        index: typeof options.index === 'number' ? options.index : 0
      }
    }
  )

  newLightbox.vm = newLightbox.$mount() // 返回一个vue实例
  document.body.appendChild(newLightbox.vm.$el)
}

export default {
  open: openLightbox
}
