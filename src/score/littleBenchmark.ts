import * as util from "./util";

import _ from "lodash";

const benchmarkJS = require("benchmark");

// declare the global property
declare global {
    interface Window {
        Benchmark: typeof benchmarkJS;
    }
}

// avoid `Cannot read property 'parentNode' of undefined` error in runScript
const script = document.createElement("script");
document.body.appendChild(script);

// cast the faulty `Function` type
window.Benchmark = benchmarkJS.runInContext({ _ }) as typeof benchmarkJS;

// provide scoped constructor
export default window.Benchmark;

function runBenchmark(name: string, fs: { [key: string]: () => void }) {
    console.log('Starting benchmark "' + name + '"');
    const suite = new window.Benchmark.Suite();
    for (const k in fs) {
        suite.add(k, fs[k]);
    }

    // add listeners
    suite
        .on("cycle", function (event) {
            console.log(String(event.target));
        })
        .on("complete", function () {
            console.log("Fastest is " + this.filter("fastest").map("name"));
        })
        .run();
}

function ssum(arr: number[]): number {
    let res = 0;
    for (const x of arr) {
        res += x;
    }
    return res;
}

function simpleBench(name: string, f: () => void) {
    console.time(name);
    for (let i = 0; i < 100000; i++) f();
    console.timeEnd(name);
}

export function sum() {
    const arr = Array.from({ length: 100 }, () => Math.random());
    const typedArr = new Float32Array(arr);

    const reducer = function (p: number, a: number) {
        return p + a;
    };
    const recursion = function (arr: number[], i: number) {
        if (i > 0) return arr[i] + recursion(arr, i - 1);
        else return 0;
    };
    const recursion2 = function (arr: number[], i: number, len: number) {
        if (i < len) return arr[i] + recursion2(arr, i + 1, len);
        else return 0;
    };
    const recursion3 = function (arr: number[], i: number) {
        if (i < arr.length) return arr[i] + recursion3(arr, i + 1);
        else return 0;
    };
    const powUsingLoop = function powUsingLoop(x, n) {
        var result = 1;
        for (var i = 0; i < n; i++) {
            result *= x;
        }
        return result;
    };
    const powUsingRecursion = function (x, n) {
        if (n == 1) {
            return x;
        } else {
            return x * powUsingRecursion(x, n - 1);
        }
    };

    /*
    simpleBench("pow loop", () => powUsingLoop(2, 1000));
    simpleBench("pow rec", () => powUsingLoop(2, 1000));
    simpleBench("sum reduce", () => arr.reduce((p, a) => p + a, 0));
    simpleBench("sum reduce2", () => arr.reduce(reducer, 0));
    simpleBench("loop it", () => {
        let res = 0;
        for (const x of arr) res += x;
    });
    simpleBench("sum fun", () => ssum(arr));

    console.time("sum reduce");
    for (let i = 0; i < 100000; i++) arr.reduce((p, a) => p + a, 0);
    console.timeEnd("sum reduce");

    console.time("recursion");
    for (let i = 0; i < 100000; i++) recursion3(arr, 0);
    console.timeEnd("recursion");

    console.time("loop with iterator");
    for (let i = 0; i < 100000; i++) {
        let res = 0;
        for (const x of arr) res += x;
    }
    console.timeEnd("loop with iterator");*/

    new window.Benchmark.Suite()
        .add("pow loop", () => powUsingLoop(2, 1000))
        .add("pow rec", () => powUsingRecursion(2, 1000))
        .add("loadash", () => _.sum(arr))
        .add("jquery", () => {
            let res = 0;
            $.each(arr, (_, x) => (res += x));
        })
        .add("forEach", () => {
            let res = 0;
            arr.forEach((x) => (res += x));
        })
        .add("reduce", () => arr.reduce((p, a) => p + a, 0))
        .add("predefined reduce", () => arr.reduce(reducer, 0))
        .add("eval", () => eval(arr.join("+")))
        .add("recursion", () => recursion(arr, arr.length - 1))
        .add("recursion2", () => recursion2(arr, 0, arr.length))
        .add("recursion3", () => recursion3(arr, 0))
        /* .add("naive", () => (
            arr[0]+arr[1]+arr[2]+arr[3]+arr[4]+arr[5]+arr[6]+arr[7]+arr[8]+arr[9]+
            arr[10]+arr[11]+arr[12]+arr[13]+arr[14]+arr[15]+arr[16]+arr[17]+arr[18]+arr[19]+
            arr[20]+arr[21]+arr[22]+arr[23]+arr[24]+arr[25]+arr[26]+arr[27]+arr[28]+arr[29]+
            arr[30]+arr[31]+arr[32]+arr[33]+arr[34]+arr[35]+arr[36]+arr[37]+arr[38]+arr[39]+
            arr[40]+arr[41]+arr[42]+arr[43]+arr[44]+arr[45]+arr[46]+arr[47]+arr[48]+arr[49]+
            arr[50]+arr[51]+arr[52]+arr[53]+arr[54]+arr[55]+arr[56]+arr[57]+arr[58]+arr[59]+
            arr[60]+arr[61]+arr[62]+arr[63]+arr[64]+arr[65]+arr[66]+arr[67]+arr[68]+arr[69]+
            arr[70]+arr[71]+arr[72]+arr[73]+arr[74]+arr[75]+arr[76]+arr[77]+arr[78]+arr[79]+
            arr[80]+arr[81]+arr[82]+arr[83]+arr[84]+arr[85]+arr[86]+arr[87]+arr[88]+arr[89]+
            arr[90]+arr[91]+arr[92]+arr[93]+arr[94]+arr[95]+arr[96]+arr[97]+arr[98]+arr[99]))*/
        .add("loop with iterator", () => {
            let res = 0;
            for (const x of arr) res += x;
        })
        .add("traditional for loop", () => {
            let res = 0;
            // cache the length in case the browser can't do it automatically
            const len = arr.length;
            for (let i = 0; i < len; i++) res += arr[i];
        })
        .add("while loop", () => {
            let res = 0;
            let i = arr.length;
            while (i--) res += arr[i];
        })
        .add("loop in a function ", () => ssum(arr))
        .add("util.sum ", () => util.sum(arr))
        .add("typed loop", () => {
            let res = 0;
            const len = typedArr.length;
            for (let i = 0; i < len; i++) res += typedArr[i];
        })
        .on("cycle", (event) => console.log(String(event.target)))
        .run();
}

export function eSum() {
    const arr = Array.from({ length: 100 }, () => {
        return { x: Math.random(), y: Math.random(), z: Math.random() };
    });
    runBenchmark("element sum", {
        "util.sum with map": () => {
            util.sum(arr.map((x) => x.x)) +
                util.sum(arr.map((x) => x.y)) +
                util.sum(arr.map((x) => x.z));
        },
        "util.eSum": () => {
            util.eSum(arr, "x") + util.eSum(arr, "y") + util.eSum(arr, "z");
        },
    });
}
