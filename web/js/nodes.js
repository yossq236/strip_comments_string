import { app } from '/scripts/app.js';
import { WidgetEditor } from '../scripts/widget_editor/main.bundle.js';
import { createApp } from 'vue';
import FileUpload from 'primevue/fileupload';

const CLASSNAME_NODE = 'StripCommentsStringMultiline';
const ID_NODE = 'yossq236.' + CLASSNAME_NODE;
const ID_SETTINGS_THEME = ID_NODE + '.Editor.theme';
const ID_SETTINGS_FONTSIZE = ID_NODE + '.Editor.fontsize';
const ID_SETTINGS_WORD_FILE = ID_NODE + '.Editor.word.file';
const ID_SETTINGS_WORD_DATA = ID_NODE + '.Editor.word.data';

const ID_WIDGET_TEXT = 'text';
const ID_WIDGET_EDITOR_STATE = 'editor_state';

function updateOptionsAll(newOptions) {
  app.graph?.nodes?.filter(n => n.type === CLASSNAME_NODE).forEach(n => {
    n.widgets?.filter(w => w.name === ID_WIDGET_TEXT).forEach(w => {
      w.options.updateOptions(newOptions);
    });
  });
}

app.registerExtension({
    name: ID_NODE,
    settings: [
      {
        id: ID_SETTINGS_THEME,
        category: ['Strip Comments String', 'Editor', 'Theme'],
        name: 'Theme',
        type: 'combo',
        defaultValue: 'vs',
        options: [
          { text: 'vs', value: 'vs' },
          { text: 'vs-dark', value: 'vs-dark' },
        ],
        attrs: {
          editable: false,
          filter: false,
        },
        onChange: (newVal, oldVal) => {
          updateOptionsAll({theme: newVal});
        },
      },
      {
        id: ID_SETTINGS_FONTSIZE,
        category: ['Strip Comments String', 'Editor', 'Font size'],
        name: 'Font size',
        type: 'slider',
        defaultValue: 10,
        attrs: {
          min: 8,
          max: 24,
          step: 1,
        },
        onChange: (newVal, oldVal) => {
          updateOptionsAll({fontSize: newVal});
        },
      },
      {
        id: ID_SETTINGS_WORD_FILE,
        category: ['Strip Comments String', 'Editor', 'Custom Word'],
        name: 'Custom Word',
        type: () => {
          const containor = document.createElement('div');
          const app = createApp({
            components: { FileUpload },
            methods: {
              onSelect: (e) => {
                const file = e.files[0];
                const filereader = new FileReader();
                filereader.onload = (event) => {
                  app.extensionManager.setting.set(ID_SETTINGS_WORD_DATA, event.target.result);
                };
                filereader.readAsText(file);
              },
            },
            template: '<FileUpload mode="basic" chooseLabel="Choose" accept=".csv" @select="onSelect" :auto="true" />',
          });
          app.mount(containor);
          return containor;
        },
      },
      {
        id: ID_SETTINGS_WORD_DATA,
        category: ['Strip Comments String', 'Editor', 'Custom Word Data'],
        name: 'Custom Word Data',
        type: 'hidden',
        defaultValue: '',
        onChange: (newVal, oldVal) => {
          WidgetEditor.setWordFromCSVString(newVal);
        },
      },
    ],
    async init() {
      WidgetEditor.setupLanguage();
    },
    async getCustomWidgets(app) {
        return {
            WidgetEditor: (node, inputName, inputData, app, widgetName) => {
                const _editor = new WidgetEditor({
                  theme: app.extensionManager.setting.get(ID_SETTINGS_THEME),
                  fontSize: app.extensionManager.setting.get(ID_SETTINGS_FONTSIZE)
                });
                const _node = node;
                const _widget = node.addDOMWidget(inputName, inputData[0], _editor.element, {
                  getValue: () => {
                    _node.properties[ID_WIDGET_EDITOR_STATE] = _editor.saveViewState();
                    return _editor.value;
                  },
                  setValue: (newValue) => {
                    _editor.value = newValue;
                    _editor.restoreViewState(_node.properties[ID_WIDGET_EDITOR_STATE]);
                  },
                  updateOptions: (newOptions) => {
                    _editor.updateOptions(newOptions);
                  },
                });
                _editor.element.addEventListener('keydown', (e) => {
                  e.stopPropagation();
                });
                return _widget;
            },
        };
    },
});
