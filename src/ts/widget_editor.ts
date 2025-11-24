// import * as monaco from 'monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import * as Papa from 'papaparse';

interface CustomWord {
  label: string;
  insertText: string;
  documentation: string;
}

export class WidgetEditor {
    private static _words: Array<CustomWord>;
    private _container: HTMLElement;
    private _editor: monaco.editor.IStandaloneCodeEditor;

    constructor(options: any) {
        this._container = document.createElement('div');
        this._editor = monaco.editor.create(this._container, {
            automaticLayout: true,
            value: '',
            fontSize: options.fontSize,
            theme: options.theme,
            language: 'myCustomLanguage',
            folding: true,
        });
    }

    public get element(): HTMLElement {
        return this._container;
    }

    public get value(): string {
        return this._editor.getValue();
    }
    public set value(newValue: string) {
        this._editor.setValue(newValue);
    }

    public saveViewState(): string {
      return JSON.stringify(this._editor.saveViewState());
    }
    public restoreViewState(state): void {
      this._editor.restoreViewState(JSON.parse(state));
    }

    public updateOptions(newOptions: any): void {
      this._editor.updateOptions(newOptions);
    }

    public static setupLanguage() {
      monaco.languages.register({ id: 'myCustomLanguage' });
      monaco.languages.setMonarchTokensProvider('myCustomLanguage', {
        ignoreCase: false,
        tokenizer: {
          root: [
            // line comment
            [/\/\/.*$/, 'comment'],
            [/#.*$/, 'constant.language'],
            // block comment
            [/\/\*/, 'comment', '@blockComment'],
            // delimiter
            [/[,.]/, 'delimiter'],
            // word
            [/[^\,\.]+/, 'word'],
          ],
          blockComment: [
            [/.*?\*\//, 'comment', '@pop'],
            [/.*/, 'comment'],
          ]
        },
      });
      monaco.languages.setLanguageConfiguration('myCustomLanguage', {
        comments: {
          lineComment: '//',
          blockComment: ['/*', '*/'],
        },
        brackets: [
          ['{', '}'], 
          ['[', ']'], 
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: "'", close: "'", notIn: ['string', 'comment'] },
          { open: '"', close: '"', notIn: ['string', 'comment'] }
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: "'", close: "'" },
          { open: '"', close: '"' }
        ],
        wordPattern: /[^\,\.]+/g,
      });
      monaco.languages.registerCompletionItemProvider('myCustomLanguage', {
        provideCompletionItems: function (model, position) {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          const _suggestions = [];
          if (WidgetEditor._words) {
            for (const _word of WidgetEditor._words) {
              if (0 <= _word.label.indexOf(word.word)) {
                _suggestions.push({
                  documentation: _word.documentation,
                  insertText: _word.insertText,
                  kind: monaco.languages.CompletionItemKind.Text,
                  label: _word.label,
                  range: range              
                });
                if (40 <= _suggestions.length) break;
              }
            }
          }
          return {
            incomplete: true,
            suggestions: _suggestions,
          };
        }
      });
      monaco.languages.registerFoldingRangeProvider('myCustomLanguage', {
        provideFoldingRanges: (model, context, token) => {
          const ranges = [];
          const ranges_add = (block_lv_range_start:Map<number,number>, block_lv:number, range_end:number) => {
            const range_start = block_lv_range_start.get(block_lv) ?? 0;
            if ((0 < range_start) && (0 < (range_end - range_start))) {
              ranges.push({
                start: range_start,
                end: range_end,
                kind: monaco.languages.FoldingRangeKind.Region,
              });
            }
          };
          // 
          const block_lv_range_start = new Map<number,number>;
          let current_lineno = -1;
          model.getLinesContent().forEach((line,lineno) => {
            current_lineno = lineno + 1;
            const block_mat = /^#+/.exec(line);
            if (block_mat) {
              const block_lv = block_mat[0].length;
              block_lv_range_start.keys().filter((internal_block_lv) => block_lv <= internal_block_lv)
              .forEach((internal_block_lv) => {
                ranges_add(block_lv_range_start, internal_block_lv, current_lineno - 1);
                block_lv_range_start.set(internal_block_lv, 0);
              });
              ranges_add(block_lv_range_start, block_lv, current_lineno - 1);
              block_lv_range_start.set(block_lv, current_lineno);
            }
          });
          block_lv_range_start.keys().forEach((block_lv) => {
            ranges_add(block_lv_range_start, block_lv, current_lineno - 1);
          });
          //
          ranges.sort((range1, range2) => {
            const cmp1 = range1.start - range2.start;
            if (cmp1 != 0) {
              return cmp1;
            }
            const cmp2 = (range1.end - range1.start) - (range2.end - range2.start);
            if (cmp2 != 0) {
              return cmp2;
            }
            return 0;
          });
          //
          return ranges;
        },
      });
    }

    public static setWordFromCSVString(data: string) {
      if (WidgetEditor._words) {
        WidgetEditor._words.splice(0);
      } else {
        WidgetEditor._words = [];
      }
      const result = Papa.parse<Array<string>>(data, {
        header: false,
        dynamicTyping: false,
      });
      if (1 < result.data.length) {
        const head = result.data[0];
        const col_tag = head.findIndex((c) => c === 'tag');
        const col_ali = head.findIndex((c) => c === 'alias');
        if ((0 <= col_tag) && (0 <= col_ali)) {
          for (var i = 1; i < result.data.length; i++) {
            const body = result.data[i];
            const tag = body[col_tag];
            const doc = (body[col_ali]) ? body[col_ali] : '';
            if (tag) {
              WidgetEditor._words.push({
                label: tag,
                insertText: tag.replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/_/g, ' ') + ',',
                documentation: doc,
              });
            }
          }
        }
      }
    }
}
