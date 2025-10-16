#!/usr/bin/env python

"""Tests for `strip_comments_string` package."""

import pytest
from src.py.nodes import StripCommentsStringMultiline

@pytest.fixture
def example_node():
    """Fixture to create an Example node instance."""
    return StripCommentsStringMultiline()

def test_example_node_initialization(example_node):
    """Test that the node can be instantiated."""
    assert isinstance(example_node, StripCommentsStringMultiline)

def test_return_types():
    """Test the node's metadata."""
    assert StripCommentsStringMultiline.RETURN_TYPES == ("STRING",)
    assert StripCommentsStringMultiline.FUNCTION == "strip_comments"
    assert StripCommentsStringMultiline.CATEGORY == "utils"
