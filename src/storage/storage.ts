import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex)

export interface State {
    x: string;
}

export const store = new Vuex.Store<State>({
    state: {
        x: "0",
    },
    getters: {
        getX: (state) => {
            return state.x;
        },
    },

    mutations: {
        setX: (state, x: any) => {
            state.x = x;
        },
    },
});
