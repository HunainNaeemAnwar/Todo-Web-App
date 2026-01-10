# Feature Specification: Todo Console App

**Feature Branch**: `001-todo-console-app`
**Created**: 2025-12-30
**Status**: Draft
**Input**: User description: "Write the specification for an In-Memory Python Console App.

Goal: A simple Python console app with proper folder structure that manages tasks in memory.

Requirements:

Task Model:

Task class attributes: id (integer, auto-incrementing unique identifier), title (string, task name), description (string, detailed information), completed (boolean, task completion status), and created_at (datetime, timestamp of creation).

Tasks should be saved in a global list: tasks = [].

CLI Commands (using argparse):

# Add task
todo add -t "Buy milk" -d "2 liters"

# List all tasks
todo list

# Complete a task
todo done -i 1

# Update a task
todo update -i 1 -t "New title" -d "New details"

# Delete a task
todo delete -i 1


No Data Persistence:
Data loss on program exit is acceptable for this phase.

Output:
Clear messages must be printed after every command.

Error Handling:
Handle invalid IDs or missing arguments gracefully.

Example Usage:

# Add task
$ todo add -t "Buy milk" -d "2 liters"
Task added: [ID:1] Buy milk (Pending)

# List all tasks
$ todo list
1. [ ] Buy milk | Created: 2025-12-30

# Complete a task
$ todo done -i 1
Task completed: [ID:1] Buy milk

# Update a task
$ todo update -i 1 -t "New title" -d "New details"
Task updated: [ID:1] New title

# Delete a task
$ todo delete -i 1
Task deleted: [ID:1] New title"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add New Tasks (Priority: P1)

A user wants to add new tasks to their todo list from the command line. They run the todo add command with a title and optionally a description, and the system creates a new task with a unique ID and timestamp.

**Why this priority**: This is the foundational functionality that enables all other operations. Without the ability to add tasks, the application has no value.

**Independent Test**: Can be fully tested by running `todo add -t "Test task" -d "Test description"` and verifying that a task with a unique ID is created and displayed with a success message.

**Acceptance Scenarios**:

1. **Given** the application is running, **When** a user runs `todo add -t "Buy milk" -d "2 liters"`, **Then** a new task is created with a unique ID, title "Buy milk", description "2 liters", completed status as false, and current timestamp, with a success message "Task added: [ID:X] Buy milk (Pending)" displayed.

2. **Given** the application is running, **When** a user runs `todo add -t "Buy milk"` (without description), **Then** a new task is created with a unique ID, title "Buy milk", empty description, completed status as false, and current timestamp, with a success message displayed.

---

### User Story 2 - List All Tasks (Priority: P1)

A user wants to view all their tasks at once. They run the todo list command and see all tasks formatted in a readable way.

**Why this priority**: This is essential for the user to see their tasks and understand the current state of their todo list.

**Independent Test**: Can be fully tested by adding tasks and then running `todo list` to verify all tasks are displayed with their status, ID, and creation date.

**Acceptance Scenarios**:

1. **Given** the application has tasks in memory, **When** a user runs `todo list`, **Then** all tasks are displayed in a numbered list format with their completion status, title, and creation date.

2. **Given** the application has no tasks, **When** a user runs `todo list`, **Then** an appropriate message like "No tasks found" is displayed.

3. **Given** a task was created less than 1 minute ago, **When** a user runs `todo list`, **Then** the timestamp is displayed as "Just now".

4. **Given** a task was created 5 minutes ago, **When** a user runs `todo list`, **Then** the timestamp is displayed as "5 minutes ago".

5. **Given** a task was created 3 hours ago, **When** a user runs `todo list`, **Then** the timestamp is displayed as "3 hours ago".

6. **Given** a task was created 2 days ago, **When** a user runs `todo list`, **Then** the timestamp is displayed as "2 days ago".

7. **Given** a task was created more than 7 days ago, **When** a user runs `todo list`, **Then** the timestamp is displayed in full date format "YYYY-MM-DD".

---

### User Story 3 - Complete Tasks (Priority: P2)

A user wants to mark tasks as completed. They run the todo done command with a task ID, and the system updates the task's status to completed.

**Why this priority**: This is a core workflow for todo applications - marking tasks as done to track progress.

**Independent Test**: Can be fully tested by adding a task, running `todo done -i 1`, and verifying the task's completion status is updated and a success message is shown.

**Acceptance Scenarios**:

1. **Given** a task exists with ID 1, **When** a user runs `todo done -i 1`, **Then** the task's completed status is set to true and a success message "Task completed: [ID:1] Buy milk" is displayed.

2. **Given** a task exists with ID 1 that is already completed, **When** a user runs `todo done -i 1`, **Then** the task remains completed and an appropriate message is shown.

---

### User Story 4 - Update Task Details (Priority: P2)

A user wants to modify the title or description of an existing task. They run the todo update command with a task ID and new details, and the system updates the task.

**Why this priority**: Users often need to modify task details as circumstances change, making this an important functionality.

**Independent Test**: Can be fully tested by adding a task, running `todo update -i 1 -t "New title" -d "New description"`, and verifying the task details are updated with a success message.

**Acceptance Scenarios**:

1. **Given** a task exists with ID 1, **When** a user runs `todo update -i 1 -t "New title" -d "New description"`, **Then** the task's title and description are updated and a success message "Task updated: [ID:1] New title" is displayed.

2. **Given** a task exists with ID 1, **When** a user runs `todo update -i 1 -t "New title"` (without description), **Then** only the task's title is updated and a success message is displayed.

---

### User Story 5 - Delete Tasks (Priority: P2)

