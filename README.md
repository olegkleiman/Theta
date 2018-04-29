# Theta 
Broadly speaking, this is React/Redux app performing CRUD operations against Firebase RealtimeDB. Its UI is mostly based on <a href='https://devexpress.github.io/devextreme-reactive/react/grid/' target='_blank'>DevExtreme React Grid</a>.

This project may be deployed to Google Firebase (firebase deploy) or served locally (firebase serve). 
It utilizes <a href='https://firebase.google.com/docs/hosting/reserved-urls?authuser=0#sdk_auto-configuration' target='_blank'> simpler project configuration</a> when initializing Firebase App (in index.html). This way the launching page gains permformance boost because Firebase uses HTTP/2 and boost the pages from same origin.
However, pay attention that if the project is served by another HTTP server (like webpack-dev-server), the mentioned <i>simpler project configuration</> will not work and you may need to adjust the pathes in index.html to regular forms (i.e. change /__ in URLs)
