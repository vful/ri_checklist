<template>

  <header>
    <div class="hero is-dark">
      <div class="hero-body">
        <h1 class="title">
          <router-link :to="{ name: 'home'}">チェックリストツール</router-link>
        </h1>
      </div>
    </div>

    <nav class="navbar has-background-light">
      <a role="button" class="navbar-burger" v-bind:class="{ 'is-active': isMenuShow }" aria-label="menu" aria-expanded="false" data-target="menu" @click="isMenuShow = !isMenuShow">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
      <div class="navbar-menu" id="menu" v-bind:class="{ 'is-active': isMenuShow }" >
        <div class="navbar-start">
          <router-link class="navbar-item has-text-link" :to="{ name: 'home'}">
            <span class="icon-text">
              <span class="icon">
                <fa icon="home" />
              </span>
              <span>ホーム</span>
            </span>
          </router-link>
          <router-link class="navbar-item has-text-link" :to="{ name: 'about'}">
            <span class="icon-text">
              <span class="icon">
                <fa icon="book" />
              </span>
              <span>使い方</span>
            </span>
          </router-link>
          
          <template v-if="$store.getters.user === null">
            <router-link class="navbar-item has-text-link" :to="{ name: 'login'}">
              <span class="icon-text">
                <span class="icon">
                  <fa icon="right-to-bracket" />
                </span>
                <span>ログイン</span>
              </span>
            </router-link>
          </template>
          <template v-else>
            <router-link class="navbar-item has-text-link" :to="{ name: 'dashboard'}">
              <span class="icon-text">
                <span class="icon">
                  <fa icon="table-columns" />
                </span>
                <span>ダッシュボード</span>
              </span>
            </router-link>
            <router-link class="navbar-item has-text-link" :to="{ name: 'project'}">
              <span class="icon-text">
                <span class="icon">
                  <fa icon="table-columns" />
                </span>
                <span>案件一覧</span>
              </span>
            </router-link>
          </template>

        </div>

        <template v-if="$store.getters.userInfo != null">
          <!-- ドロップダウンの配置 -->
          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link">
              {{ $store.getters.userInfo.name }}さん
            </a>
    
            <div class="navbar-dropdown">
              <router-link class="navbar-item has-text-link" :to="{ name: 'logout'}">
                <span class="icon-text" style="flex-wrap:nowrap;">
                  <span class="icon">
                    <fa icon="right-from-bracket" />
                  </span>
                  <span>ログアウト</span>
                </span>
              </router-link>
            </div>
          </div>
        </template>
      </div>
    </nav>
  </header>

  <main class="container">
  <router-view/>
  </main>

  <footer class="footer mt-5">
    <div class="content has-text-centered">
      <nav class="level">
        <div class="level-item has-text-centered">
          <a href="#">
            プライバシー
          </a>
        </div>
        <div class="level-item has-text-centered">
          <a href="#">
            利用規約
          </a>
        </div>
        <div class="level-item has-text-centered">
          <a href="#">
            免責事項
          </a>
        </div>
        <div class="level-item has-text-centered">
          <a href="#">
            ご意見・ご要望
          </a>
        </div>
      </nav>
      <div>
        &copy; REINO INDEX
      </div>
    </div>
  </footer>
</template>

<script>
import 'bulma/css/bulma.css'; 
import 'bulma-checkradio/dist/css/bulma-checkradio.min.css'; 
export default {
  data(){
    return {
      isMenuShow : false
    }

  }

};
</script>