A user wants to remove tasks they no longer need. They run the todo delete command with a task ID, and the system removes the task from memory.

**Why this priority**: Users need to clean up their todo lists by removing completed or irrelevant tasks.

**Independent Test**: Can be fully tested by adding a task, running `todo delete -i 1`, and verifying the task is removed and a success message is shown.

**Acceptance Scenarios**:

1. **Given** a task exists with ID 1, **When** a user runs `todo delete -i 1`, **Then** the task is removed from the list and a success message "Task deleted: [ID:1] Task title" is displayed.

2. **Given** a task exists with ID 1, **When** a user runs `todo delete -i 1` and then runs `todo list`, **Then** the deleted task no longer appears in the list.

---

### Edge Cases

- What happens when a user tries to operate on a non-existent task ID? The system should display an appropriate error message.
- How does the system handle missing required arguments like title when adding a task? The system should display an error message.
- What happens when the task list is empty and the user runs `todo list`? The system should display "No tasks found" or similar.
- How does the system handle invalid command-line arguments? The system should display usage information or error messages.
- What happens when a user tries to add a task with a duplicate title? The system should reject the addition and display "ERROR: A task with this title already exists".
- What happens when a user tries to update a task to have a duplicate title (matching another task)? The system should reject the update and display "ERROR: A task with this title already exists".
- Verify that all error messages are sent to stderr and not stdout (e.g., by redirecting output streams or checking that error messages don't mix with success output).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a command-line interface using argparse to handle user commands
- **FR-002**: System MUST maintain tasks in memory using a global list structure
- **FR-003**: Users MUST be able to add tasks with a unique auto-incrementing integer ID, title, optional description, completed status (default false), and creation timestamp
- **FR-004**: System MUST allow users to list all tasks in a readable format showing ID, completion status, title, and creation date
- **FR-005**: System MUST allow users to mark tasks as completed using the task ID
- **FR-006**: System MUST allow users to update task title and description using the task ID
- **FR-007**: System MUST allow users to delete tasks using the task ID
- **FR-008**: System MUST display clear success messages after every successful command execution
- **FR-009**: System MUST handle invalid task IDs gracefully with appropriate error messages
- **FR-010**: System MUST handle missing command-line arguments gracefully with appropriate error messages
- **FR-011**: System MUST provide no data persistence - all data is lost when the application exits
- **FR-012**: System MUST NOT allow multiple tasks to have the same title - duplicate titles are prohibited. Duplicate detection rules:
  - Titles are compared case-insensitively with leading/trailing whitespace trimmed
  - Two tasks with titles "Buy milk" and "  BUY MILK  " are considered duplicates
  - System MUST reject task addition or updates that would result in duplicate titles
  - Error message for duplicate title: "ERROR: A task with this title already exists"
- **FR-013**: System MUST use natural language format for timestamps with the following format rules:
  - Less than 1 minute: "Just now"
  - 1-59 minutes: "X minutes ago" (e.g., "5 minutes ago")
  - 1-23 hours: "X hours ago" (e.g., "3 hours ago")
  - 1-6 days: "X days ago" (e.g., "2 days ago")
  - Older than 7 days: Display full date in YYYY-MM-DD format (e.g., "2025-12-30")
  - Format MUST be relative to current time when the list command is executed
- **FR-014**: System MUST allow partial updates - users can update title or description independently without requiring both fields
- **FR-015**: System MUST use Python's argparse module exclusively for all command-line interactions - no other CLI libraries or argument parsing mechanisms are permitted per constitution

**Explicit Data Storage Rules:**
- **DS-001**: All todo tasks must be stored only in application memory for the current runtime session
- **DS-002**: Data storage must use an in-memory Python data structure (specifically a list of task objects)
- **DS-003**: No form of persistence is allowed beyond the running process lifecycle
- **DS-004**: When the application exits or restarts, all tasks must be lost
- **DS-005**: File-based storage (JSON, TXT, YAML), databases (SQLite, PostgreSQL), caching systems, or any disk I/O are strictly prohibited
- **DS-006**: The in-memory list represents the single source of truth for task state during execution

### Key Entities *(include if feature involves data)*

- **Task**: Represents a single todo item with id (integer, auto-incrementing unique identifier), title (string), description (string), completed (boolean), and created_at (datetime)
- **Task List**: A collection of Task entities stored in memory as a global list

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add a new task in under 2 seconds from command execution. **Measurement Methodology**: Measure from start of command execution (after argparse parses arguments) to completion of operation and message output. Average of 10 runs, cold start (process restart between runs).
- **SC-002**: Users can list all tasks in under 2 seconds even with 100 tasks in memory. **Measurement Methodology**: Measure from start of list command to completion of output. Average of 10 runs, 100 tasks pre-populated in memory. Warm start (same process for all runs).
- **SC-003**: 100% of basic operations (add, list, complete, update, delete) display appropriate success or error messages
- **SC-004**: Users can successfully complete the primary workflow: add a task → list tasks → mark as complete → delete task

## Clarifications

### Session 2025-12-30

- Q: Should error messages follow a specific format? → A: Error messages follow standard format "ERROR: [message]" sent to stderr
- Q: Are performance targets strict requirements? → A: Performance targets are strict requirements that must be met
- Q: Should the system allow partial task updates? → A: Allow partial updates - user can update title or description independently

### Functional Requirements Update

- **FR-016**: Performance targets specified in success criteria are strict requirements that must be met for the feature to be considered successful
- **FR-017**: All error messages MUST follow the format "ERROR: [message]" and be sent to stderr per constitution error handling requirements
