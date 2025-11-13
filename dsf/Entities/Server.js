{
  "name": "Message",
  "type": "object",
  "properties": {
    "channel_id": {
      "type": "string",
      "description": "ID of the channel"
    },
    "user_id": {
      "type": "string",
      "description": "ID of the user who sent the message"
    },
    "username": {
      "type": "string",
      "description": "Username of the sender"
    },
    "content": {
      "type": "string",
      "description": "Message content"
    },
    "attachments": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Array of attachment URLs"
    },
    "reply_to": {
      "type": "string",
      "description": "ID of message being replied to"
    }
  },
  "required": [
    "channel_id",
    "user_id",
    "content"
  ]
}