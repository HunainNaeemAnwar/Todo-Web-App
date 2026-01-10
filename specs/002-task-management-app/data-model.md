# Data Model: Task Management Web Application

## User Entity
- **id**: UUID (Primary Key)
- **email**: String (max 255, unique, required)
- **hashed_password**: String (max 255, required)
- **created_at**: DateTime (required, default: now)
- **updated_at**: DateTime (required, default: now)
- **is_active**: Boolean (default: true)

## Task Entity
- **id**: UUID (Primary Key)
- **user_id**: UUID (Foreign Key to User, required)
- **title**: String (max 255, required)
- **description**: String (max 2000, optional)
- **completed**: Boolean (default: false)
- **created_at**: DateTime (required, default: now)
- **updated_at**: DateTime (required, default: now)

## Validation Rules
- User email must be valid email format
- User password must be at least 8 characters with mixed case, numbers, and special characters
- Task title must not be empty
- Task title must be max 255 characters
- Task description must be max 2000 characters

## Relationships
- User (1) -> (Many) Task (user_id foreign key)

## Indexes
- users.email (unique)
- tasks.user_id (foreign key index)
- tasks.completed (for filtering)