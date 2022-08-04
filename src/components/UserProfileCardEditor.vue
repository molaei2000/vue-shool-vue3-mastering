<template>
  <div class="profile-card">
    <VeeForm @submit="save">
      <p class="text-center avatar-edit" style="position:relative">
        <label for="avatar">

        <AppAvatarImg
          :src="activeUser.avatar"
          :alt="`${user.name} profile picture`"
          class="avatar-xlarge img-update"
        />
          <span class="avatar-upload-overlay">
            <AppSpinner v-if="uploadingImage" color="white"/>
            <f-a v-else icon="camera" size="3x" :stype="{color:'white',opacity:'8'}" />
          </span>
          <input v-show="false" type="file" id="avatar" accept="image/*" name="avatar" @change="handleAvatarUpload">
        </label>
      </p>
      <UserProfileCardEditorRandomAvatar @hit="activeUser.avatar = $event" />

      <AppFormField label="Username" name="username" v-model="activeUser.username" :rules="`required|unique:users,username,${user.username}`" />
      <AppFormField label="Full Name" name="name" v-model="activeUser.name" rules="required" />
      <AppFormField label="Bio" name="bio" as="textarea" v-model="activeUser.bio" placeholder="Write a few words about yourself." />

      <div class="stats">
        <span>{{ user.postsCount }} posts</span>
        <span>{{ user.threadsCount }} threads</span>
      </div>

      <hr />
      <AppFormField label="Website" name="website" v-model="activeUser.website" rules="url" />
      <AppFormField label="Email" name="email" v-model="activeUser.email" :rules="`required|email|unique:users,email,${user.email}`"/>
      <AppFormField label="Location" name="location" v-model="activeUser.location" list="locations" @mouseenter="loadLocationOptions"/>
      <dataList id="locations">
        <option v-for="location in locationOptions" :key="location.name.common" :value="location.name.common"/>
      </dataList>

      <div class="btn-group space-between">
        <button class="btn-ghost" @click.prevent="cancel">Cancel</button>
        <button type="submit" class="btn-blue">Save</button>
      </div>
    </VeeForm>
    <VeeForm @submit="changePassword">
      <AppFormField name="current-password" type="password" label="Current Password" v-model="currentPassword" rules="required|min:8"/>
      <AppFormField name="new-password" type="password" label="New Password" v-model="newPassword" rules="required|min:8"/>
      <AppFormField name="confirm-new-password" type="password" label="Confirm new Password" v-model="confirmNewPassword" :rules="`required|sameAs:${newPassword}`"/>
      <button type="submit" class="btn-blue">change password</button>
    </VeeForm>
    <UserProfileCardEditorReauthenticate :modal-value="needsReAuth" @success="onReauthenticated" @fail="onReauthenticatedFailed" />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import UserProfileCardEditorRandomAvatar from '@/components/UserProfileCardEditorRandomAvatar'
import UserProfileCardEditorReauthenticate from '@/components/UserProfileCardEditorReauthenticate'
import useNotification from '@/composables/useNotification'
export default {
  components: { UserProfileCardEditorReauthenticate, UserProfileCardEditorRandomAvatar },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup () {
    const { addNotification } = useNotification()
    return { addNotification }
  },
  data () {
    return {
      uploadingImage: false,
      activeUser: { ...this.user },
      locationOptions: [],
      needsReAuth: false,
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  },
  methods: {
    ...mapActions(['uploadAvatar']),
    async loadLocationOptions () {
      const res = await fetch('https://restcountries.com/v3.1/all')
      this.locationOptions = await res.json()
    },
    async changePassword () {
      try {
        await this.$store.dispatch('changePassword', { email: this.activeUser.email, currentPassword: this.currentPassword, newPassword: this.newPassword })
        this.$router.push({ name: 'Profile' })
        this.addNotification({ message: 'user successfully updated', timeout: 5000 })
      } catch (e) {
        console.log(e)
      }
    },
    async handleAvatarUpload (e) {
      this.uploadingImage = true
      const file = e.target.files[0]
      const uploadedImage = await this.uploadAvatar({ file })
      this.activeUser.avatar = uploadedImage || this.activeUser.avatar
      this.uploadingImage = false
    },
    async handleRandomAvatarUpload () {
      const randomAvatarGenerated = this.activeUser.avatar.startsWith('https://pixabay')
      if (randomAvatarGenerated) {
        const image = await fetch(this.activeUser.avatar)
        const blob = await image.blob()
        this.activeUser.avatar = await this.uploadAvatar({ file: blob, fileName: 'random' })
      }
    },
    async onReauthenticatedFailed () {
      this.addNotification({ message: 'Error updating user', timeout: 5000, type: 'error' })
      this.$router.push({ name: 'Profile' })
    },
    async onReauthenticated () {
      await this.$store.dispatch('updateEmail', { email: this.activeUser.email })
      await this.saveUserData()
    },
    async saveUserData () {
      await this.$store.dispatch('updateUser', { ...this.activeUser, threads: this.activeUser.threadIds })
      this.$router.push({ name: 'Profile' })
      this.addNotification({ message: 'user successfully updated', timeout: 5000 })
    },
    async save () {
      await this.handleRandomAvatarUpload()
      const emailChanged = this.activeUser.email !== this.user.email
      if (emailChanged) {
        this.needsReAuth = true
      } else {
        await this.saveUserData()
      }
    },
    cancel () {
      this.$router.push({ name: 'Profile' })
    }
  }
}
</script>
