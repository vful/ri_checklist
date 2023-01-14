<template>
  <div class="checklist">
    <h1 class="title">{{ checklist.title }}</h1>
    <Tree :value="treeData" triggerClass="drag-trigger">
        <template v-slot="{node, index, path, tree}">
          <div class="level" v-bind:style="{ 'opacity': (node.$checked) ? .4 : 1 }">
            {{  }}
            <div class="level-left">
              <button class="drag-trigger button mr-3" v-if="dragFlag"><fa icon="bars" /></button>
              <div class="">
                <label class="mr-2 is-size-5" style="cursor:pointer;">
                  <input type="checkbox" :checked="node.$checked" @change="tree.toggleCheck(node, path)" />
                </label>
                <b style="display:none;">{{index}}</b>
                <button class="button is-text" @click="statusPopup">{{node.text}}</button>
                <span style="display:none;">- path: <i>{{path.join(',')}}</i></span>
              </div>
            </div>
            <div class="level-right">
              <button class="button level-right" @click="statusPopup">項目名編集</button>
              <button class="button is-danger level-right ml-1" @click="deleteTaskPopup(node.id, node.text)">削除</button>
            </div>
          </div>

        </template>
    </Tree>

    <div class="has-text-right">
      <button class="button button-primary" @click="dragFlag=true" v-if="!dragFlag">並び替えをする</button>
      <button class="button button-primary" @click="updateOrder" v-if="dragFlag">並び替えを確定する</button>

      <button class="button is-primary ml-2" @click="addTaskPopup">新しく項目を追加する</button>
    </div>

    <div class="modal is-active" v-if="taskPopup">
      <div class="modal-background" @click="taskPopup=false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-size-6">新規タスク作成</p>
          <button class="delete" aria-label="close" @click="taskPopup=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="content">
            
            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label">タスク名</label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input class="input" type="text" placeholder="タスク名" v-model="text">
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
          <button class="button is-success" @click="addTask">作成する</button>
          <button class="button" @click="taskPopup=false">キャンセル</button>
        </footer>
      </div>
    </div>
    <div class="modal is-active" v-if="deletePopup">
      <div class="modal-background" @click="taskPopup=false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-size-6">タスク削除確認</p>
          <button class="delete" aria-label="close" @click="taskPopup=false"></button>
        </header>
        <section class="modal-card-body">
          <div class="content">
            
            <div class="field is-horizontal">
              「{{ deleteTaskName }}」を削除してよろしいですか？<br>
              ※子タスクがある場合は子タスクも同時に削除します
            </div>

          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-danger" @click="deleteTask">削除する</button>
          <button class="button" @click="deletePopup=false">キャンセル</button>
        </footer>
      </div>
    </div>


  </div>
</template>

