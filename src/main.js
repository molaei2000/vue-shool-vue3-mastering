import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import firebase from 'firebase'
import firebaseConfig from '@/config/firebase'
import FontAwesome from '@/plugins/FontAwesome'
import clickOutsideDirective from '@/plugins/ClickOutsideDirective'
import pageScrollDirective from '@/plugins/PageScrollDirective'

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

const app = createApp(App)
app.use(router)
app.use(store)
app.use(clickOutsideDirective)
app.use(pageScrollDirective)
app.use(FontAwesome)

const requireComponent = require.context('./components', true, /App[A-Z]\w+\.(vue|js)$/)
requireComponent.keys().forEach(function (fileName) {
  let baseComponentConfig = requireComponent(fileName)
  baseComponentConfig = baseComponentConfig.default || baseComponentConfig
  const baseComponentName = baseComponentConfig.name || (
    fileName
      .replace(/^.+\//, '')
      .replace(/\.\w+$/, '')
  )
  app.component(baseComponentName, baseComponentConfig)
})

app.mount('#app')
