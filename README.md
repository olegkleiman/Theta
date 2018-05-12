# Theta 
Broadly speaking, this is SPA React/Redux app performing CRUD operations against Firebase RealtimeDB. Its UI follows <a href='https://demos.creative-tim.com/now-ui-kit/index.html' taret='_blank'>Now UI</a> style of Creative Tim (that is customized version of Bootstrap 4 with with of <code>reactstrap</code>) and parly based on <a href='https://devexpress.github.io/devextreme-reactive/react/grid/' target='_blank'>DevExtreme React Grid</a> and . The app is  powered by <a href='https://reacttraining.com/react-router/web/guides/philosophy' target='_blank'>React Router 4</a>.

## Build
Build is simple as <code>yarn build</code>. This invokes <code>webpack</code> to produce <code>main.js</code> bundle in "dist" directory.
Consequently, the home directory for hosting by <code>WebpackDevServer</code> is also "dist" that is reflected by its invokation:

"start:dev": "webpack-dev-server --mode development --colors --watch --content-base dist/"

As usual for Webpack, the entry point of the project called <code>index.jsx</code>.

## Deploy
This project is designed for deployment to Google Firebase (<code>firebase deploy</code>) or served locally (<code>firebase serve</code>). 
It utilizes <a href='https://firebase.google.com/docs/hosting/reserved-urls?authuser=0#sdk_auto-configuration' target='_blank'> simpler project configuration</a> when initializing Firebase App (in index.html). This way the launching page gains permformance boost because Firebase uses HTTP/2 and boost the pages from the same origin.
However, pay attention that if the project is served by another HTTP server (like webpack-dev-server, reflected in script as <code>yarn start:dev</code>), the mentioned <i>simpler project configuration</i> will not work and you may need to adjust the link URLs in <code>index.html</code> to regular forms (e.g. change <code>/_ _</code>  in <code>__/firebase/4.13.0/firebase-app.js</code> to <code>https://www.gstatic.com/firebasejs/4.13.0/firebase-app.js</code> and so on).

In order to comply to Firebase deployment's demands for SPA, the public directory of the project is "dist". This is in accordance with 'output' section settings of <code>webpack.config.js</code>

### Deploy Firebase rules
Firestore rules should be deployed bt Firebase CLI from <code>.rules</code> file prior to using the app:
<code>firebase deploy --only firestore:rules</code>
