import Vue from 'vue';
import App from './App.vue';
import vUploader from 'v-uploader';

const uploaderConfig = {
  // file uploader service url
  uploadFileUrl: 'http://xxx/upload/publicFileUpload',
  // file delete service url
  deleteFileUrl: 'http://xxx/upload/deleteUploadFile',
  // set the way to show upload message(upload fail message)
  showMessage: (vue, message) => {
    //using v-dialogs to show message
    vue.$dlg.alert(message, { messageType: 'error' });
  }
};

Vue.config.productionTip = false
Vue.use(vUploader, uploaderConfig);

new Vue({
  render: h => h(App)
}).$mount('#app');
