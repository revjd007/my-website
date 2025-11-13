{
  "name": "DirectMessage",
  "type": "object",
  "properties": {
    "sender_id": {
      "type": "string",
      "description": "ID of the message sender"
    },
    "receiver_id": {
      "type": "string",
      "description": "ID of the message receiver"
    },
    "sender_username": {
      "type": "string",
      "description": "Username of sender"
    },
    "content": {
      "type": "string",
      "description": "Message content"
    },
    "read": {
      "type": "boolean",
      "default": false,
      "description": "Whether the message has been read"
    },
    "attachments": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Array of attachment URLs"
    }
  },
  "required": [
    "sender_id",
    "receiver_id",
    "content"
  ]
}