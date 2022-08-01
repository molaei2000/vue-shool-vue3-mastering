<template>
  <div class="flex-grid justify-center">
    <div class="col-2">

      <VeeForm @submit="register" class="card card-form">
        <h1 class="text-center">Register</h1>

        <AppFormField v-model="form.name" name="name" label="Name" rules="required"/>

        <AppFormField v-model="form.username" name="username" label="Username" rules="required|unique:users,username"/>

        <AppFormField v-model="form.email" name="email" label="Email" :rules="{required:true,email:true, unique:{collection:'users',field:'email'}}"/>

        <AppFormField v-model="form.password" name="password" label="Password"  rules="required|min:8" />

        <div class="form-group">
          <label for="avatar">
            Avatar
            <div v-if="avatarPreview">
              <img :src="avatarPreview" alt="avatar">
            </div>
          </label>
          <VeeField name="avatar" v-show="!avatarPreview" accept="image/*" id="avatar" @change="handleImageUpload" type="file" class="form-input"/>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-blue btn-block">Register</button>
        </div>

      </VeeForm>
      <div class="text-center push-top">
        <button @click="registerWithGoogle" class="btn-red btn-xsmall"><i class="fa fa-google fa-btn"></i>Sign up with Google</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TheRegister',
  data () {
    return {
      form: {
        name: '',
        username: '',
        email: '',
        password: '',
        avatar: ''
      },
      avatarPreview: null
    }
  },
  methods: {
    async register () {
      await this.$store.dispatch('registerUserWithEmailAndPassword', this.form)
      this.$router.push('/')
    },
    async registerWithGoogle () {
      await this.$store.dispatch('signInWithGoogle')
      this.$router.push('/')
    },
    handleImageUpload (e) {
      this.form.avatar = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        this.avatarPreview = event.target.result
      }
      reader.readAsDataURL(this.form.avatar)
    }
  },
  created () {
    this.$emit('ready')
  }
}
</script>

<style scoped>

</style>
