<template>
  <div class="checklist">
    
    <button class="button btn-primary" @click="dragFlag=true">並び替え実行</button>
    <button class="button btn-primary" @click="dragFlag=false">並び替え確定</button>
    <Tree :value="treeData" triggerClass="drag-trigger">
        <template v-slot="{node, index, path, tree}">
          <div class="columns">
            <div v-if="dragFlag" class="column" style="flex-grow: 0">
              <button class="drag-trigger button is-small"><fa icon="bars" /></button>
            </div>
            <div class="column" style="flex:1">
              <div class="">
                <label class="mr-2 is-size-5" style="cursor:pointer;">
                  <input type="checkbox" :checked="node.$checked" @change="tree.toggleCheck(node, path)" />
                  <fa icon="square-check" />
                </label>
                <b>{{index}}</b>
                Title: {{node.text}}
                - path: <i>{{path.join(',')}}</i>
              </div>
            </div>
          </div>

        </template>
    </Tree>


  </div>
</template>

<style>
  input[type="checkbox"]{
    opacity:0;
    position:absolute;
  }
  input[type="checkbox"]+svg{
    color:#ddd;

  }
  input[type="checkbox"]:checked+svg{
    color:#3273dc;
  }
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

  export default {
    components: {Tree: Tree.mixPlugins([Check, Draggable])},
    // props: {
    //     triggerClass: {default: 'drag-trigger'},
    //     // 让树默认不可拖拽. prevent drag by default.
    //     // draggable: {type: [Boolean, Function], default: false},
    //     // droppable: {type: [Boolean, Function], default: false},
    // },
    data(){
      return {
        treeData: [{text: 'node 1'}, {text: 'node 2', children: [{text: 'node 2-1'}, {text: 'node 2-1'}]}],
        dragFlag: false,

      }
    },
    created: async function () {
      console.log("Hello");
    },
    watch: {
      createPopup: function(){
          this.title = ""  
      }
    },
    methods: {
      order: function(){
        console.log(1);
      },
      createChecklist: function(){
        console.log(this.title);
        console.log("新規追加する");

        this.createPopup = false;
      }
    }
    
  }
</script>
