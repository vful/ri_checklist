<template>
  <div>
    <!-- <button @click="isSignedIn">チェック</button>
    <button @click="signOut">ログアウト</button> -->
    <template v-if="flag">
      <h1 class="title mt-5">ログイン</h1>

      <div style="max-width:800px; margin-left:auto; margin-right:auto">
        <div class="card">
          <div class="card-content">
            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label">メールアドレス<span class="has-text-danger">*</span></label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input class="input" type="email" v-model="email" placeholder="例：test@reinoindex.co.jp">
                  </p>
                </div>
              </div>
            </div>
            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label">パスワード<span class="has-text-danger">*</span></label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input class="input" type="password" v-model="password" placeholder="6文字以上で入力">
                  </p>
                </div>
              </div>
            </div>

            <div class="has-text-centered">
              <button @click="signIn" class="button is-primary">ログイン</button>
            </div>
          </div>
        </div>
        
        <p class="has-text-right mt-5">
          <button @click="flag=!flag" class="button ml-5">初めての方はこちら</button>
        </p>
      </div>
    </template>
    <template v-else>
      <h1 class="title mt-5">新規登録</h1>
      
      <div style="max-width:800px; margin-left:auto; margin-right:auto">
        <div class="card">
          <div class="card-content">
            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label">名前<span class="has-text-danger">*</span></label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input class="input" type="text" v-model="name" placeholder="例：テスト太郎（ニックネーム可）">
                  </p>
                </div>
              </div>
            </div>
            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label">メールアドレス<span class="has-text-danger">*</span></label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input class="input" type="email" v-model="email" placeholder="例：test@reinoindex.co.jp">
                  </p>
                </div>
              </div>
            </div>
            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label">パスワード<span class="has-text-danger">*</span></label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input class="input" type="password" v-model="password" placeholder="6文字以上で入力">
                  </p>
                </div>
              </div>
            </div>

            <div class="has-text-centered">
              <button @click="signUp" class="button is-primary">新規登録</button>
            </div>
          </div>
        </div>

        <p class="has-text-right mt-5">
          <button @click="flag=!flag" class="button ml-5">登録済みの方はこちら</button>
        </p>
      </div>
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
