<template>
  <div class="checklist">
    <h1 class="title mt-5">{{ checklist.title }}</h1>
    
    <div class="level">
      <div class="level-left"></div>
      <div class="level-right">
        <div class="field">
          <label>モード：</label>
          <input class="is-checkradio" id="modeToggle" type="radio" v-model="mode" name="mode" value="toggle">
          <label for="modeToggle">チェックリスト</label>
          <input class="is-checkradio" id="modeStatus" type="radio" v-model="mode" name="mode" value="status">
          <label for="modeStatus">タスク</label>
        </div>
      </div>
    </div>

    <p style="text-indent:-1em; padding-left:1em;">・子タスクが存在するタスクのステータスを直接変更することはできません。<br>
      親タスクを完了させるには、子タスクを全て「完了」にしてください。</p>

    <Tree :value="treeData" triggerClass="drag-trigger">
        <template v-slot="{node, index, path, tree}">
          <div class="level node-level" v-bind:style="{ 'background-color': (node.$checked) ? '#eee' : '#fff' }">
            <div class="level-left">
              <button class="drag-trigger button mr-3" v-if="dragFlag"><fa icon="bars" /></button>
              <div class="">
                <label class="mr-2 is-size-5" style="cursor:pointer;"  v-if="!dragFlag && mode=='toggle'">
                <!-- <label class="mr-2 is-size-5" style="cursor:pointer;"> -->
                  <input v-bind:class="{'is-checkradio':true, 'has-background-color':node.$checked, 'is-success':node.$checked}" type="checkbox" v-bind:id="node.id" :checked="node.$checked" @change="editCheckbox(tree, node, path)" v-bind:disabled="node.children.length" />
                  <label v-bind:for="node.id"></label>
                </label>
                <b style="display:none;">{{index}}</b>
                <button class="button is-text" @click="statusPopup">{{node.text}}</button>
                <span style="display:none;">- path: <i>{{path.join(',')}}</i></span>
              </div>
            </div>
            <div class="level-right">
              <small class="has-text-grey mr-1">{{ toDate(node.start) }}<span v-if="node.start || node.limit">〜</span>{{ toDate(node.limit) }}</small>
              <div v-if="mode == 'status'" class="select">
                <select v-model="node.status" @change="editTaskStatus(tree, node, path)" v-bind:disabled="node.children.length">
                  <option v-for="(status, index) in statuses" v-bind:value="index" v-bind:key="index" :checked="index == node.status">
                    {{ status }}
                  </option>
                </select>
              </div>
              <button class="button level-right ml-1" @click="editTaskPopup(node.id, node.text, node.status, node.limit, node.start)">編集</button>
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
                    <input class="input" type="text" placeholder="タスク名" v-model="addTaskName">
                  </p>
                </div>
              </div>
            </div>

            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label">着手予定日</label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <v-date-picker :formats="datepickerFormats" :popover="popover" v-model="addTaskStart">
                      <template v-slot="{ inputValue, inputEvents }">
                        <input class="input" type="text" :value="inputValue" v-on="inputEvents" placeholder="例：2023/01/10"  />
                      </template>
                    </v-date-picker>
                  </p>
                </div>
              </div>
            </div>

            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label">期限</label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <v-date-picker :formats="datepickerFormats" :popover="popover" v-model="addTaskLimit">
                      <template v-slot="{ inputValue, inputEvents }">
                        <input class="input" type="text" :value="inputValue" v-on="inputEvents" placeholder="例：2023/01/10"  />
                      </template>
                    </v-date-picker>
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
      <div class="modal-background" @click="deletePopup=false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-size-6">タスク削除確認</p>
          <button class="delete" aria-label="close" @click="deletePopup=false"></button>
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
    <div class="modal is-active" v-if="editPopup">
      <div class="modal-background" @click="editPopup=false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title is-size-6">タスク編集</p>
          <button class="delete" aria-label="close" @click="editPopup=false"></button>
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
                    <input class="input" type="text" placeholder="タスク名" v-model="editTaskName">
                  </p>
                </div>
                
              </div>
            </div>

            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label">着手予定日</label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <v-date-picker :formats="datepickerFormats" :popover="popover" v-model="editTaskStart">
                      <template v-slot="{ inputValue, inputEvents }">
                        <input class="input" type="text" :value="inputValue" v-on="inputEvents" placeholder="例：2023/01/10"  />
                      </template>
                    </v-date-picker>
                  </p>
                </div>
              </div>
            </div>

            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label">期限</label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <v-date-picker :formats="datepickerFormats" :popover="popover" v-model="editTaskLimit">
                      <template v-slot="{ inputValue, inputEvents }">
                        <input class="input" type="text" :value="inputValue" v-on="inputEvents" placeholder="例：2023/01/10"  />
                      </template>
                    </v-date-picker>
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-primary" @click="editTask">編集する</button>
          <button class="button" @click="editPopup=false">キャンセル</button>
        </footer>
      </div>
    </div>


  </div>
