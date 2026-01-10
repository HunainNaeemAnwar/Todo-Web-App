# Quickstart Guide: Todo Console App

## Prerequisites
- Python 3.8 or higher
- No external dependencies required

## Setup
Make the todo script executable:
```bash
chmod +x todo
```

## Running the Application
```bash
./todo --help
```

## Basic Usage

### Add a Task
```bash
./todo add -t "Buy milk" -d "2 liters"
```
**Output:** `Task added: [ID:1] Buy milk (Pending)`

### List All Tasks
```bash
./todo list
```
**Output:**
```
1. [ ] Buy milk | Created: 2025-12-30
   Description: 2 liters
```

### Complete a Task
```bash
./todo done -i 1
```
**Output:** `Task completed: [ID:1] Buy milk`

### Update a Task
```bash
./todo update -i 1 -t "New title" -d "New details"
```
**Output:** `Task updated: [ID:1] New title`

### Delete a Task
```bash
./todo delete -i 1
```
**Output:** `Task deleted: [ID:1] New title`

## Project Structure
```
src/
├── main.py              # Application entry point
├── models/
│   └── task.py          # Task data model with type hints
├── services/
│   └── task_service.py  # Business logic for task operations
└── cli/
    └── cli_app.py       # CLI interface using argparse
```

## Development
1. Make changes to the appropriate module (models, services, or CLI)
2. Run the application to test changes
3. All functions include type hints for better code clarity