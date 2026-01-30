"""CLI interface for Todo Console App using argparse."""

import argparse
import shlex
import sys
from services.task_service import tasks, add_task, get_all_tasks, complete_task, update_task, delete_task, format_timestamp


def print_success(message: str) -> None:
    """Print a success message to stdout."""
    print(message, file=sys.stdout)


def print_error(message: str) -> None:
    """Print an error message to stderr."""
    print(f"ERROR: {message}", file=sys.stderr)


def handle_add(args: argparse.Namespace) -> None:
    """Handle add command."""
    try:
        task = add_task(args.title, args.description)
        status = "Pending" if not task.completed else "Completed"
        print_success(f"Task added: [ID:{task.id}] {task.title} ({status})")
    except ValueError as e:
        print_error(str(e))
        sys.exit(1)


def handle_list(args: argparse.Namespace) -> None:
    """Handle list command."""
    all_tasks = get_all_tasks()

    if not all_tasks:
        print_success("No tasks found")
        return

    for task in all_tasks:
        status_symbol = "[X]" if task.completed else "[ ]"
        timestamp = format_timestamp(task.created_at)
        print_success(f"{task.id}. {status_symbol} {task.title} | Created: {timestamp}")
        if task.description:
            print_success(f"   Description: {task.description}")


def handle_done(args: argparse.Namespace) -> None:
    """Handle done command."""
    try:
        task = complete_task(args.id)
        print_success(f"Task completed: [ID:{task.id}] {task.title}")
    except ValueError as e:
        print_error(str(e))
        sys.exit(1)


def handle_update(args: argparse.Namespace) -> None:
    """Handle update command."""
    try:
        # Ensure at least one of title or description is provided
        if args.title is None and args.description is None:
            print_error("At least one of --title or --description must be provided")
            sys.exit(1)

        task = update_task(args.id, args.title, args.description)
        print_success(f"Task updated: [ID:{task.id}] {task.title}")
    except ValueError as e:
        print_error(str(e))
        sys.exit(1)


def handle_delete(args: argparse.Namespace) -> None:
    """Handle delete command."""
    try:
        task = delete_task(args.id)
        print_success(f"Task deleted: [ID:{task.id}] {task.title}")
    except ValueError as e:
        print_error(str(e))
        sys.exit(1)


def create_parser() -> argparse.ArgumentParser:
    """Create and configure argument parser."""
    parser = argparse.ArgumentParser(
        prog="todo",
        description="In-Memory Python Console Todo App",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s add -t "Buy milk" -d "2 liters"
  %(prog)s list
  %(prog)s done -i 1
  %(prog)s update -i 1 -t "New title" -d "New description"
  %(prog)s delete -i 1

Note: Use 'todo interactive' to start an interactive session where tasks persist between commands.
""",
    )

    subparsers = parser.add_subparsers(
        dest="command", help="Available commands"
    )

    # Add command
    add_parser = subparsers.add_parser("add", help="Add a new task")
    add_parser.add_argument(
        "-t", "--title", required=True, type=str, help="Task title (required)"
    )
    add_parser.add_argument(
        "-d",
        "--description",
        type=str,
        default="",
        help="Task description (optional)",
    )

    # List command
    list_parser = subparsers.add_parser("list", help="List all tasks")

    # Done command
    done_parser = subparsers.add_parser("done", help="Mark a task as completed")
    done_parser.add_argument(
        "-i", "--id", required=True, type=int, help="Task ID (required)"
    )

    # Update command
    update_parser = subparsers.add_parser("update", help="Update a task")
    update_parser.add_argument(
        "-i", "--id", required=True, type=int, help="Task ID (required)"
    )
    update_parser.add_argument("-t", "--title", type=str, help="New title (optional)")
    update_parser.add_argument(
        "-d", "--description", type=str, help="New description (optional)"
    )

    # Delete command
    delete_parser = subparsers.add_parser("delete", help="Delete a task")
    delete_parser.add_argument(
        "-i", "--id", required=True, type=int, help="Task ID (required)"
    )

    return parser


def interactive_mode() -> None:
    """Run CLI in interactive mode."""
    print("Todo Console App - Interactive Mode")
    print("Type 'help' for available commands or 'exit' to quit.")
    print()

    while True:
        try:
            user_input = input("todo> ").strip()

            if not user_input:
                continue

            if user_input.lower() in ["exit", "quit"]:
                print("Goodbye!")
                break

            if user_input.lower() == "help":
                create_parser().print_help()
                continue

            if user_input.lower() == "list":
                print()
                handle_list(None)
                print()
                continue

            # Parse other commands
            try:
                args = create_parser().parse_args(shlex.split(user_input))

                command_handlers = {
                    "add": handle_add,
                    "list": handle_list,
                    "done": handle_done,
                    "update": handle_update,
                    "delete": handle_delete,
                }

                handler = command_handlers.get(args.command)
                if handler:
                    print()
                    handler(args)
                    print()
                else:
                    print_error("Unknown command")
                    create_parser().print_help()

            except SystemExit:
                # argparse calls sys.exit(1) on error, continue loop
                print()
                continue

        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except EOFError:
            print("\nGoodbye!")
            break


def main() -> None:
    """Main entry point for CLI application."""
    parser = create_parser()

    # Check if running in interactive mode
    if len(sys.argv) > 1 and sys.argv[1] == "interactive":
        interactive_mode()
        return

    # Check if any arguments provided
    if len(sys.argv) == 1:
        # No arguments, show help
        parser.print_help()
        sys.exit(1)

    args = parser.parse_args()

    command_handlers = {
        "add": handle_add,
        "list": handle_list,
        "done": handle_done,
        "update": handle_update,
        "delete": handle_delete,
    }

    handler = command_handlers.get(args.command)
    if handler:
        handler(args)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
