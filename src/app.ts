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
    
    createEditor("# a simple function\n\nviolin: /8 c5def +a-egc' | /2.++h' 𝄽 | /0a4 /16.e4/32g c' brh | /4. a, c'''\nviola: a𝅘𝅥𝅯bc𝄽r𝄂\n\n#=\ntest\n=#");

    console.log("loading done!");


    //if (window.browserReady) window.browserReady();
};