<script>
  import {
    // -------- Base Tree
    Tree,
    // -------- Plugins
    // Fold,
    Check,
    Draggable,
    // foldAll, unfoldAll, cloneTreeData, walkTreeData, getPureTreeData, // utils
  } from 'he-tree-vue'
  import 'he-tree-vue/dist/he-tree-vue.css' // base style
  import { db } from "../main";
  import { doc, addDoc, getDoc, getDocs, query, collection, where, runTransaction} from "firebase/firestore";
  // import { addDoc, collection} from "firebase/firestore";

  export default {
    components: {Tree: Tree.mixPlugins([Check, Draggable])},
    data(){
      return {
        text: '',
        checklist_id: this.$route.params.id,
        checklist: {'title': ""},
        treeData: [],
        nodeData: [],
        dragFlag: false,
        taskPopup: false,
        deletePopup: false,
        deleteId: '',
        deleteTaskName: '',

      }
    },
    created: async function () {
      const docSnap = await getDoc(doc(db, "checklists", this.checklist_id));
      if (docSnap.exists()) {
          this.checklist = {...docSnap.data()};
      } else {
          this.$router.push('/error');
      }

      getDocs(query(collection(db, "tasks"), where("checklist", "==", this.checklist_id))).then(querySnapshot => {
        const data = [];
        querySnapshot.forEach(doc => {
          const node = {
            id: doc.id,
            text: doc.data().text,
            depth: doc.data().depth,
            order: doc.data().order,
            checklist: this.checklist_id,
            status: Boolean(doc.data().order.status),
          };
          data.push(node);
        })

        // 取得データを並び替え（firestore側でのインデックス設定が動作しないためプログラム上で処理）
        data.sort(function(a,b){
            if(a.order<b.order) return -1;
            if(a.order > b.order) return 1;
            return 0;
        });
        // treeの作成
        this.treeData = this.createTree(data);
      })
    },
    watch: {
      taskPopup: function(){
          this.text = ""  
      }
    },
    methods: {
      recursiveCreateNode: function(data, nodelist = [], depth = 1){
        for(let i = 0; i < data.length; i ++){
          const node = {
            id: data[i].id,
            text: data[i].text,
            depth: depth,
            order: nodelist.length,
            checklist: this.checklist_id,
            status: Boolean(data[i].$checked),
          };
          nodelist.push(node);
          if('children' in data[i]){
            this.recursiveCreateNode(data[i].children, nodelist, depth+1);
          }
        }
        return nodelist;
      },
      createTree: function(data){
        const treelist = [];
        for(let i = 0; i < data.length; i ++){
          const node = {
            id: data[i].id, 
            text: data[i].text + "",
            depth: data[i].depth,
            order: data[i].order,
            children: [],
            $checked: false,
            checklist: this.checklist_id,
          }

          let parent = treelist;
          for(let j = 1; j < data[i].depth; j ++){
            parent = parent[parent.length - 1].children;
          }
          parent.push(node);
        }
        return treelist;
      },
      statusPopup: function(){
      },
      deleteTaskPopup:function(id, text){
        this.deleteTaskName = text
        this.deleteId= id
        this.deletePopup = true
      },
      deleteTask: async function(){
        const data = this.recursiveCreateNode(this.treeData);
        for(let i = 0; i < data.length; i++){
          if(data[i].id === this.deleteId){
            // 削除用配列の作成
            const deleteNode = [];

            // IDが一致するデータを削除配列に追加
            deleteNode.push(data[i]);

            // 子要素（自分以降の要素）の探索
            for(let j = i+1; j < data.length; j ++){
              // 子要素を削除配列に追加
              if(data[i].depth < data[j].depth){
                deleteNode.push(data[j]);
              }
              // 子要素じゃなかったらループを抜ける
              else{
                j = data.length;
              }
            }
            try {
              // Firestore上からデータを削除
              await runTransaction(db, async (transaction) => {
                for(let j = 0; j < deleteNode.length; j++){
                  const docRef = doc(db, "tasks", deleteNode[j].id);
                  transaction.delete(docRef);
                }
              });
              console.log('Transaction success!');

              // 配列上のデータを削除
              data.splice(i, deleteNode.length);

              // 並び順再採番
              for(let j = 0; j < data.length; j++){
                data[j].order = j;
              }
              // treeの再生成
              this.treeData = this.createTree(data);
            } catch (error) {
              console.log('Transaction failure!');
              console.log(error);
              const errorCode = error.code;
              const errorMessage = error.message;
              console.log(errorCode);
              console.log(errorMessage);
            }
            // ループを抜けるためにiを上書き
            i = data.length;
          }
        }
        // ポップアップ非表示
        this.deletePopup = false;
      },
      addTaskPopup: function(){
        this.taskPopup = true
      },
      addTask: async function(){
        const data = this.recursiveCreateNode(this.treeData);
        const node = {
            text: this.text,
            depth: 1,
            order: data.length,
            children: [],
            $checked: false,
            checklist: this.checklist_id,
        };
        // firestore上に追加
        const docRef = await addDoc(collection(db, "tasks"), node);
        // 追加されたIDを取得
        node.id = docRef.id;
        // 配列の更新
        data.push(node);
        // treeの再生成
        this.treeData = this.createTree(data);
        // ポップアップ非表示
        this.text = '';
        this.taskPopup = false;
      },
      updateOrder: async function(){
        const data = this.recursiveCreateNode(this.treeData);

        try {
          await runTransaction(db, async (transaction) => {
            for(let i = 0; i < data.length; i++){
              const docRef = doc(db, "tasks", data[i].id);
              transaction.update(docRef, {'order': data[i].order, 'depth': data[i].depth});
            }
          });
          console.log('Transaction success!');
        } catch (error) {
          console.log('Transaction failure!');
          console.log(error);
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode);
          console.log(errorMessage);
        }

        this.dragFlag = false;
      }
    }
    
  }
</script>
