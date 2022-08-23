import Vue from "vue";
import Component from "vue-class-component";
import { Watch, Prop } from "vue-property-decorator";

import Editor from "./editor.vue";

import "./app.scss";

@Component({
    name: "App",
    components: {
        Editor,
    },
})
export default class App extends Vue {
    right = null;
}
