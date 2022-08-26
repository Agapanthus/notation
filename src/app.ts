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

    createEditor(
        "violin: 8+a3-e6.g8c' h'6c''a,8d'' | 2.++h' 𝄽 | o4 0a 16.e3g c' brh | 4. a, c'''\nviola: a𝅘𝅥𝅯bc𝄽r𝄂\n"
    );

    console.log("loading done!");

    //if (window.browserReady) window.browserReady();
};
