"""Top-level package for strip_comments_string."""

__all__ = [
    "NODE_CLASS_MAPPINGS",
    "NODE_DISPLAY_NAME_MAPPINGS",
    
]

__author__ = """yos"""
__email__ = "yf0659@gmail.com"
__version__ = "0.0.1"

from .src.py.nodes import NODE_CLASS_MAPPINGS
from .src.py.nodes import NODE_DISPLAY_NAME_MAPPINGS

WEB_DIRECTORY = "./web"

import os
from server import PromptServer
from aiohttp import web

NODE_DIR = os.path.dirname(__file__)
NODE_LIB_DIR = os.path.join(NODE_DIR, "lib")
NODE_LIB_EDITOR_WIDGET_DIR = os.path.join(NODE_LIB_DIR, "editor_widget")

@PromptServer.instance.routes.get("/extensions/strip_comments_string/lib/editor_widget/{filename}")
async def get_lib_editor_widget_files(request):
    filename = request.match_info["filename"]
    filepath = os.path.join(NODE_LIB_EDITOR_WIDGET_DIR, filename)
    if os.path.isfile(filepath):
        return web.FileResponse(filepath)
    return web.Response(status=404)

