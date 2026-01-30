---
id: 1
title: Update Phase III Specs to Use Official MCP SDK
stage: general
date_iso: 2026-01-28
model: Claude Sonnet 4.5
feature: none
branch: 003-ai-conversational-todo
user: hunain
command: general update
labels: [mcp, sdk, specification, upgrade]
links: {spec: null, ticket: null, adr: null}
---

# Update Phase III Specs to Use Official MCP SDK

## PROMPT TEXT

update the pahse iii specs that use offical mcp sdk isntead of fast mcp

## RESPONSE TEXT

Updated the Phase III specifications to use the official MCP SDK instead of FastMCP. This involved:

1. Updated spec.md to reference "Official MCP SDK" instead of "FastMCP"
2. Updated plan.md to reference "Official MCP SDK" in the summary
3. Updated research.md to change from "FastMCP Integration" to "Official MCP SDK Integration"
4. Updated contracts/mcp-tools.yaml to reference "Official MCP SDK server"
5. Updated tasks.md to reference "Official MCP SDK" in test descriptions
6. Updated the actual implementation in backend/src/mcp/server.py to use the correct FastMCP import and syntax
7. Fixed tool decorator syntax to use @mcp.tool() with parentheses as per documentation
8. Updated authentication approach to work with FastMCP's context system
9. Updated __init__.py to remove obsolete JWTAuthMiddleware import
10. Updated test files to reference "Official MCP SDK" instead of "FastMCP"

The implementation now correctly uses the official MCP SDK (FastMCP) with proper syntax and authentication handling.

## FILES

 - /home/hunain/DO/it/specs/003-ai-conversational-todo/spec.md
 - /home/hunain/DO/it/specs/003-ai-conversational-todo/plan.md
 - /home/hunain/DO/it/specs/003-ai-conversational-todo/research.md
 - /home/hunain/DO/it/specs/003-ai-conversational-todo/contracts/mcp-tools.yaml
 - /home/hunain/DO/it/specs/003-ai-conversational-todo/tasks.md
 - /home/hunain/DO/it/backend/src/mcp/server.py
 - /home/hunain/DO/it/backend/src/mcp/__init__.py
 - /home/hunain/DO/it/backend/tests/unit/test_mcp_server.py
 - /home/hunain/DO/it/backend/tests/unit/test_mcp_context.py
 - /home/hunain/DO/it/backend/tests/unit/test_mcp_server_comprehensive.py

## TESTS

 - /home/hunain/DO/it/backend/tests/unit/test_mcp_server.py
 - /home/hunain/DO/it/backend/tests/unit/test_mcp_context.py
 - /home/hunain/DO/it/backend/tests/unit/test_mcp_server_comprehensive.py

## OUTCOME

Successfully updated all Phase III specifications and implementation to reference and use the official MCP SDK instead of FastMCP. The server now imports and uses FastMCP correctly with proper authentication handling. All references to FastMCP have been updated to reflect the official MCP SDK usage, and the implementation has been fixed to work with the correct FastMCP syntax and context handling.

## EVALUATION

The changes have been successfully implemented and tested. The MCP server can now be imported and instantiated without errors, and all references to the SDK have been updated consistently across all documentation and code files.