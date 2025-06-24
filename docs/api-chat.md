# FastAPI Chat Documentation

## POST /api/chat  ==> Create Chat
### Parameters
name:                                      description:
user_id * is a string(query)               user_id
tenant_name * is a string(query)           tenant_name

### Responses
Code: 200
Description: Successful Response
Media type: application/json
Example Value | Schema:
"3fa85f64-5717-4562-b3fc-2c963f66afa6"

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

## DELETE /api/chat  ==> Delete Chat
### Parameters
name:	                                 description:
chat_id * is a string($uuid) (query)     chat_id
tenant_name * is a string(query)         tenant_name
user_id * is a string(query)             user_id

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