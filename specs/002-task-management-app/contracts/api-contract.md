# API Contracts: Task Management Web Application

## Authentication Endpoints

### POST /api/auth/register
- **Description**: Register a new user
- **Request Body**:
  - email: string (required, valid email format)
  - password: string (required, min 8 chars with mixed case, numbers, special chars)
- **Response**:
  - 201: User created successfully
  - 400: Invalid input (email format, password requirements) - RFC 7807 format
  - 409: Email already exists - RFC 7807 format
- **Authentication**: None

### POST /api/auth/login
- **Description**: Login existing user
- **Request Body**:
  - email: string (required)
  - password: string (required)
- **Response**:
  - 200: Login successful, returns JWT token
  - 400: Invalid input - RFC 7807 format
  - 401: Invalid credentials - RFC 7807 format
  - 429: Too many failed attempts - RFC 7807 format
- **Authentication**: None

### POST /api/auth/logout
- **Description**: Logout current user
- **Request Body**: None
- **Response**:
  - 200: Logout successful
  - 401: Unauthorized - RFC 7807 format
- **Authentication**: JWT Bearer Token Required

## Task Management Endpoints

### GET /api/tasks
- **Description**: Get all tasks for current user
- **Query Parameters**:
  - status: string (optional, values: pending|completed|all, default: all)
- **Response**:
  - 200: Array of tasks
  - 401: Unauthorized - RFC 7807 format
- **Authentication**: JWT Bearer Token Required

### POST /api/tasks
- **Description**: Create a new task
- **Request Body**:
  - title: string (required, max 255 chars)
  - description: string (optional, max 2000 chars)
- **Response**:
  - 201: Task created successfully
  - 400: Invalid input - RFC 7807 format
  - 401: Unauthorized - RFC 7807 format
- **Authentication**: JWT Bearer Token Required

### GET /api/tasks/{id}
- **Description**: Get a specific task
- **Path Parameters**:
  - id: string (required, UUID format)
- **Response**:
  - 200: Task details
  - 401: Unauthorized - RFC 7807 format
  - 403: Access denied (not user's task) - RFC 7807 format
  - 404: Task not found - RFC 7807 format
- **Authentication**: JWT Bearer Token Required

### PUT /api/tasks/{id}
- **Description**: Update a task
- **Path Parameters**:
  - id: string (required, UUID format)
- **Request Body**:
  - title: string (required, max 255 chars)
  - description: string (optional, max 2000 chars)
- **Response**:
  - 200: Task updated successfully
  - 400: Invalid input - RFC 7807 format
  - 401: Unauthorized - RFC 7807 format
  - 403: Access denied (not user's task) - RFC 7807 format
  - 404: Task not found - RFC 7807 format
- **Authentication**: JWT Bearer Token Required

### DELETE /api/tasks/{id}
- **Description**: Delete a task
- **Path Parameters**:
  - id: string (required, UUID format)
- **Response**:
  - 200: Task deleted successfully
  - 401: Unauthorized - RFC 7807 format
  - 403: Access denied (not user's task) - RFC 7807 format
  - 404: Task not found - RFC 7807 format
- **Authentication**: JWT Bearer Token Required

### PATCH /api/tasks/{id}/complete
- **Description**: Toggle task completion status
- **Path Parameters**:
  - id: string (required, UUID format)
- **Request Body**:
  - completed: boolean (required)
- **Response**:
  - 200: Task status updated successfully
  - 400: Invalid input - RFC 7807 format
  - 401: Unauthorized - RFC 7807 format
  - 403: Access denied (not user's task) - RFC 7807 format
  - 404: Task not found - RFC 7807 format
- **Authentication**: JWT Bearer Token Required

## Error Response Format (RFC 7807)
All error responses follow the RFC 7807 Problem Details format:
- type: string (error type URI)
- title: string (short error description)
- status: integer (HTTP status code)
- detail: string (detailed error message)
- instance: string (request path)