# Firebase functions to simplify common CRUD operations

## Deploy these functions to Firebase:
(from this directory) <code>$ yarn deploy</code>

## Insert new pupil registration

This function is not Firebase trigger, it is intended for explicit invokation from external clients

POST http://us-central1-theta-1524876066401.cloudfunctions.net/api/pupil?secret=[secret]

<code>Content-Type: application/json</code>

<code>Body:</code>
```json
{
 "groupSymbol": "4eb",
 "name": "שוקי בנישתי",
 "pupilId": "013069488",
 "parentId": "013069480",
 "paymentApprovalNumber": "a1334vd",
 "phoneNumber": "0543307024",
 "whenRegistered": "07/07/2018"
}
```

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
	"name": "שוקי בנישתי",
 	"pupilId": "013069488",
 	"parentId": "013069480",
	"paymentApprovalNumber": "a1334vd",
	"phoneNumber": "0543307025",
	"whenRegistered": "06/07/2018"
}');

try {
  $response = $request->send();

  echo $response->getBody();
} catch (HttpException $ex) {
  echo $ex;
}
```

## Get all groups

GET http://us-central1-theta-1524876066401.cloudfunctions.net/api/groups

<code>Content-Type: application/json</code>

On success, returns HTTP 200 and JSON Array with follwoing structure:
```json
[
    {
        "unitId": "<FirebaseId for containing unit>",
        "id": "<FirebaseId for groups",
        "symbol": "<Groups symbol>",
        "opened": "<Data when group was opened>"
    },
]
```


Date format for all functions' input is 'DD/MM/YYYY'
