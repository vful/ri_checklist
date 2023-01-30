<template>
  <div class="dashboard">
    <h1 class="title mt-5">案件一覧</h1>

    <p class="has-text-right">
      <button class="button is-primary" @click="createPopup=true">
        <span class="icon-text">
          <span class="icon">
            <fa icon="plus" />
          </span>
          <span>新しくチェックリストを作る</span>
        </span>
      </button>
    </p>
    <table class="table is-fullwidth">
      <thead>
        <tr>
          <th>チェックリスト名</th>
          <th>&nbsp;</th>
          <th>&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="checklist in checklists" :key="checklist.id">
          <tr>
              <td class="is-vcentered">{{checklist.title}}</td>
              <td class="has-text-centered">
                <router-link :to="{ name: 'checklist', params: {id: checklist.id } }" class="button is-primary">詳細</router-link>
              </td>
              <td class="has-text-centered">
                <button class="button is-danger" @click="deleteChecklistPopup(checklist.id, checklist.title)">削除</button>
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
                <label class="label">タイトル</label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded has-icons-left">
                    <input class="input" type="text" placeholder="チェックリストのタイトル" v-model="title">
                    <span class="icon is-small is-left">
                      <i class="fas fa-user"></i>
                    </span>
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

    <div class="modal is-active" v-if="deletePopup">
        <div class="modal-background" @click="deletePopup=false"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title is-size-6">チェックリスト削除確認</p>
            <button class="delete" aria-label="close" @click="deletePopup=false"></button>
          </header>
          <section class="modal-card-body">
            <div class="content">
              
              <div class="field is-horizontal">
                「{{ deleteChecklistTitle }}」を削除してよろしいですか？<br>
              </div>
  
            </div>
          </section>
          <footer class="modal-card-foot">
            <button class="button is-danger" @click="deleteChecklist">削除する</button>
            <button class="button" @click="deletePopup=false">キャンセル</button>
          </footer>
        </div>
      </div>
    
  </div>
</template>

<script>
  import { db } from "../main";
  import { doc, collection, addDoc, query, where, getDocs, runTransaction } from "firebase/firestore"; 

  export default {
    data(){
      return {
        title: "",
        checklists: [],
        createPopup: false,
        deleteChecklistTitle: '',
        deleteId: '',
        deletePopup: false,
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
      },

      deleteChecklistPopup:function(id, title){
        this.deleteChecklistTitle = title
        this.deleteId= id
        this.deletePopup = true
      },
      deleteChecklist: async function(){
        const tasks = [];
        getDocs(query(collection(db, "tasks"), where("checklist", "==", this.deleteId))).then(querySnapshot => {
            querySnapshot.forEach(doc => {
                tasks.push(doc.id);
            })
            try {
              // Firestore上からデータを削除
              console.log(tasks);
              let transactionCount = 0;
              runTransaction(db, async (transaction) => {
                for(let j = 0; j < tasks.length; j++){
                  const docRef = doc(db, "tasks", tasks[j]);
                  transaction.delete(docRef);
                  transactionCount ++;
                }
                const checklistRef = doc(db, "checklists", this.deleteId);
                transaction.delete(checklistRef);
              });
              console.log(`Transaction success!(Count:${transactionCount})`);
              for(let i = 0; i < this.checklists.length; i++){
                if(this.deleteId === this.checklists[i].id){
                    // 配列上のデータを削除
                    this.checklists.splice(i, 1);
                }
              }
              
            } catch (error) {
              console.log('Transaction failure!');
              console.log(error);
              const errorCode = error.code;
              const errorMessage = error.message;
              console.log(errorCode);
              console.log(errorMessage);
            }
            this.deletePopup = false;
        });
      }

    }
    
  }
</script>
