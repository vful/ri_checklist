<template>

  <header>
    <div class="hero is-dark">
      <div class="hero-body">
        <h1 class="title">
          <router-link class="navbar-item" :to="{ name: 'home'}">チェックリストツール</router-link>
        </h1>
      </div>
    </div>

    <nav class="navbar has-background-light">
      <div class="navbar-menu">
        <div class="navbar-start">
          <router-link class="navbar-item has-text-link" :to="{ name: 'home'}">
            <span class="icon-text">
              <span class="icon">
                <fa icon="home" />
              </span>
              <span>Home</span>
            </span>
          </router-link>
          <router-link class="navbar-item has-text-link" :to="{ name: 'about'}">
            <span class="icon-text">
              <span class="icon">
                <fa icon="book" />
              </span>
              <span>About</span>
            </span>
          </router-link>
          
          <template v-if="$store.getters.user === null">
            <router-link class="navbar-item has-text-link" :to="{ name: 'login'}">
              <span class="icon-text">
                <span class="icon">
                  <fa icon="right-to-bracket" />
                </span>
                <span>Login</span>
              </span>
            </router-link>
          </template>
          <template v-else>
            <router-link class="navbar-item has-text-link" :to="{ name: 'dashboard'}">
              <span class="icon-text">
                <span class="icon">
                  <fa icon="table-columns" />
                </span>
                <span>Dashboard</span>
              </span>
            </router-link>
            <router-link class="navbar-item has-text-link" :to="{ name: 'logout'}">
              <span class="icon-text">
                <span class="icon">
                  <fa icon="right-from-bracket" />
                </span>
                <span>Logout</span>
              </span>
            </router-link>
          </template>
        </div>
      </div>
    </nav>
  </header>

  <main class="container">
  <router-view/>
  </main>

  <footer class="footer">
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
            採用情報
          </a>
        </div>
        <div class="level-item has-text-centered">
          <a href="#">
            お問い合わせ・ヘルプ
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

};
</script>

