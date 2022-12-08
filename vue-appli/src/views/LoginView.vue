<template>
  <div>
  

    <button @click="isSignedIn">チェック</button>
    <button @click="signOut">ログアウト</button>
    <template v-if="flag">
      <h2>ログイン</h2>
      <table>
        <tr>
          <th>メールアドレス</th>
          <td><input type="email" v-model="email"></td>
        </tr>
        <tr>
          <th>パスワード</th>
          <td><input type="password" v-model="password"></td>
        </tr>
      </table>

      <button @click="signIn" class="button is-primary">ログイン</button>

      <button @click="flag=!flag" class="button">初めての方はこちら</button>
    </template>
    <template v-else>
      <h2>新規登録</h2>
      <table>
        <tr>
          <th>名前</th>
          <td><input type="text" v-model="name"></td>
        </tr>
        <tr>
          <th>メールアドレス</th>
          <td><input type="email" v-model="email"></td>
        </tr>
        <tr>
          <th>パスワード</th>
          <td><input type="password" v-model="password"></td>
        </tr>
      </table>  

      <button @click="signUp" class="button is-primary">新規登録</button>

      <button @click="flag=!flag" class="button">登録済みの方はこちら</button>
    </template>

    <div id="modal" class="modal is-active" v-if="message">
      <div class="modal-background" @click="this.message=null"></div>
      <div class="modal-content">
        <div class="box">
          <div class="message is-danger">
            <div class="message-body">
              {{ $t(message) }}
            </div>
          </div>
        </div>
      </div>
      <button class="modal-close is-large" aria-label="close" @click="this.message=null"></button>
    </div>

  </div>
</template>

<script>
  export default {
    data(){
      return {
        name: '',
        email: '',
        password: '',
        flag: true,
        message: '',
      }
    },
    methods: {
        isSignedIn: function(){
            this.$store.dispatch('isSignedIn');
        },
        // ログイン
        signIn: function() {
            console.log(this.email);
            console.log(this.password);
            this.$store.dispatch('signIn', { email: this.email, password: this.password })
            .then((response) => {
              console.log(response)
              this.$router.push('/dashboard');
            })
            .catch((error) => {
              this.message = error;
            });
        },
        // 新規登録
        signUp: function() {
            console.log(this.name);
            console.log(this.email);
            console.log(this.password);
            this.$store.dispatch('signUp', { name: this.name, email: this.email, password: this.password })
            .then((response) => {
              console.log(response)
              this.$router.push('/dashboard');
            })
            .catch((error) => {
              this.message = error;
            });
        },
        // サインアウト
        signOut: function() {
            this.$store.dispatch('signOut');
        },
      signs: function () {
        if(this.name && this.mailaddress && this.password){
          this.$store.dispatch('sendAuth', { userName: this.name, userMailaddress: this.mailaddress, userPassword: this.password });
        }
      },
      login: function () {
        this.$store.dispatch('signIn', { userMailaddress: this.mailaddress, userPassword: this.password });
      }
    }
  }
</script>
