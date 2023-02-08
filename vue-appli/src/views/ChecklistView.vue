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

    <div v-if="searchFlag">
      <div class="message">
        <div class="message-header">
          <p>絞り込み</p>
        </div>
        <div class="message-body">
          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">タスク名</label>
            </div>
            <div class="field-body">
              <div class="field">
                <p class="control is-expanded">
                  <input class="input" type="text" placeholder="フリーワード" v-model="searchKeyword">
                </p>
              </div>
            </div>
          </div>
          <div class="field is-horizontal">
            <div class="field-label is-normal pt-0">
              <label class="label">担当者</label>
            </div>
            <div class="field-body">
              <div class="field">
                <template v-for="(user, index) in users" v-bind:key="index">
                  <input class="is-checkradio" :id="'searchUser_' + index" type="checkbox" v-model="searchUsers" name="searchUsers" :value="user.id">
                  <label :for="'searchUser_' + index">{{ user.name }}</label>
                </template>
              </div>
            </div>
          </div>
          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">日付</label>
            </div>
            <div class="field-body">
              <div class="field is-flex" style="align-items: center;">
                <div style="max-width:240px;">
                  <v-date-picker :formats="datepickerFormats" :popover="popover" v-model="searchDateFrom">
                    <template v-slot="{ inputValue, inputEvents }">
                      <input class="input" type="text" :value="inputValue" v-on="inputEvents" placeholder="例：2023/01/10"  />
                    </template>
                  </v-date-picker>
                </div>
                <div class="pl-2 pr-2">〜</div>
                <div style="max-width:240px;">  
                  <v-date-picker :formats="datepickerFormats" :popover="popover" v-model="searchDateTo">
                    <template v-slot="{ inputValue, inputEvents }">
                      <input class="input" type="text" :value="inputValue" v-on="inputEvents" placeholder="例：2023/01/10"  />
                    </template>
                  </v-date-picker>
                </div>
              </div>
            </div>
          </div>
          <div class="field is-horizontal">
            <div class="field-label is-normal pt-0">
              <label class="label">ステータス</label>
            </div>
            <div class="field-body">
              <div class="field">
                <template v-for="(status, index) in statuses" v-bind:key="index">
                  <input class="is-checkradio" :id="'searchStatus_' + index" type="checkbox" v-model="searchStatuses" name="searchStatuses" :value="index">
                  <label :for="'searchStatus_' + index">{{ status }}</label>
                </template>
              </div>
            </div>
          </div>  
        </div>
      </div>
    </div>

    <div class="has-text-right mt-3"  v-if="!dragFlag">
      <button class="button button-primary" @click="searchFlag=true" v-if="!searchFlag">絞り込みをする</button>
      <button class="button button-primary" @click="searchFlag=false" v-if="searchFlag">絞り込みをやめる</button>
    </div>

    <p style="text-indent:-1em; padding-left:1em;" class="mb-3">・子タスクが存在するタスクのステータスを直接変更することはできません。<br>
      親タスクを完了させるには、子タスクを全て「完了」にしてください。</p>

    <Tree :value="treeData" triggerClass="drag-trigger">
        <template v-slot="{node, index, path, tree}">
          <div class="level node-level"
            v-bind:class="{
              'is-completed': (node.$checked),
              'is-current': (!node.$checked && node.start && node.start < now),
              'is-danger': (!node.$checked && node.limit && node.limit < now),
              'node-hidden': (node.hidden),
            }">
            <div class="level-left" style="width:calc(100% - 46em)">
              <button class="drag-trigger button mr-3" v-if="dragFlag"><fa icon="bars" /></button>
              <div class="">
                <label class="mr-2 is-size-5" style="cursor:pointer;"  v-if="!dragFlag && mode=='toggle'">
                <!-- <label class="mr-2 is-size-5" style="cursor:pointer;"> -->
                  <input v-bind:class="{'is-checkradio':true, 'has-background-color':node.$checked, 'is-success':node.$checked}" type="checkbox" v-bind:id="node.id" :checked="node.$checked" @change="editCheckbox(tree, node, path)" v-bind:disabled="node.children.length" />
                  <label v-bind:for="node.id"></label>
                </label>
                <b style="display:none;">{{index}}</b>
                <!-- <button class="button is-text" @click="statusPopup">{{node.text}}</button> -->
                {{node.text}}
                <span style="display:none;">- path: <i>{{path.join(',')}}</i></span>
              </div>
            </div>
            <div class="level-right">
              <small class="has-text-grey mr-1">
                <span style="display:inline-block; text-align:right; width:11em;" class="tags" v-html="toUsers(node.users)"></span>
                <span style="display:inline-block; text-align:right; width:11em;">{{ toDate(node.start) }}</span>
                <span v-if="node.start || node.limit">〜</span>
                <span style="display:inline-block; text-align:left; width:11em;" v-bind:class="{'has-text-danger-dark': (!node.$checked && node.limit && node.limit < now)}">{{ toDate(node.limit) }}</span>
              </small>
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

    <div class="has-text-right mt-5" v-if="!searchFlag">
      <button class="button button-primary" @click="dragFlag=true" v-if="!dragFlag">並び替えをする</button>

      <button class="button is-primary ml-2" @click="addTaskPopup">新しく項目を追加する</button>
    </div>

    <p class="has-text-centered mt-5" v-if="dragFlag">
      <button class="button is-info" @click="updateOrder">並び替えを確定する</button>
    </p>

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

            <div class="field is-horizontal">
              <div class="field-label is-normal pt-0">
                <label class="label">担当者</label>
              </div>
              <div class="field-body">
                <div class="field">
                  <template v-for="(user, index) in users" v-bind:key="index">
                    <input class="is-checkradio" :id="'addTaskUser_' + index" type="checkbox" v-model="addTaskUsers" name="addTaskUsers" :value="user.id">
                    <label :for="'addTaskUser_' + index" style="margin-right:1em; white-space: nowrap;">{{ user.name }}</label>
                  </template>
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
    margin: -6px;
    padding:5px;
    border:1px solid #ccc;
  }
  .node-level.is-completed{
    background:#eee;
    color: #999 !important;
  }
  .node-level.is-current{
    background:#fffaeb;
  }
  .node-level.is-danger{
    background:#feecf0;
    color: #cc0f35;
    border-color: #cc0f35;
  }
  .tree-node:has(>.node-hidden){
    border: none !important;
    overflow: hidden;
    height:0 !important;
    margin:0 !important;
    padding:0 !important;
  }
  .modal-card{ overflow: visible;}
  .modal-card-body{ overflow: visible;}
  .vc-day:has(>.vc-highlights){ pointer-events: none;}

  /* チェックボックスの調整 */
  .is-checkradio[type=checkbox]+label::before, .is-checkradio[type=checkbox]+label:before{ background:#fff}
  .is-checkradio[type=checkbox][disabled]+label::after,
  .is-checkradio[type=checkbox][disabled]+label::before,
  .is-checkradio[type=checkbox][disabled]+label:after,
  .is-checkradio[type=checkbox][disabled]+label:before{ background: #dbdbdb;}
  
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
  import { doc, updateDoc, getDoc, getDocs, query, collection, where, runTransaction} from "firebase/firestore";

  export default {
    components: {Tree: Tree.mixPlugins([Check, Draggable])},
    data(){
      return {
        now: new Date(),
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
        addTaskUsers: [],
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
        users: [],
        searchFlag: false,
        searchUsers: [],
        searchStatuses: [],
        searchKeyword: '',
        searchDateFrom: '',
        searchDateTo: '',

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
      // ユーザ一覧取得
      const usersDocSnap = await getDocs(collection(db, "users"));
      usersDocSnap.forEach((doc) => {
        const user = {
          id: doc.id,
          name: doc.data().name
        };
        // selectでloopを回すための変数に追加していく
        this.users.push(user);
      });

      // チェックリスト取得
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
      await getDocs(query(collection(db, "tasks"), where("checklist", "==", this.checklist_id))).then(async querySnapshot => {
        const data = [];
        querySnapshot.forEach(async doc => {
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
            users: []
          };
          data.push(node);
        })

        for(let i = 0; i < data.length; i++){
          await getDocs(query(collection(db, "tasks_users"), where("checklist_id", "==", this.checklist_id), where("task_id", "==", data[i].id))).then(usersQuerySnapShot => {
            const users = [];
            usersQuerySnapShot.forEach(async doc => {
              users.push(doc.data().user_id);
            })
            data[i].users = users;
          });
        }

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
        this.addTaskUsers = []
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
      },
      searchFlag: function(){
        this.searchTree();
        this.searchKeyword = ''
        this.searchUsers = []
        this.searchStatuses = []
        this.searchDateFrom = ''
        this.searchDateTo = ''
        
      },
      searchUsers: function(){
        this.searchTree();
      },
      searchStatuses: function(){
        this.searchTree();
      },
      searchKeyword: function(){
        this.searchTree();
      },
      searchDateFrom: function(){
        this.searchTree();
      },
      searchDateTo: function(){
        this.searchTree();
      },

    },
    methods: {
      toUsers: function(users){
        let str = "";
        for(let i = 0; i < users.length; i ++){
          for(let j = 0; j < this.users.length; j ++){
            if(this.users[j].id === users[i]){
              str += '<span class="tag is-light is-rounded">' + this.users[j].name + '</span>';
              j = this.users.length;
            }
          }
        }
        return str;
      },
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
            users: data[i].users,
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
            users: data[i].users,
            checklist: this.checklist_id,
            hidden: false,
          }

          // 表示絞り込み処理
          if(this.searchFlag){
            // 何かしらの絞り込み条件が設定されている場合のみ実施
            if(this.searchKeyword || this.searchUsers.length || this.searchStatuses.length || this.searchDateFrom || this.searchDateTo){
              let keywordHidden = false;
              let userHidden = false;
              let statusHidden = false;
              let dateFromHidden = false;
              let dateToHidden = false;

              if(this.searchKeyword){
                keywordHidden = true;
                if ( ~node.text.indexOf(this.searchKeyword)) {
                  keywordHidden = false;
                }
              }
              if(this.searchUsers.length){
                userHidden = true;
                for(let j = 0; j < this.searchUsers.length; j ++){
                  for(let k = 0; k < node.users.length; k ++){
                    if(this.searchUsers[j] === node.users[k]){
                      userHidden = false;
                    }
                  }
                }
              }
              if(this.searchDateFrom){
                dateFromHidden = true;
                let from = new Date(this.searchDateFrom.getFullYear(), this.searchDateFrom.getMonth(), this.searchDateFrom.getDate(), 0, 0, 0)
                if(from <= node.limit){
                  dateFromHidden = false;
                }
              }
              if(this.searchDateTo){
                dateToHidden = true;
                let to = new Date(this.searchDateTo.getFullYear(), this.searchDateTo.getMonth(), this.searchDateTo.getDate(), 23, 59, 59)
                if(node.start <= to){
                  dateToHidden = false;
                }
              }
              if(this.searchStatuses.length){
                statusHidden = true;
                for(let j = 0; j < this.searchStatuses.length; j ++){
                  if(node.status === this.searchStatuses[j]){
                    statusHidden = false;
                  }
                }
              }
              node.hidden = !(!keywordHidden && !userHidden&& !statusHidden && !dateFromHidden && !dateToHidden);
            }
          }

          let parent = treelist;
          for(let j = 1; j < data[i].depth; j ++){
            if(!node.hidden){
              parent[parent.length-1].hidden = false;
            }
            parent = parent[parent.length - 1].children;
          }
          parent.push(node);
        }
        // 表示絞り込みの整合性処理（子要素が表示されていたら親要素も表示する

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
      /*
       * 絞り込み
       */
      searchTree: function(){
        // データを取得
        const data = this.recursiveCreateNode(this.treeData);
        // treeの再生成
        this.treeData = this.createTree(data);
        this.nodeData = this.recursiveCreateNode(this.treeData);

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

            // 削除ノードの作業者情報を取得
            const deleteTasksUsers = [];
            for(let j=0; j<deleteNode.length; j++){
              await getDocs(query(collection(db, "tasks_users"), where("checklist_id", "==", this.checklist_id), where('task_id', "==", deleteNode[j].id))).then(querySnapshot => {
                querySnapshot.forEach(doc => {
                  deleteTasksUsers.push(doc.id);
                })
              })
            }
            
            try {
              // Firestore上からデータを削除
              let transactionCount = 0;
              await runTransaction(db, async (transaction) => {
                for(let j = 0; j < deleteNode.length; j++){
                  const docRef = doc(db, "tasks", deleteNode[j].id);
                  transaction.delete(docRef);
                  // console.log(docRef, transaction);
                  transactionCount ++;
                }
                for(let j = 0; j < deleteTasksUsers.length; j++){
                  console.log(deleteTasksUsers[j]);
                  const docRef = doc(db, "tasks_users", deleteTasksUsers[j]);
                  transaction.delete(docRef);
                  // console.log(docRef, transaction);
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
        
        try {
          const autoId = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            let autoId = ''
            for (let i = 0; i < 20; i++) {
              autoId += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            return autoId
          }
          const node_id = autoId();

          const users = [];
          // firestore上に追加
          await runTransaction(db, async (transaction) => {
            
            transaction.set(doc(collection(db, "tasks"), node_id), node);
            for(let i = 0; i < this.addTaskUsers.length; i++){
              const task_user = {
                checklist_id: this.checklist_id,
                task_id: node_id,
                user_id: this.addTaskUsers[i]
              }
              transaction.set(doc(collection(db, "tasks_users")), task_user);
              users.push(task_user.user_id);
            }
          });
          node.id = node_id;
          node.users = users;

          // 配列の更新
          data.push(node);
          // treeの再生成
          this.treeData = this.createTree(data);
          this.nodeData = this.recursiveCreateNode(this.treeData);
          // ポップアップ非表示
          this.addPopup = false;
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
