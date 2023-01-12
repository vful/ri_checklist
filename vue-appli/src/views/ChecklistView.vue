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
                <b>{{index}}</b>
                <button class="button is-text" @click="statusPopup">Title: {{node.text}}</button>
                - path: <i>{{path.join(',')}}</i>
              </div>
            </div>
            <div class="level-right">
              <button class="button level-right" @click="statusPopup">項目名編集</button>
              <button class="button is-danger level-right ml-1">削除</button>
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
                  <p class="control is-expanded has-icons-left">
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
          <button class="button is-success" @click="createChecklist">作成する</button>
          <button class="button" @click="taskPopup=false">キャンセル</button>
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
  import { doc, getDoc} from "firebase/firestore"; 

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

      }
    },
    created: async function () {
      const docSnap = await getDoc(doc(db, "checklists", this.checklist_id));
      if (docSnap.exists()) {
          this.checklist = {...docSnap.data()};
      } else {
          this.$router.push('/error');
      }
      this.treeData = [
        {text: 'node 1', children: []},
        {text: 'node 2', children: [
          {text: 'node 2-1', children: [
            {text: 'node 2-1-1'},
            {text: 'node 2-1-2'},
            {text: 'node 2-1-3'},
          ]},
          {text: 'node 2-2'}
        ]},
        {text: 'node 3', children: [
          {text: 'node 3-1'}, {text: 'node 3-2'}] 
        }];

        const data = this.recursiveCreateNode(this.treeData);

        const tree = this.createTree(data);
        this.treeData = tree;

        console.log(tree);

        const remake = this.recursiveCreateNode(this.treeData);
        console.log(remake);
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
            text: data[i].text + "",
            depth: data[i].depth,
            order: data[i].order,
            children: [],
            $checked: true,
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
      addTaskPopup: function(){
        this.taskPopup = true
      },
      updateOrder: function(){
        const data = this.recursiveCreateNode(this.treeData);
        console.log(data);
        this.dragFlag = false;
      }
    }
    
  }
</script>
