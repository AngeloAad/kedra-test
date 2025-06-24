# FastAPI Chat Documentation

## GET /api/chat/stream  ==> Stream AI chat responses
### Parameters
No parameters
Request body(required):
{
  "user_id": "string",
  "tenant_name": "string",
  "chat_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "message": "string",
  "platform": "generic",
  "source": "string"
}

### Responses
Code: 200
Description: Successful Response
Media type: application/json
Example Value | Schema:
"string"

Code: 422
Description: Validation Error
Media type: application/json
Example Value | Schema:
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}