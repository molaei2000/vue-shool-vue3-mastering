import firebase from '@/helpers/firebase'
import { findById, docToResource, makeFetchItemAction, makeFetchItemsAction } from '@/helpers'
import chunk from 'lodash/chunk'
import useNotification from '@/composables/useNotification'

export default {
  async updateEmail ({ state }, { email }) {
    return await firebase.auth().currentUser.updateEmail(email)
  },
  async reauthenticate ({ state }, { email, password }) {
    const credential = await firebase.auth.EmailAuthProvider.credential(email, password)
    await firebase.auth().currentUser.reauthenticateWithCredential(credential)
  },
  async changePassword ({ state }, { email, currentPassword, newPassword }) {
    const credential = await firebase.auth.EmailAuthProvider.credential(email, currentPassword)
    await firebase.auth().currentUser.reauthenticateWithCredential(credential).then(() => {
      firebase.auth().currentUser.updatePassword(newPassword).then(() => {
        console.log('changing password success')
      }).catch((error) => {
        console.log(error)
      })
    }).catch(e => {
      console.log(e)
    })
  },
  initAuthentication ({ dispatch, commit, state }) {
    if (state.authObserverUnsubscribe) return
    return new Promise((resolve) => {
      const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
        console.log('👣 the user has changed')
        this.dispatch('unsubscribeAuthUserSnapshot')
        if (user) {
          await this.dispatch('fetchAuthUser')
          resolve(user)
        } else {
          resolve(null)
        }
      })
      commit('setAuthObserverUnsubscribe', unsubscribe)
    })
  },
  async createPost ({ commit, state }, post) {
    post.userId = state.authId
    post.publishedAt = firebase.firestore.FieldValue.serverTimestamp()
    post.firstInThread = post.firstInThread || false
    const batch = firebase.firestore().batch()
    const postRef = firebase.firestore().collection('posts').doc()
    const threadRef = firebase.firestore().collection('threads').doc(post.threadId)
    const userRef = firebase.firestore().collection('users').doc(state.authId)
    batch.set(postRef, post)
    const threadUpdates = {
      posts: firebase.firestore.FieldValue.arrayUnion(postRef.id)
    }
    if (!post.firstInThread) threadUpdates.contributors = firebase.firestore.FieldValue.arrayUnion(state.authId)
    batch.update(threadRef, threadUpdates)
    batch.update(userRef, {
      postsCount: firebase.firestore.FieldValue.increment(1)
    })
    await batch.commit()
    const newPost = await postRef.get()
    commit('setItem', { resource: 'posts', item: { ...newPost.data(), id: newPost.id } }) // set the post
    commit('appendPostToThread', { childId: newPost.id, parentId: post.threadId }) // append post to thread
    if (!post.firstInThread) {
      commit('appendContributorToThread', { childId: state.authId, parentId: post.threadId })
    }
  },
  async updatePost ({ commit, state }, { text, id }) {
    const post = {
      text,
      edited: {
        at: firebase.firestore.FieldValue.serverTimestamp(),
        by: state.authId,
        moderated: false
      }
    }
    const postRef = firebase.firestore().collection('posts').doc(id)
    await postRef.update(post)
    const updatedPost = await postRef.get()
    commit('setItem', { resource: 'posts', item: updatedPost })
  },
  async createThread ({ commit, state, dispatch }, { text, title, forumId }) {
    const userId = state.authId
    const publishedAt = firebase.firestore.FieldValue.serverTimestamp()
    const threadRef = firebase.firestore().collection('threads').doc()
    const thread = { forumId, title, publishedAt, userId, id: threadRef.id }
    const userRef = firebase.firestore().collection('users').doc(userId)
    const forumRef = firebase.firestore().collection('forums').doc(forumId)
    const batch = firebase.firestore().batch()

    batch.set(threadRef, thread)
    batch.update(userRef, {
      threads: firebase.firestore.FieldValue.arrayUnion(threadRef.id)
    })
    batch.update(forumRef, {
      threads: firebase.firestore.FieldValue.arrayUnion(threadRef.id)
    })
    await batch.commit()
    const newThread = await threadRef.get()

    commit('setItem', { resource: 'threads', item: { ...newThread.data(), id: newThread.id } })
    commit('appendThreadToUser', { parentId: userId, childId: threadRef.id })
    commit('appendThreadToForum', { parentId: forumId, childId: threadRef.id })
    await dispatch('createPost', { text, threadId: threadRef.id, firstInThread: true })
    return findById(state.threads, threadRef.id)
  },
  async updateThread ({ commit, state }, { title, text, id }) {
    const thread = findById(state.threads, id)
    const post = findById(state.posts, thread.posts[0])
    let newThread = { ...thread, title }
    let newPost = { ...post, text }
    const threadRef = firebase.firestore().collection('threads').doc(id)
    const postRef = firebase.firestore().collection('posts').doc(post.id)
    const batch = firebase.firestore().batch()
    batch.update(threadRef, newThread)
    batch.update(postRef, newPost)
    await batch.commit()
    newThread = await threadRef.get()
    newPost = await postRef.get()
    commit('setItem', { resource: 'threads', item: newThread })
    commit('setItem', { resource: 'posts', item: newPost })
    return docToResource(newThread)
  },
  async registerUserWithEmailAndPassword ({ dispatch }, { avatar = null, email, name, username, password }) {
    const result = await firebase.auth().createUserWithEmailAndPassword(email, password)
    avatar = await dispatch('uploadAvatar', { authId: result.user.uid, file: avatar })
    await dispatch('createUser', { id: result.user.uid, email, name, username, avatar })
  },
  async uploadAvatar ({ state }, { authId, file, fileName }) {
    if (!file) return null
    authId = authId || state.authId
    fileName = fileName || file.name
    try {
      const storageBucket = firebase.storage().ref().child(`uploads/${authId}/images/${Date.now()}-${fileName}`)
      const snapshot = await storageBucket.put(file)
      const url = await snapshot.ref.getDownloadURL()
      return url
    } catch (e) {
      const { addNotification } = useNotification()
      addNotification({ message: 'Error in uploading avatar', timeout: 5000, type: 'error' })
    }
  },
  signInWithEmailAndPassword (context, { email, password }) {
    return firebase.auth().signInWithEmailAndPassword(email, password)
  },
  async signInWithGoogle ({ dispatch }) {
    const provider = new firebase.auth.GoogleAuthProvider()
    const response = await firebase.auth().signInWithPopup(provider)
    const user = response.user
    const userRef = await firebase.firestore().collection('users').doc(user.uid)
    const userDoc = await userRef.get()
    if (!userDoc.exists) {
      return dispatch('createUser', { id: user.uid, name: user.displayName, email: user.email, username: user.email, avatar: user.photoURL })
    }
  },
  async signOut ({ commit }) {
    await firebase.auth().signOut()
    commit('setAuthId', null)
  },
  async createUser ({ commit }, { id, email, name, username, avatar = null }) {
    const registeredAt = firebase.firestore.FieldValue.serverTimestamp()
    const usernameLower = username.toLowerCase()
    email = email.toLowerCase()
    const user = { avatar, email, name, username, usernameLower, registeredAt }
    const userRef = await firebase.firestore().collection('users').doc(id)
    userRef.set(user)
    const newUser = await userRef.get()
    commit('setItem', { resource: 'users', item: newUser })
    return docToResource(newUser)
  },
  async updateUser ({ commit }, user) {
    const updates = {
      avatar: user.avatar || null,
      username: user.username || null,
      name: user.name || null,
      bio: user.bio || null,
      website: user.website || null,
      email: user.email || null,
      location: user.location || null
    }
    const userRef = firebase.firestore().collection('users').doc(user.id)
    await userRef.update(updates)
    commit('setItem', { resource: 'users', item: user })
  },
  // ---------------------------------------
  // Fetch Single Resource
  // ---------------------------------------
  fetchCategory: ({ dispatch }, { id }) => dispatch('fetchItem', { emoji: '🏷', resource: 'categories', id }),
  fetchForum: ({ dispatch }, { id }) => dispatch('fetchItem', { emoji: '🏁', resource: 'forums', id }),
  fetchThread: makeFetchItemAction({ emoji: '📄', resource: 'threads' }),
  fetchPost: ({ dispatch }, { id }) => dispatch('fetchItem', { emoji: '💬', resource: 'posts', id }),
  fetchUser: ({ dispatch }, { id }) => dispatch('fetchItem', { emoji: '🙋', resource: 'users', id }),
  fetchAuthUser: async ({ dispatch, state, commit }) => {
    const userId = firebase.auth().currentUser?.uid
    if (!userId) return
    await dispatch('fetchItem', {
      emoji: '🙋',
      resource: 'users',
      id: userId,
      handleUnsubscribe: (unsubscribe) => {
        commit('setAuthUserUnsubscribe', unsubscribe)
      }
    })
    commit('setAuthId', userId)
  },
  // ---------------------------------------
  // Fetch All of a Resource
  // ---------------------------------------
  fetchAllCategories ({ commit }) {
    return new Promise((resolve) => {
      firebase.firestore().collection('categories').onSnapshot((querySnapshot) => {
        const categories = querySnapshot.docs.map(doc => {
          const item = { id: doc.id, ...doc.data() }
          commit('setItem', { resource: 'categories', item })
          return item
        })
        resolve(categories)
      })
    })
  },
  async fetchAuthUsersPosts ({ commit, state }, { startAfter }) {
    let query = await firebase.firestore().collection('posts')
      .where('userId', '==', state.authId)
      .orderBy('publishedAt', 'desc')
      .limit(3)
    if (startAfter) {
      const doc = await firebase.firestore().collection('posts').doc(startAfter.id).get()
      query = query.startAfter(doc)
    }
    const posts = await query.get()
    posts.forEach(post => {
      commit('setItem', { resource: 'posts', item: post })
    })
  },
  // ---------------------------------------
  // Fetch Multiple Resources
  // ---------------------------------------
  fetchCategories: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'categories', ids, emoji: '🏷' }),
  fetchForums: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'forums', ids, emoji: '🏁' }),
  fetchThreads: makeFetchItemsAction({ emoji: '📄', resource: 'threads' }),
  fetchThreadsByPage: ({ dispatch, commit }, { ids, page, perPage = 5 }) => {
    commit('clearThreads')
    const chunks = chunk(ids, perPage)
    const limitedIds = chunks[page - 1]
    return dispatch('fetchThreads', { ids: limitedIds })
  },
  fetchPosts: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'posts', ids, emoji: '💬' }),
  fetchUsers: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'users', ids, emoji: '🙋' }),

  fetchItem ({ state, commit }, { id, emoji, resource, handleUnsubscribe = null, once = false, onSnapshot = null }) {
    return new Promise((resolve) => {
      const unsubscribe = firebase.firestore().collection(resource).doc(id).onSnapshot((doc) => {
        if (once) {
          unsubscribe()
        }
        if (doc.exists) {
          const item = { ...doc.data(), id: doc.id }
          let prevItem = findById(this.state[resource], id)
          prevItem = prevItem ? { ...prevItem } : null
          commit('setItem', { resource, item })
          if (typeof onSnapshot === 'function') {
            const isLocal = doc.metadata.hasPendingWrites
            onSnapshot({ item: { ...item }, prevItem, isLocal })
          }
          resolve(item)
        } else {
          resolve(null)
        }
      })
      if (handleUnsubscribe) {
        handleUnsubscribe(unsubscribe)
      } else {
        commit('appendUnsubscribe', { unsubscribe })
      }
    })
  },
  fetchItems ({ dispatch }, { ids, resource, emoji, onSnapshot = null }) {
    ids = ids || []
    return Promise.all(ids.map(id => dispatch('fetchItem', { id, resource, emoji, onSnapshot })))
  },
  clearItems ({ commit }, { modules = [] }) {
    commit('clearItems', { modules })
  },
  async unsubscribeAllSnapshots ({ state, commit }) {
    state.unsubscribes.forEach(unsubscribe => unsubscribe())
    commit('clearAllUnsubscribes')
  },
  async unsubscribeAuthUserSnapshot ({ state, commit }) {
    if (state.authUserUnsubscribe) {
      state.authUserUnsubscribe()
      commit('setAuthUserUnsubscribe', null)
    }
  }
}
