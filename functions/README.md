# Firebase functions to wrap CRUD operaions Theta object model.

## Deploy these functions to Firebase:
(from this directory) <code>$ yarn deploy</code>

Insert new pupil registration

POST http://us-central1-theta-1524876066401.cloudfunctions.net/app/pupil

"Content-Type","application/json"
{
	"groupSymbol": "aaa",
	"name": "Oleg",
	"address": "כיכר המדינה"
}
