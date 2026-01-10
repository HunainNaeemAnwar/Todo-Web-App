# Data Model: Todo Console App

## Task Entity

### Attributes
- **id**: `int` - Auto-incrementing unique identifier
- **title**: `str` - Task name/title (required)
- **description**: `str` - Detailed information about the task (optional, can be empty)
- **completed**: `bool` - Task completion status (default: False)
- **created_at**: `datetime` - Timestamp of task creation

### Validation Rules
- `id` must be a positive integer
- `title` must be a non-empty string
- `completed` must be a boolean value
- `created_at` must be a valid datetime object

### State Transitions
- Task is created with `completed = False`
- Task can transition from `completed = False` to `completed = True` via completion operation
- Task state does not automatically revert from completed to incomplete

## Task Collection

### Structure
- **tasks**: `List[Task]` - In-memory storage using Python list
- Tasks are stored in the order they were created
- Each task ID is unique within the collection
- IDs are assigned sequentially starting from 1

### Operations
- Add new task to collection
- Find task by ID
- Update task by ID
- Remove task by ID
- List all tasks