</template>

<style>
  .node-level{
    margin: -5px;
    padding:5px;
  }
  .modal-card{ overflow: visible;}
  .modal-card-body{ overflow: visible;}
  .vc-day:has(>.vc-highlights){ pointer-events: none;}
</style>

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
  import { doc, addDoc, updateDoc, getDoc, getDocs, query, collection, where, runTransaction} from "firebase/firestore";

  export default {
    components: {Tree: Tree.mixPlugins([Check, Draggable])},
    data(){
      return {
        checklist_id: this.$route.params.id,
        checklist: {'title': ""},
        treeData: [],
        nodeData: [],
        mode: 'toggle',
        dragFlag: false,
        addPopup: false,
        addTaskName: '',
        addTaskLimit: '',
        addTaskStart: '',
        deletePopup: false,
        deleteId: '',
        deleteTaskName: '',
        editPopup: false,
        editId: '',
        editTaskName: '',
        editStatus: '',
        editTaskLimit: '',
        editTaskStart: '',
        statuses: [
          '未着手',
          '実施中',
          '完了',
        ],

        datepickerFormats: {
          title: "MMMM YYYY",
          weekdays: "W",
          navMonths: "MMM",
          dayPopover: "WWW, MMM D, YYYY",
          input: ["YYYY-MM-DD", "YYYY/MM/DD"],
          data: ["YYYY-MM-DD", "YYYY/MM/DD"]
        }
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

      // チェックリストモード
      this.mode = (this.checklist.mode === 'toggle') ? 'toggle' : 'status';

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
            status: doc.data().status,
            limit: (doc.data().limit) ? doc.data().limit.toDate() : null,
            start: (doc.data().start) ? doc.data().start.toDate() : null,
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
      // チェックリスト管理 / タスク管理のフラグをDBの保存する
      mode: async function(value){
        const docRef = doc(db, "checklists", this.checklist_id);
        await updateDoc(docRef, {
          mode: value,
        });
        this.checklist.mode = value;
      },
      addPopup: function(){
        this.addTaskName = ""  
        this.addTaskLimit = ""
        this.addTaskStart = ""
      },
      deletePopup: function(value){
        if(!value){
          this.deleteId = ''
          this.deleteTaskName = ''
        }
      },
      editPopup: function(value){
        if(!value){
          this.editId = ''
          this.editTaskName = ''
          this.editStatus = ''
          this.editTaskLimit = ""
          this.editTaskStart = ""
        }
      },
      addTaskLimit: function(value){
        console.log(value);
      }

    },
    methods: {
      toDate: function(date){
        if(!date) return '';
        return date.getFullYear() + '年' + (date.getMonth()+1) + '月' + date.getDate() + '日';
      },
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
            status: data[i].status,
            limit: data[i].limit,
            start: data[i].start,
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
          // console.log(data[i]);
          const node = {
            id: data[i].id, 
            text: data[i].text + "",
            depth: data[i].depth,
            order: data[i].order,
            children: [],
            $checked: Boolean(data[i].$checked),
            status: data[i].status,
            limit: data[i].limit,
            start: data[i].start,
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
      /*
       * ステータスに整合性を持たせる
       */
      statusConsistency: function(data){
        let max_depth = 0;
        for(let i = data.length-1; 0 <= i; i--){
          if(max_depth < data[i].depth) max_depth = data[i].depth;
        }

        while(0 < max_depth){
          let total = 0;
          let count = 0;
          for(let i = data.length-1; 0 <= i; i--){
            if(data[i].depth == max_depth){
              count ++;
              total += data[i].status;
            }
            else if(data[i].depth > max_depth){
              continue;
            }
            else{
              let parent = 0;
              for(let j = i; 0 <= j; j--){
                if(max_depth - 1  ==  data[j].depth){
                  parent = j;
                  break;
                }
              }
              if(count && data[parent].depth < max_depth){
                if(total == 0){ // 未着手
                  data[parent].status = 0;
                  data[parent].$checked = false;
                }
                else if(total / 2 == count && total % 2 == 0){ // 完了
                  data[parent].status = 2;
                  data[parent].$checked = true;
                }
                else{ // 実施中
                  data[parent].status = 1;
                  data[parent].$checked = false;
                }
              }
              count = total = 0;
            }
          }
          max_depth --;
        }
        return data;
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
              let transactionCount = 0;
              await runTransaction(db, async (transaction) => {
                for(let j = 0; j < deleteNode.length; j++){
                  const docRef = doc(db, "tasks", deleteNode[j].id);
                  transaction.delete(docRef);
                  transactionCount ++;
                }
              });
              console.log(`Transaction success!(Count:${transactionCount})`);

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
        
        // 並び順・ステータスの整合性を最高神
        this.updateOrder();
        
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
            text: this.addTaskName,
            depth: 1,
            order: data.length,
            children: [],
            $checked: false,
            status: 0,
            checklist: this.checklist_id,
            limit: (this.addTaskLimit) ? new Date(this.addTaskLimit.getFullYear(), this.addTaskLimit.getMonth(), this.addTaskLimit.getDate(), 23, 59, 59) : null,
            start: (this.addTaskStart) ? new Date(this.addTaskStart.getFullYear(), this.addTaskStart.getMonth(), this.addTaskStart.getDate(), 0, 0, 0) : null, 
        };
        // firestore上に追加
        const docRef = await addDoc(collection(db, "tasks"), node);
        console.log(docRef.id);
        // 追加されたIDを取得
        node.id = docRef.id;
        // 配列の更新
        data.push(node);
        // treeの再生成
        this.treeData = this.createTree(data);
        this.nodeData = this.recursiveCreateNode(this.treeData);
        // ポップアップ非表示
        this.addPopup = false;
      },
      /*
       * タスク更新用ポップアップ表示処理
       */
      editTaskPopup:function(id, text, status, limit, start){
        this.editPopup = true
        this.editTaskName = text
        this.editId = id
        this.editStatus = status
        this.editTaskLimit = limit
        this.editTaskStart = start
      },
      /*
       * タスク更新処理
       */
      editTask: async function(){
        const docRef = doc(db, "tasks", this.editId);
        await updateDoc(docRef, {
          text: this.editTaskName,
          status: this.editStatus,
          $checked: (this.editStatus == 2) ? true : false,
          limit: (this.editTaskLimit) ? new Date(this.editTaskLimit.getFullYear(), this.editTaskLimit.getMonth(), this.editTaskLimit.getDate(), 23, 59, 59) : null,
          start: (this.editTaskStart) ? new Date(this.editTaskStart.getFullYear(), this.editTaskStart.getMonth(), this.editTaskStart.getDate(), 0, 0, 0) : null, 

        });

        const data = this.recursiveCreateNode(this.treeData);
        for(let i = 0; i < data.length; i ++){
          if(data[i].id === this.editId){
            data[i].text = this.editTaskName;
            data[i].status = this.editStatus;
            data[i].$checked = (this.editStatus == 2) ? true : false,
            data[i].limit = (this.editTaskLimit) ? new Date(this.editTaskLimit.getFullYear(), this.editTaskLimit.getMonth(), this.editTaskLimit.getDate(), 23, 59, 59) : null;
            data[i].start = (this.editTaskStart) ? new Date(this.editTaskStart.getFullYear(), this.editTaskStart.getMonth(), this.editTaskStart.getDate(), 0, 0, 0) : null;

            // ループを抜けるためにiを上書き
            i = data.length;
          }
        }

        // treeの再生成
        this.treeData = this.createTree(data);
        this.nodeData = this.recursiveCreateNode(this.treeData);

        // ポップアップ非表示
        this.editPopup = false;
      },
      /*
       * チェックリストモードのチェック更新処理
       */
      editCheckbox: async function(tree, node, path){
        tree.toggleCheck(node, path);
        // タスク管理モードのステータスを更新する
        node.status = (node.$checked) ? 2 : 0;

        let data = this.recursiveCreateNode(this.treeData);
        data = this.statusConsistency(data);
        try {
          let transactionCount = 0;
          await runTransaction(db, async (transaction) => {
            for(let i = 0; i < data.length; i++){
              // Object同士の比較が難しいのでJSONに変換して比較
              // 参考URL: https://www.deep-rain.com/programming/javascript/755
              if(JSON.stringify(Object.entries(this.nodeData[i]).sort()) != JSON.stringify(Object.entries(data[i]).sort())){
                const docRef = doc(db, "tasks", data[i].id);
                transaction.update(docRef, {'status': data[i].status, '$checked': data[i].$checked});
                transactionCount ++;
              }
            }
          });
          console.log(`Transaction success!(Count:${transactionCount})`);
          
          // treeの作成
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
      },
      /*
       * タスクモードのステータス更新処理
       */
      editTaskStatus: async function(tree, node, path){
        if(node.status === 2) tree.check(node, path);
        else tree.uncheck(node, path);

        let data = this.recursiveCreateNode(this.treeData);
        data = this.statusConsistency(data);
        
        try {
          let transactionCount = 0;
          // 一時的にコメントアウト、開発おわったらイキに
          await runTransaction(db, async (transaction) => {
            for(let i = 0; i < data.length; i++){
              // Object同士の比較が難しいのでJSONに変換して比較
              // 参考URL: https://www.deep-rain.com/programming/javascript/755
              if(JSON.stringify(Object.entries(this.nodeData[i]).sort()) != JSON.stringify(Object.entries(data[i]).sort())){
                const docRef = doc(db, "tasks", data[i].id);
                transaction.update(docRef, {'status': data[i].status, '$checked': data[i].$checked});
                transactionCount ++;
              }
            }
          });
          console.log(`Transaction success!(Count:${transactionCount})`);
          
          // treeの作成
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
      },
      /*
       * 並び替え保存処理
       */
      updateOrder: async function(){
        let data = this.recursiveCreateNode(this.treeData);
        data = this.statusConsistency(data);

        try {
          let transactionCount = 0;
          await runTransaction(db, async (transaction) => {
            for(let i = 0; i < data.length; i++){
              // Object同士の比較が難しいのでJSONに変換して比較
              // 参考URL: https://www.deep-rain.com/programming/javascript/755
              if(JSON.stringify(Object.entries(this.nodeData[i]).sort()) != JSON.stringify(Object.entries(data[i]).sort())){
                const docRef = doc(db, "tasks", data[i].id);
                transaction.update(docRef, {'order': data[i].order, 'depth': data[i].depth});
                transactionCount ++;
                
              }
            }
          });
          console.log(`Transaction success!(Count:${transactionCount})`);
          
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
