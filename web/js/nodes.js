import { app } from "/scripts/app.js";
import { WidgetEditor } from "../lib/widget_editor/main.bundle.js"

function updateOptionsAll(newOptions) {
  app.graph?.nodes?.forEach(node => {
    if (node.type == "StripCommentsStringMultiline") {
      node.widgets?.forEach(widget => {
        if (widget.name == "text") {
          widget.options.updateOptions(newOptions);
        }
      });
    }
  });
}

app.registerExtension({
    name: "yf0659.StripCommentsStringMultiline",
    settings: [
      {
        id: "StripCommentsStringMultiline.Editor.theme",
        name: "Theme",
        type: "combo",
        defaultValue: "vs",
        category: ["Strip Comments String", "Editor", "Theme"],
        options: [
          { text: "vs", value: "vs" },
          { text: "vs-dark", value: "vs-dark" },
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
        id: "StripCommentsStringMultiline.Editor.fontsize",
        name: "Font size",
        type: "slider",
        defaultValue: 10,
        attrs: {
          min: 8,
          max: 24,
          step: 1,
        },
        category: ["Strip Comments String", "Editor", "Font size"],
        onChange: (newVal, oldVal) => {
          updateOptionsAll({fontSize: newVal});
        },
      },
      {
        id: "StripCommentsStringMultiline.Editor.word.file",
        name: "Custom Word",
        type: () => {
          const filechooser = document.createElement("input");
          filechooser.setAttribute("type", "file");
          filechooser.setAttribute("accept", ".csv");
          filechooser.addEventListener("change", (event) => {
            const file = event.target.files[0];
            const filereader = new FileReader();
            filereader.onload = (event) => {
              app.extensionManager.setting.set("StripCommentsStringMultiline.Editor.word.data", event.target.result);
            };
            filereader.readAsText(file);
          });
          return filechooser;
        },
        category: ["Strip Comments String", "Editor", "Custom Word"],
        onChange: (newVal, oldVal) => {
        },
      },
      {
        id: "StripCommentsStringMultiline.Editor.word.data",
        name: "Custom Word Data",
        type: "hidden",
        defaultValue: "",
        category: ["Strip Comments String", "Editor", "Custom Word Data"],
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
                const editor = new WidgetEditor({
                  theme: app.extensionManager.setting.get("StripCommentsStringMultiline.Editor.theme"),
                  fontSize: app.extensionManager.setting.get("StripCommentsStringMultiline.Editor.fontsize")
                });
                const widget = node.addDOMWidget(inputName, inputData[0], editor.element, {
                  getValue() {
                    return editor.value;
                  },
                  setValue(newValue) {
                    editor.value = newValue;
                  },
                  updateOptions(newOptions) {
                    editor.updateOptions(newOptions);
                  },
                });
                return widget;
            },
        };
    },
});
