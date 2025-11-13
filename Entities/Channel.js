{
  "name": "Channel",
  "type": "object",
  "properties": {
    "server_id": {
      "type": "string",
      "description": "ID of the server this channel belongs to"
    },
    "name": {
      "type": "string",
      "description": "Channel name"
    },
    "description": {
      "type": "string",
      "description": "Channel description"
    },
    "type": {
      "type": "string",
      "enum": [
        "text",
        "voice",
        "video"
      ],
      "default": "text",
      "description": "Type of channel"
    },
    "position": {
      "type": "number",
      "default": 0,
      "description": "Order position in the channel list"
    }
  },
  "required": [
    "server_id",
    "name"
  ]
}