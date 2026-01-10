# API Contracts: Todo Console App

## CLI Commands

### Add Task
```
Command: python main.py add -t <title> [-d <description>]
Input:
  -t, --title: Required string title for the task
  -d, --description: Optional string description for the task
Output: Success message with created task ID and title
Error: Error message to stderr if title is missing
```

### List Tasks
```
Command: python main.py list
Input: None
Output: List of all tasks with ID, status, title, and creation time
Error: "No tasks found" message if no tasks exist
```

### Complete Task
```
Command: python main.py done -i <id>
Input:
  -i, --id: Required integer ID of the task to complete
Output: Success message with completed task ID and title
Error: Error message to stderr if task ID doesn't exist
```

### Update Task
```
Command: python main.py update -i <id> [-t <title>] [-d <description>]
Input:
  -i, --id: Required integer ID of the task to update
  -t, --title: Optional string title to update
  -d, --description: Optional string description to update
Output: Success message with updated task ID and title
Error: Error message to stderr if task ID doesn't exist
```

### Delete Task
```
Command: python main.py delete -i <id>
Input:
  -i, --id: Required integer ID of the task to delete
Output: Success message with deleted task ID and title
Error: Error message to stderr if task ID doesn't exist
```