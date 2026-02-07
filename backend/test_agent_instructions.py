"""
Quick test to verify the agent will generate descriptive descriptions
"""
import asyncio
from src.api.chatkit_router import TaskChatKitServer, ConversationStore
from src.database.database import engine
from sqlmodel import Session

async def test_agent_instructions():
    """Test that agent instructions include task creation guidelines"""
    
    # Create a mock session and store
    test_user_id = "test-user-123"
    # ConversationStore now manages its own session via context manager
    store = ConversationStore(test_user_id)

    # Create the ChatKit server instance
    server = TaskChatKitServer(store, test_user_id)
        # Verify key components are present
        checks = {
            "Task Creation Guidelines": "## Task Creation Guidelines:" in instructions,
            "Descriptive description requirement": "ALWAYS provide a detailed, descriptive description" in instructions,
            "Actionable details": "specific, actionable details" in instructions,
            "Examples provided": "Buy groceries" in instructions and "Fix login bug" in instructions,
            "Task Management section": "## Task Management:" in instructions,
        }
        
        print("\nInstruction Components Check:")
        for check_name, result in checks.items():
            status = "✓ PASS" if result else "✗ FAIL"
            print(f"  {status}: {check_name}")
        
        all_passed = all(checks.values())
        
        print("\n" + "=" * 80)
        if all_passed:
            print("✓ All checks passed! Agent instructions are properly configured.")
        else:
            print("✗ Some checks failed. Review the instructions.")
        print("=" * 80)
        
        # Print a sample of the instructions
        print("\nSample of Agent Instructions:")
        print("-" * 80)
        lines = instructions.split('\n')
        for i, line in enumerate(lines[:25]):  # Show first 25 lines
            print(f"{i+1:3d}: {line}")
        if len(lines) > 25:
            print(f"... ({len(lines) - 25} more lines)")
        print("-" * 80)
        
        return all_passed

if __name__ == "__main__":
    result = asyncio.run(test_agent_instructions())
    exit(0 if result else 1)
