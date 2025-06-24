# FastAPI Chat Documentation

## GET /api/chat/user_chats ==> Get User Chats

### Parameters

name: Description:
user_id _ is a string (query) user_id
tenant_name _ is a string (query) tenant_name
page_size integer (query) page_size
page_number integer (query) page_number

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
