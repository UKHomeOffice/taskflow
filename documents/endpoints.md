# Endpoints

The following endpoints would be implemented:

* `GET  /record(s)?`
* `POST /record(s)?`
* `GET  /record/:id`
* `PUT  /record/:id`
* `GET  /record/:id/task(s)?`
* `POST /record/:id/task(s)?`
* `GET  /record/:id/task/:id`
* `PUT  /record/:id/task/:id`

_Note: realistically it would be the case that the trailing `s` on `record(s)` and `task(s)` would always be optional. The base url (i.e. `/record(s)?` may also be configurable)_

Plugins may result in additional endpoints being created.
