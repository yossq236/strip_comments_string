import * as monaco from 'monaco-editor';
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
        this._container.addEventListener('keydown', (event) => {
          event.stopPropagation();
        });
        this._editor = monaco.editor.create(this._container, {
            automaticLayout: true,
            value: '',
            fontSize: options.fontSize,
            theme: options.theme,
            language: 'myCustomLanguage',
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

    public updateOptions(newOptions: any) {
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
                if (20 <= _suggestions.length) break;
              }
            }
          }
          return {
            incomplete: (_suggestions.length <= 1) ? false : true,
            suggestions: _suggestions,
          };
        }
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
