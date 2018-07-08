# Firebase functions to simplify common CRUD operations

## Deploy these functions to Firebase:
(from this directory) <code>$ yarn deploy</code>

## Insert new pupil registration

This function is not Firebase trigger, it is intended for explicit invokation from external clients

POST http://us-central1-theta-1524876066401.cloudfunctions.net/api/pupil?secret=[secret]

Content-Type: application/json

{

	"groupSymbol": "4eb",
	
	"name": "Tiago",
	
	"address": "כיכר המדינה"
	
	"whenRegistered": "07/07/2018"
	
}

On any aplication errors, response is returned with HTTP 200, header 'Content-Type': 'application/json' and JSON formatted payload:
```json
{
 "errorCode": "<number>",
 "errorMessage": "<string>"
}
```
On success invocations, response is JSON formatted as:
```json
{
 "id": "<string>"
}
```

PHP invocation sample:
```php
<?php

$request = new HttpRequest();
$request->setUrl('http://us-central1-theta-1524876066401.cloudfunctions.net/api/pupil');
$request->setMethod(HTTP_METH_POST);

$request->setQueryData(array(
  'secret' => 'xxx'
));

$request->setHeaders(array(
  'Cache-Control' => 'no-cache',
  'Content-Type' => 'application/json'
));

$request->setBody('{
	"groupSymbol": "4eb",
	"name": "Shuki Benishty 3",
	"address": "כיכר המדינה",
	"whenRegistered": "06/07/2018"
}');

try {
  $response = $request->send();

  echo $response->getBody();
} catch (HttpException $ex) {
  echo $ex;
}
```

Date format for all functions' input is 'DD/MM/YYYY'
