<template>
  <VueFinalModal v-model="showModal" classes="modal-container" content-class="modal">
    <div class="modal-content">
      <h4>Login Again to change your email</h4>
      <VeeForm @submit="save">
        <AppFormField name="reauth-email" label="Email" v-model="email" rules="email|required"  />
        <AppFormField name="reauth-password" label="Password" v-model="password" type="password" rules="required"  />
        <button class="btn btn-green btn-small">Login</button>
      </VeeForm>
    </div>
  </VueFinalModal>
</template>

<script>
import { VueFinalModal } from 'vue-final-modal'
export default {
  name: 'UserProfileCardEditorReauthenticate',
  components: { VueFinalModal },
  props: {
    modalValue: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      email: '',
      password: ''
    }
  },
  computed: {
    showModal: {
      get () {
        return this.modalValue
      },
      set (value) {
        this.$emit('update:modalValue', value)
      }
    }
  },
  methods: {
    async save () {
      try {
        await this.$store.dispatch('reauthenticate', { email: this.email, password: this.password })
        this.$emit('success')
      } catch (e) {
        console.log(e)
        this.$emit('fail', e)
      }
    }
  }
}
</script>

<style scoped>

</style>
