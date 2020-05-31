# Error Handling in express.js

way to handle errors in express.js

## Validation Error

```curl
curl --location --request POST 'http://localhost:3000/api/user/registration' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'first_name=raja' \
--data-urlencode 'last_name=jaganathan' \
--data-urlencode 'password=pwd12345' \
--data-urlencode 're_password=differentPassword' \
--data-urlencode 'email=test@gmail.com'
```

```json
{
    "error": {
        "name": "ApplicationError",
        "type": "APP_NAME",
        "code": "VALIDATION_ERROR",
        "message": "Passwords must match",
        "errors": [
            {
                "name": "ValidationError",
                "value": "differentPassword",
                "path": "re_password",
                "type": "oneOf",
                "errors": [
                    "Passwords must match"
                ],
                "inner": [],
                "message": "Passwords must match",
                "params": {
                    "path": "re_password",
                    "value": "differentPassword",
                    "originalValue": "differentPassword",
                    "values": ", Ref(password)"
                }
            }
        ]
    },
    "success": false
}
```


## Custom Error Scenario


### AUTH_WEAK_PASSWORD


```curl
curl --location --request POST 'http://localhost:3000/api/user/registration' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'first_name=raja' \
--data-urlencode 'last_name=jaganathan' \
--data-urlencode 'password=qwerty1234' \
--data-urlencode 're_password=qwerty1234' \
--data-urlencode 'email=dummy@gmail.com' | python -mjson.tool
```

```json
{
    "error": {
        "name": "ApplicationError",
        "type": "APP_NAME",
        "code": "AUTH_WEAK_PASSWORD",
        "message": "The given password is easy to guess, provide strong password"
    },
    "success": false
}
```

#### EMAIL_ALREADY_TAKEN

```curl
curl --location --request POST 'http://localhost:3000/api/user/registration' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'first_name=raja' \
--data-urlencode 'last_name=jaganathan' \
--data-urlencode 'password=pwd12345' \
--data-urlencode 're_password=pwd12345' \
--data-urlencode 'email=dummy@gmail.com' | python -mjson.tool
```

```json
{
    "error": {
        "name": "ApplicationError",
        "type": "APP_NAME",
        "code": "EMAIL_ALREADY_TAKEN",
        "message": "The given email address is already taken :("
    },
    "success": false
}
```

### Success

```curl
curl --location --request POST 'http://localhost:3000/api/user/registration' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'first_name=raja' \
--data-urlencode 'last_name=jaganathan' \
--data-urlencode 'password=pwd12345' \
--data-urlencode 're_password=pwd12345' \
--data-urlencode 'email=test@gmail.com'
```

```json
{
    "data": {
        "message": "Registration is successful"
    },
    "success": true
}
```
