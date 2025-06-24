# FastAPI Chat Documentation

## PUT /api/chat/rename ==> Rename Chat

### Parameters

name: description:
chat_id _ is a string ($uuid) (query) chat_id
tenant_name _ is a string (query) tenant_name
user_id \* is a string (query) user_id
new_name is a string (query) new_name

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
