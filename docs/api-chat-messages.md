# FastAPI Chat Documentation

## GET /api/chat/messages ==> Get Chat Messages

### Parameters

name: description:
chat_id * is a string ($uuid) (query) chat_id
tenant_name * is a string (query) tenant_name
user_id * is a string (query) user_id
page_size? integer (query) page_size
page_number? integer (query) page_number

### Responses

Code: 200
Description: Successful Response
Media type: application/json
Example Value | Schema:
[
{}
]

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
