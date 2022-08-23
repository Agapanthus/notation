//import { parser } from "./notation.grammar";
import { parser } from "./notation.js";
import {
    foldNodeProp,
    foldInside,
    indentNodeProp,
    indentService,
    IndentContext,
} from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";

let parserWithMetadata = parser.configure({
    props: [
        styleTags({
            /* Identifier: t.variableName,
            Boolean: t.bool,*/
            String: t.string,
            Comment: t.comment,
            BlockComment: t.blockComment,
            Number: t.number,
            Identifier: t.name,
            function: t.keyword,
            end: t.keyword,
            "( )": t.paren,
        }),
        /*indentNodeProp.add({
            Application: (context) => context.column(context.node.from) + context.unit,
        }),*/
        foldNodeProp.add({
            FunctionDefinition: foldInside,
        }),
    ],
});

import { LRLanguage, LanguageSupport } from "@codemirror/language";

export const notationLanguage = LRLanguage.define({
    parser: parserWithMetadata,
    languageData: {
        commentTokens: { line: "#" },
    },
});

import { completeFromList } from "@codemirror/autocomplete";

export const notationCompletion = notationLanguage.data.of({
    autocomplete: completeFromList([
        { label: "function", type: "keyword" },
        { label: "melody", type: "keyword" },
        { label: "rhythm", type: "keyword" },
        { label: "end", type: "keyword" },
        { label: "let", type: "keyword" },

        { label: "test", type: "function" },
        { label: "abbreviate", type: "function" },
    ]),
});

export function notation() {
    return new LanguageSupport(notationLanguage, [notationCompletion]);
}
