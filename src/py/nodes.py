from inspect import cleandoc
import re

class StripCommentsStringMultiline:

    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "text": ("STRING", {
                    "multiline": True,
                    "default": "",
                    "widgetType": "EditorWidget",
                }),
            },
        }

    RETURN_TYPES = ("STRING",)
    #RETURN_NAMES = ("image_output_name",)
    DESCRIPTION = ""
    FUNCTION = "strip_comments"

    #OUTPUT_NODE = False
    #OUTPUT_TOOLTIPS = ("",) # Tooltips for the output node

    CATEGORY = "utils"

    def strip_comments(self, text):
        strip_text = re.sub("(#+.*?$)|(//.*?$)|(/\\*.*?\\*/)", "", text, flags=re.MULTILINE | re.DOTALL)
        strip_lines = list(filter(lambda n: n.strip() != "", strip_text.splitlines()))
        result = "\n".join(strip_lines)
        return (result,)

    #@classmethod
    #def IS_CHANGED(s, image, string_field, int_field, float_field, print_to_screen):
    #    return ""

# A dictionary that contains all nodes you want to export with their names
# NOTE: names should be globally unique
NODE_CLASS_MAPPINGS = {
    "StripCommentsStringMultiline": StripCommentsStringMultiline,
}

# A dictionary that contains the friendly/humanly readable titles for the nodes
NODE_DISPLAY_NAME_MAPPINGS = {
    "StripCommentsStringMultiline": "Strip Comments String(Multiline)",
}
