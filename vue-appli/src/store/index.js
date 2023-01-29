import { createStore } from 'vuex'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "../main";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default createStore({
  state: {
    user: null,
    userInfo: null,
  },
  getters: {
    user: function(state){
      return state.user;
    },
    userInfo: function(state){
      return state.userInfo;
    },
  },
  mutations: {
    setUser: function(state, value){
      state.user = value;
    },
    setUserInfo: function(state, value){
      state.userInfo = value;
    },
  },
  actions: {
    isSignedIn: function({commit}){
      return new Promise((resolve, reject) => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
          if (user) {
            const getUserInfo = async function(user){       
              const docSnap = await getDoc(doc(db, "users", user.uid));
              if (docSnap.exists()) {
                  const userInfo = {...docSnap.data()};
                  commit('setUserInfo', userInfo);
                  commit('setUser', user);
                  resolve();
              } else {
                  console.log("No such document!");
              }
            };
            getUserInfo(user);
          } else {
            console.log('User is signed out');
            reject();
          }
        });
      });
    },
    signUp: function({commit}, {name, email, password}){
      return new Promise((resolve, reject) => {
        console.log(name);
        console.log(email);
        console.log(password);
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email, password)
          .then((response) => {
            // Signed in 
            const user = response.user;
            const userInfo = {
              name: name,
              email: email
            }
            setDoc(doc(db ,'users' , user.uid), userInfo);

            commit('setUser', user);
            commit('setUserInfo', userInfo);
            resolve();
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
            reject(errorCode);
          });
      });
    },
    signIn: function({commit}, {email, password}){
      return new Promise((resolve, reject) => {
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
        .then((response) => {
            const getUserInfo = async function(uid){                    
                const docRef = doc(db, "users", uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const userInfo = {...docSnap.data()};
                    commit('setUserInfo', userInfo);
                    commit('setUser', response.user);
                    resolve(response);
                } else {
                    console.log("No such document!");
                }
            };
            getUserInfo(response.user.uid);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode);
          console.log(errorMessage);
          reject(errorCode)
        });
      });
    },
    signOut: function({commit}){
      return new Promise((resolve, reject) => {
        const auth = getAuth();
        signOut(auth).then(() => {
            commit('setUser', null);
            commit('setUserInfo', null);
            resolve();
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
            reject(errorCode)
        });
      });
    }
    
  },
  modules: {
  }
})
