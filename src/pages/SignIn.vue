<template>
  <div class="flex-grid justify-center">
    <div class="col-2">

      <VeeForm @submit="signIn" action="" class="card card-form">
        <h1 class="text-center">Login</h1>

        <AppFormField v-model="form.email" name="email" label="Email" :rules="{required:true,email:true}"/>

        <AppFormField v-model="form.password" name="password" label="Password"  rules="required|min:8" />

        <div class="push-top">
          <button type="submit" class="btn-blue btn-block">Log in</button>
        </div>

        <div class="form-actions text-right">
          <router-link :to="{name:'Register'}" >Create an account?</router-link>
        </div>
      </VeeForm>

      <div class="push-top text-center">
        <button @click="signInWithGoogle" class="btn-red btn-xsmall"><i class="fa fa-google fa-btn"></i>Sign in with Google</button>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'SignIn',
  data () {
    return {
      form: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    async signIn () {
      try {
        await this.$store.dispatch('signInWithEmailAndPassword', { ...this.form })
        this.successRedirect()
      } catch (e) {
        console.log(e)
      }
    },
    async signInWithGoogle () {
      await this.$store.dispatch('signInWithGoogle')
      this.successRedirect()
    },
    successRedirect () {
      const redirectTo = this.$route.query.redirectTo || { name: 'Home' }
      this.$router.push(redirectTo)
    }
  },
  created () {
    this.$emit('ready')
  }
}
</script>

<style scoped>

</style>
