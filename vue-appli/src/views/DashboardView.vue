<template>
  <div class="dashboard">
    <h1 class="title mt-5">ダッシュボード</h1>

    <table class="table">
      <thead>
        <tr>
          <th>チェックリスト名</th>
          <th>&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="checklist in checklists" :key="checklist.id">
          <tr>
              <td class="is-vcentered">{{checklist.title}}</td>
              <td>
                <router-link :to="{ name: 'checklist', params: {id: checklist.id } }" class="button is-primary">詳細</router-link>
              </td>
          </tr>
        </template>
      </tbody>
    </table>

    <div class="modal is-active" v-if="createPopup">
      <div class="modal-background" @click="createPopup=false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-size-6">新規チェックリスト作成</p>
          <button class="delete" aria-label="close" @click="createPopup=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="content">
            
            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label">タイトル<span class="has-text-danger">*</span></label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input class="input" type="text" placeholder="チェックリストのタイトル" v-model="title">
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success" @click="createChecklist">作成する</button>
          <button class="button" @click="createPopup=false">キャンセル</button>
        </footer>
      </div>
    </div>

    
  </div>
</template>

<script>
  import { db } from "../main";
  import { collection, addDoc, query, where, getDocs } from "firebase/firestore"; 

  export default {
    data(){
      return {
        title: "",
        checklists: [],
        createPopup: false,
      }
    },
    created: async function () {
      getDocs(query(collection(db, "checklists"), where("user", "==", this.$store.getters.user.uid))).then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const checklist = {
            id: doc.id,
            title: doc.data().title
          }
          console.log(checklist);
          this.checklists.push(checklist);
        })
      })
    },
    watch: {
      createPopup: function(){
          this.title = ""  
      }
    },
    methods: {
      createChecklist: async function(){
        // Add a new document with a generated id.
        const docRef = await addDoc(collection(db, "checklists"), {
          title: this.title,
          user: this.$store.getters.user.uid
        });
        this.$router.push('/checklist/' + docRef.id);

        this.createPopup = false;
      }

    }
    
  }
</script>
