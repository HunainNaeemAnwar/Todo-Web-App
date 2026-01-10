---
description: "Task list for Todo Console App implementation"
---

**Explicit Data Storage Rules:**
- All todo tasks must be stored only in application memory for the current runtime session
- Data storage must use an in-memory Python data structure (specifically a list of task objects)
- No form of persistence is allowed beyond the running process lifecycle
- When the application exits or restarts, all tasks must be lost
- File-based storage (JSON, TXT, YAML), databases (SQLite, PostgreSQL), caching systems, or any disk I/O are strictly prohibited
- The in-memory list represents the single source of truth for task state during execution

# Tasks: Todo Console App

**Input**: Design documents from `/specs/001-todo-console-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan in src/
- [X] T002 Create models directory in src/models/
- [X] T003 Create services directory in src/services/
- [X] T004 Create cli directory in src/cli/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Create Task model in src/models/task.py with all required attributes (id, title, description, completed, created_at)
- [X] T006 [P] Create in-memory task storage in src/services/task_service.py with global tasks list
- [X] T007 [P] Create CLI argument parser setup using argparse module exclusively in src/cli/cli_app.py per constitution
- [X] T008 Create main application entry point in src/main.py
- [X] T009 Implement proper datetime handling with natural language format for timestamps

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add New Tasks (Priority: P1) 🎯 MVP

**Goal**: Enable users to add new tasks to their todo list from the command line with a title and optional description

**Independent Test**: Can be fully tested by running `python src/main.py add -t "Test task" -d "Test description"` and verifying that a task with a unique ID is created and displayed with a success message.

### Implementation for User Story 1

- [X] T010 [P] [User Story 1] Implement Task creation with auto-incrementing ID in src/models/task.py
- [X] T011 [User Story 1] Implement add_task method in src/services/task_service.py
- [X] T012 [User Story 1] Implement add command handler using argparse module exclusively in src/cli/cli_app.py
- [X] T013 [User Story 1] Implement success message for task addition in src/cli/cli_app.py
- [X] T014 [User Story 1] Implement validation for required title parameter
- [X] T015 [User Story 1] Add error handling for missing title in src/cli/cli_app.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - List All Tasks (Priority: P1)

**Goal**: Enable users to view all their tasks at once in a readable format

**Independent Test**: Can be fully tested by adding tasks and then running `python src/main.py list` to verify all tasks are displayed with their status, ID, and creation date.

### Implementation for User Story 2

- [X] T016 [P] [User Story 2] Implement get_all_tasks method in src/services/task_service.py
- [X] T017 [User Story 2] Implement list command handler using argparse module exclusively in src/cli/cli_app.py
- [X] T018 [User Story 2] Implement task display format with ID, status, title, and creation date
- [X] T019 [User Story 2] Implement "No tasks found" message when list is empty
- [X] T020 [User Story 2] Add natural language timestamp formatting for task creation time

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Complete Tasks (Priority: P2)

**Goal**: Enable users to mark tasks as completed using the task ID

**Independent Test**: Can be fully tested by adding a task, running `python src/main.py done -i 1`, and verifying the task's completion status is updated and a success message is shown.

### Implementation for User Story 3

- [X] T021 [P] [User Story 3] Implement complete_task method in src/services/task_service.py
- [X] T022 [User Story 3] Implement done command handler using argparse module exclusively in src/cli/cli_app.py
- [X] T023 [User Story 3] Implement success message for task completion in src/cli/cli_app.py
- [X] T024 [User Story 3] Implement error handling for non-existent task IDs in src/services/task_service.py
- [X] T025 [User Story 3] Add appropriate message when task is already completed

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Update Task Details (Priority: P2)

**Goal**: Enable users to modify the title or description of an existing task using the task ID

**Independent Test**: Can be fully tested by adding a task, running `python src/main.py update -i 1 -t "New title" -d "New description"`, and verifying the task details are updated with a success message.

### Implementation for User Story 4

- [X] T026 [P] [User Story 4] Implement update_task method in src/services/task_service.py with support for partial updates
- [X] T027 [User Story 4] Implement update command handler using argparse module exclusively in src/cli/cli_app.py
- [X] T028 [User Story 4] Implement success message for task update in src/cli/cli_app.py
- [X] T029 [User Story 4] Add validation for partial update parameters (title or description can be updated independently)
- [X] T030 [User Story 4] Add error handling for non-existent task IDs in src/services/task_service.py

**Checkpoint**: At this point, User Stories 1, 2, 3 AND 4 should all work independently

---

## Phase 7: User Story 5 - Delete Tasks (Priority: P2)

**Goal**: Enable users to remove tasks using the task ID

**Independent Test**: Can be fully tested by adding a task, running `python src/main.py delete -i 1`, and verifying the task is removed and a success message is shown.

### Implementation for User Story 5

- [X] T031 [P] [User Story 5] Implement delete_task method in src/services/task_service.py
- [X] T032 [User Story 5] Implement delete command handler using argparse module exclusively in src/cli/cli_app.py
- [X] T033 [User Story 5] Implement success message for task deletion in src/cli/cli_app.py
- [X] T034 [User Story 5] Add error handling for non-existent task IDs in src/services/task_service.py
- [X] T035 [User Story 5] Verify deleted task no longer appears when listing tasks

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T036 [P] Implement comprehensive type hints across all functions, parameters, return types, and class attributes in src/ following Python typing module conventions per constitution
- [X] T037 [P] Implement consistent error message format "ERROR: [message]" sent to stderr
- [X] T038 Add performance validation to ensure all operations (add, list, complete, update, delete) complete in under 2 seconds as specified in success criteria
- [X] T039 [P] Prevent duplicate task titles as specified in requirements a
- [X] T040 Add comprehensive CLI help text for all commands
- [X] T041 Run quickstart.md validation to ensure all commands work as expected
- [X] T042 Add validation test to verify error messages are sent to stderr (not stdout) for all error conditions per FR-017

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all components for User Story 1 together:
Task: "Implement Task creation with auto-incrementing ID in src/models/task.py"
Task: "Implement add_task method in src/services/task_service.py"
Task: "Implement add command handler in src/cli/cli_app.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
   - Developer E: User Story 5
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence