<template>
  <div class="form-group">
    <label :for="name">{{ label }}</label>
    <VeeField
      :name="name"
      :label="label"
      :id="name"
      :type="type"
      :modelValue="modelValue"
      @input="$emit('modelUpdate',$event)"
      v-bind="$attrs"
      class="form-input"
    />
    <VeeErrorMessage :name="name" class="from-error"/>
  </div>
</template>

<script>
export default {
  name: 'AppFormField',
  inheritAttrs: false,
  props: {
    name: { type: String, required: true },
    label: { type: String, required: false },
    type: { type: String, default: 'text' },
    modelValue: { type: String, default: '' }
  }
}
</script>

<style scoped>
.from-error {
  color: #C82543;
  padding: 2px 5px;
  border: 1px solid red;
  border-radius: 10px;
}
</style>
