# OpenAPI Contract for MCP Tools: AI Chatbot for Todo Management

This document defines the contract for the MCP (Model Context Protocol) tools that will be exposed by the backend to the OpenAI agent for todo management operations.

## Tools

### add_task

**Description**: Adds a new task to the user's task list.

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "The ID of the user adding the task"
    },
    "title": {
      "type": "string",
      "description": "The title of the task"
    },
    "description": {
      "type": "string",
      "description": "Optional description of the task"
    }
  },
  "required": ["user_id", "title"]
}
```

**Response**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "integer",
      "description": "The ID of the created task"
    },
    "status": {
      "type": "string",
      "enum": ["pending", "completed"],
      "description": "The status of the task"
    },
    "title": {
      "type": "string",
      "description": "The title of the task"
    }
  },
  "required": ["task_id", "status", "title"]
}
```

### list_tasks

**Description**: Lists tasks for the user based on the specified status.

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "The ID of the user whose tasks to list"
    },
    "status": {
      "type": "string",
      "enum": ["all", "pending", "completed"],
      "description": "The status of tasks to list (default is 'all')"
    }
  },
  "required": ["user_id"]
}
```

**Response**:
```json
{
  "type": "object",
  "properties": {
    "tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "task_id": {
            "type": "integer",
            "description": "The ID of the task"
          },
          "title": {
            "type": "string",
            "description": "The title of the task"
          },
          "description": {
            "type": "string",
            "description": "The description of the task"
          },
          "status": {
            "type": "string",
            "enum": ["pending", "completed"],
            "description": "The status of the task"
          }
        },
        "required": ["task_id", "title", "status"]
      }
    }
  },
  "required": ["tasks"]
}
```

### complete_task

**Description**: Marks a task as completed.

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "The ID of the user whose task to complete"
    },
    "task_id": {
      "type": "integer",
      "description": "The ID of the task to complete"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Response**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "integer",
      "description": "The ID of the completed task"
    },
    "status": {
      "type": "string",
      "enum": ["pending", "completed"],
      "description": "The new status of the task"
    },
    "title": {
      "type": "string",
      "description": "The title of the task"
    }
  },
  "required": ["task_id", "status", "title"]
}
```

### delete_task

**Description**: Deletes a task from the user's task list.

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "The ID of the user whose task to delete"
    },
    "task_id": {
      "type": "integer",
      "description": "The ID of the task to delete"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Response**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "integer",
      "description": "The ID of the deleted task"
    },
    "status": {
      "type": "string",
      "enum": ["pending", "completed"],
      "description": "The status of the deleted task"
    },
    "title": {
      "type": "string",
      "description": "The title of the task"
    }
  },
  "required": ["task_id", "status", "title"]
}
```

### update_task

**Description**: Updates an existing task's title and/or description.

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "The ID of the user whose task to update"
    },
    "task_id": {
      "type": "integer",
      "description": "The ID of the task to update"
    },
    "title": {
      "type": "string",
      "description": "Optional new title for the task"
    },
    "description": {
      "type": "string",
      "description": "Optional new description for the task"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Response**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "integer",
      "description": "The ID of the updated task"
    },
    "status": {
      "type": "string",
      "enum": ["pending", "completed"],
      "description": "The status of the task"
    },
    "title": {
      "type": "string",
      "description": "The new title of the task"
    }
  },
  "required": ["task_id", "status", "title"]
}
```

## Error Responses

All MCP tools follow this error response format:

```json
{
  "type": "object",
  "properties": {
    "error": {
      "type": "string",
      "description": "Description of the error that occurred"
    }
  },
  "required": ["error"]
}
```