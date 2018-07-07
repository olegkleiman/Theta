# Firebase functions to wrap common CRUD operations

## Deploy these functions to Firebase:
(from this directory) <code>$ yarn deploy</code>

## Insert new pupil registration

This function is not Firebase trigger, it is intended for explicit invokation from external clients

POST http://us-central1-theta-1524876066401.cloudfunctions.net/api/pupil

Content-Type: application/json

{

	"groupSymbol": "aaa",
	
	"name": "Fabio",
	
	"address": "כיכר המדינה"
	
}

Content-Type: application/x-www-form-urlencoded is also accepted
