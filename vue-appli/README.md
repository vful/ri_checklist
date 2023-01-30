# vue-appli

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## Firebase hosting
### Firebase CLIをインストールします
```
npm install firebase-tools
```
### バージョンを確認します。グローバルに入れていないので相対パスで実行します
```
./node_modules/firebase-tools/lib/bin/firebase.js -V
```
### firebaseにログインします
```
./node_modules/firebase-tools/lib/bin/firebase.js login 
```
### hostingの初期化を行います
```
./node_modules/firebase-tools/lib/bin/firebase.js init hosting
```
### 指示に従ってセッテイングしていきます。
基本的には基本の設定で構いませんが  
? What do you want to use as your public directory?   
上記質問に対しては`dist`を設定してください。
```
     ######## #### ########  ######## ########     ###     ######  ########
     ##        ##  ##     ## ##       ##     ##  ##   ##  ##       ##
     ######    ##  ########  ######   ########  #########  ######  ######
     ##        ##  ##    ##  ##       ##     ## ##     ##       ## ##
     ##       #### ##     ## ######## ########  ##     ##  ######  ########

You're about to initialize a Firebase project in this directory:

  /Users/kimuranao/docker/ri_checklist/vue-appli


=== Project Setup

First, let's associate this project directory with a Firebase project.
You can create multiple project aliases by running firebase use --add, 
but for now we'll just set up a default project.

? Please select an option: Use an existing project
? Select a default Firebase project for this directory: ri-checklist (ri-checklist)
i  Using project ri-checklist (ri-checklist)

=== Hosting Setup

Your public directory is the folder (relative to your project directory) that
will contain Hosting assets to be uploaded with firebase deploy. If you
have a build process for your assets, use your build's output directory.

? What do you want to use as your public directory? dist
? Configure as a single-page app (rewrite all urls to /index.html)? No
? Set up automatic builds and deploys with GitHub? No
✔  Wrote dist/404.html
✔  Wrote dist/index.html

i  Writing configuration info to firebase.json...
i  Writing project information to .firebaserc...

✔  Firebase initialization complete!
```

### Vueでビルドを実行します
```
$ npm run build
```
### Firebase Hostingにデプロイします
```
$ ./node_modules/firebase-tools/lib/bin/firebase.js deploy  
```
### 実行結果に表示されるURLにアクセスしてください
https://ri-checklist.web.app/