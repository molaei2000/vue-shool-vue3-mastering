import { findById } from '@/helpers'
import firebase from 'firebase'

export default {
  createPost ({ commit, state }, post) {
    post.id = 'ggqq' + Math.random()
    post.userId = state.authId
    post.publishedAt = Math.floor(Date.now() / 1000)
    commit('setItem', { resource: 'posts', item: post }) // set the post
    commit('appendPostToThread', { childId: post.id, parentId: post.threadId }) // append post to thread
    commit('appendContributorToThread', { childId: state.authId, parentId: post.threadId })
  },
  async createThread ({ commit, state, dispatch }, { text, title, forumId }) {
    const id = 'ggqq' + Math.random()
    const userId = state.authId
    const publishedAt = Math.floor(Date.now() / 1000)
    const thread = { forumId, title, publishedAt, userId, id }
    commit('setItem', { resource: 'threads', item: thread })
    commit('appendThreadToUser', { parentId: userId, childId: id })
    commit('appendThreadToForum', { parentId: forumId, childId: id })
    dispatch('createPost', { text, threadId: id })
    return findById(state.threads, id)
  },
  async updateThread ({ commit, state }, { title, text, id }) {
    const thread = findById(state.threads, id)
    const post = findById(state.posts, thread.posts[0])
    const newThread = { ...thread, title }
    const newPost = { ...post, text }
    commit('setItem', { resource: 'threads', item: newThread })
    commit('setItem', { resource: 'posts', item: newPost })
    return newThread
  },
  // ------------------------
  // fetch single resource
  // ------------------------
  updateUser ({ commit }, user) {
    commit('setItem', { resource: 'users', item: user })
  },
  fetchCategory ({ dispatch }, { id }) {
    return dispatch('fetchItem', { resource: 'categories', id })
  },
  fetchThread ({ dispatch }, { id }) {
    return dispatch('fetchItem', { resource: 'threads', id })
  },
  fetchForum ({ dispatch }, { id }) {
    return dispatch('fetchItem', { resource: 'forums', id })
  },
  fetchUser ({ dispatch }, { id }) {
    return dispatch('fetchItem', { resource: 'users', id })
  },
  fetchPost ({ dispatch }, { id }) {
    return dispatch('fetchItem', { resource: 'posts', id })
  },
  fetchItem ({ state, commit }, { id, resource }) {
    return new Promise((resolve) => {
      firebase.firestore().collection(resource).doc(id).onSnapshot((doc) => {
        const item = { ...doc.data(), id: doc.id }
        commit('setItem', { resource, id, item })
        resolve(item)
      })
    })
  },
  // ------------------------
  // fetch multiple resource
  // ------------------------
  fetchThreads ({ dispatch }, { ids }) {
    return dispatch('fetchItems', { resource: 'threads', ids })
  },
  fetchForums ({ dispatch }, { ids }) {
    return dispatch('fetchItems', { resource: 'forums', ids })
  },
  fetchUsers ({ dispatch }, { ids }) {
    return dispatch('fetchItems', { resource: 'users', ids })
  },
  fetchPosts ({ dispatch }, { ids }) {
    return dispatch('fetchItems', { resource: 'posts', ids })
  },
  fetchItems ({ dispatch }, { ids, resource }) {
    return Promise.all(ids.map(id => dispatch('fetchItem', { id, resource }))
    )
  },
  fetchAllCategories ({ commit }) {
    return new Promise(resolve => {
      firebase.firestore().collection('categories').onSnapshot(querySnapshot => {
        console.log(querySnapshot)
        const categories = querySnapshot.docs.map(doc => {
          const item = { ...doc.data(), id: doc.id }
          commit('setItem', { resource: 'categories', item })
          return item
        })
        resolve(categories)
      })
    })
  }
}
