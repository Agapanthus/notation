import Vue from "vue";

import { store } from "./storage/storage";
import App from "./components/app.vue";
import { createEditor } from "./editor/codemirror";

window.onload = () => {
    const v = new Vue({
        el: "#GUIBase",
        render: (h) => h(App),
        store: store,
    });
    
    createEditor("# a simple function\n\nviolin: /8 c5def +a+egh | a1 e1 gbh | a,, b'\nviola: a𝅘𝅥𝅯bc𝄽r𝄂\n\n#=\ntest\n=#");

    console.log("loading done!");


    //if (window.browserReady) window.browserReady();
};
