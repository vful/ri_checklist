<template>
  <div class="checklist">
    <h1 class="title">{{ checklist.title }}</h1>
    <Tree :value="treeData" triggerClass="drag-trigger">
        <template v-slot="{node, index, path, tree}">
          <div class="level" v-bind:style="{ 'opacity': (node.$checked) ? .4 : 1 }">
            <div class="level-left">
              <button class="drag-trigger button mr-3" v-if="dragFlag"><fa icon="bars" /></button>
              <div class="">
                <label class="mr-2 is-size-5" style="cursor:pointer;"  v-if="!dragFlag">
                  <input type="checkbox" :checked="node.$checked" @change="toggleCheck(tree, node, path)" />
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

    <div class="modal is-active" v-if="addPopup">
      <div class="modal-background" @click="addPopup=false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-size-6">新規タスク作成</p>
          <button class="delete" aria-label="close" @click="addPopup=false"></button>
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
          <button class="button" @click="addPopup=false">キャンセル</button>
        </footer>
      </div>
    </div>
    <div class="modal is-active" v-if="deletePopup">
      <div class="modal-background" @click="addPopup=false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-size-6">タスク削除確認</p>
          <button class="delete" aria-label="close" @click="addPopup=false"></button>
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
        addPopup: false,
        deletePopup: false,
        deleteId: '',
        deleteTaskName: '',

      }
    },
    created: async function () {
      const docSnap = await getDoc(doc(db, "checklists", this.checklist_id));

      // チェックリストが存在しない場合はエラーページへ
      if (docSnap.exists()) {
          this.checklist = {...docSnap.data()};
      } else {
          this.$router.push('/error');
      }

      // firestoreからタスク一覧データを取得
      getDocs(query(collection(db, "tasks"), where("checklist", "==", this.checklist_id))).then(querySnapshot => {
        const data = [];
        querySnapshot.forEach(doc => {
          const node = {
            id: doc.id,
            text: doc.data().text,
            depth: doc.data().depth,
            order: doc.data().order,
            checklist: this.checklist_id,
            $checked: Boolean(doc.data().$checked),
            status: Boolean(doc.data().status),
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
        this.nodeData = this.recursiveCreateNode(this.treeData);
      })
    },
    watch: {
      addPopup: function(){
          this.text = ""  
      },

    },
    methods: {
      /* 
       * ツリーデータ→配列データへの変換処理
       */
      recursiveCreateNode: function(data, nodelist = [], depth = 1){
        for(let i = 0; i < data.length; i ++){
          const node = {
            id: data[i].id,
            text: data[i].text,
            depth: depth,
            order: nodelist.length,
            checklist: this.checklist_id,
            $checked: Boolean(data[i].$checked),
            status: Boolean(data[i].$checked),
          };
          nodelist.push(node);
          if('children' in data[i]){
            this.recursiveCreateNode(data[i].children, nodelist, depth+1);
          }
        }
        return nodelist;
      },
      /* 
       * 配列データ→ツリー生成の変換処理
       */
      createTree: function(data){
        const treelist = [];
        for(let i = 0; i < data.length; i ++){
          console.log(data[i]);
          const node = {
            id: data[i].id, 
            text: data[i].text + "",
            depth: data[i].depth,
            order: data[i].order,
            children: [],
            $checked: Boolean(data[i].$checked),
            status: Boolean(data[i].$checked),
            checklist: this.checklist_id,
          }
          // console.log(node);

          let parent = treelist;
          for(let j = 1; j < data[i].depth; j ++){
            parent = parent[parent.length - 1].children;
          }
          parent.push(node);
        }
        return treelist;
      },
      toggleCheck: async function(tree, node, path){
        tree.toggleCheck(node, path);
        
        const data = this.recursiveCreateNode(this.treeData);
        try {
          await runTransaction(db, async (transaction) => {
            for(let i = 0; i < data.length; i++){
              // Object同士の比較が難しいのでJSONに変換して比較
              // 参考URL: https://www.deep-rain.com/programming/javascript/755
              if(JSON.stringify(Object.entries(this.nodeData[i]).sort()) != JSON.stringify(Object.entries(data[i]).sort())){
                const docRef = doc(db, "tasks", data[i].id);
                transaction.update(docRef, {'status': data[i].status, '$checked': data[i].$checked});
              }
            }
          });
          console.log('Transaction success!');
          
          this.nodeData = this.recursiveCreateNode(this.treeData);
          
        } catch (error) {
          console.log('Transaction failure!');
          console.log(error);
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode);
          console.log(errorMessage);
        }
      },
      statusPopup: function(){
      },
      /*
       * タスク削除用ポップアップ表示処理
       */
      deleteTaskPopup:function(id, text){
        this.deleteTaskName = text
        this.deleteId= id
        this.deletePopup = true
      },
      /*
       * タスク削除処理
       */
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
              this.nodeData = this.recursiveCreateNode(this.treeData);
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
      /*
       * タスク追加用ポップアップ表示処理
       */
      addTaskPopup: function(){
        this.addPopup = true
      },
      /*
       * タスク追加処理
       */
      addTask: async function(){
        const data = this.recursiveCreateNode(this.treeData);
        const node = {
            text: this.text,
            depth: 1,
            order: data.length,
            children: [],
            $checked: false,
            status: false,
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
        this.nodeData = this.recursiveCreateNode(this.treeData);
        // ポップアップ非表示
        this.text = '';
        this.addPopup = false;
      },
      /*
       * 並び替え保存処理
       */
      updateOrder: async function(){
        const data = this.recursiveCreateNode(this.treeData);
        try {
          await runTransaction(db, async (transaction) => {
            for(let i = 0; i < data.length; i++){
              // Object同士の比較が難しいのでJSONに変換して比較
              // 参考URL: https://www.deep-rain.com/programming/javascript/755
              if(JSON.stringify(Object.entries(this.nodeData[i]).sort()) != JSON.stringify(Object.entries(data[i]).sort())){
                const docRef = doc(db, "tasks", data[i].id);
                transaction.update(docRef, {'order': data[i].order, 'depth': data[i].depth});
              }
            }
          });
          console.log('Transaction success!');
          
          // treeの再生成
          this.treeData = this.createTree(data);
          this.nodeData = this.recursiveCreateNode(this.treeData);
          
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
