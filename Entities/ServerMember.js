{
  "name": "ServerMember",
  "type": "object",
  "properties": {
    "server_id": {
      "type": "string",
      "description": "ID of the server"
    },
    "user_id": {
      "type": "string",
      "description": "ID of the user"
    },
    "username": {
      "type": "string",
      "description": "Username for quick access"
    },
    "role": {
      "type": "string",
      "enum": [
        "owner",
        "admin",
        "member"
      ],
      "default": "member",
      "description": "User's role in the server"
    },
    "nickname": {
      "type": "string",
      "description": "Server-specific nickname"
    },
    "joined_at": {
      "type": "string",
      "format": "date-time",
      "description": "When the user joined"
    }
  },
  "required": [
    "server_id",
    "user_id"
  ]
}