# taskflow

Proof of concept for workflow task management

## About

`taskflow` is a tool for building API services to facilitate the processing of data through task-based workflows.

It creates an express router with a set of endpoints for creating and managing "cases" as they move through a workflow process.

The processing of data objects is based on the concepts of statuses, tasks, and a set of hooks which can bind functionality onto status changes or task completion.

## Requirements

* An express app
* An authentication mechanism
* A postgres database

## Usage

In your express app:

```js
const authentication = require('./my-authentication-middleware');
const taskflow = require('taskflow');

app.use(authentication());
app.use(taskflow({ /* options */ }));
```

### Options

* `db` - database configuration settings
  * `host`
  * `port`
  * `user`
  * `password`
  * `database`

### Database setup

The required postgres schema can be generated in a database by calling the `migrate` method on an initialised `taskflow` instance:

```js
const taskflow = require('taskflow');
const flow = Taskflow({
  db: {
    user: 'postgres',
    database: 'my-new-db'
  }
});
flow.migrate()
  .then(() => {
    /* database is ready to go */
  });
```

Alternatively, the database schema can be migrated from the command line:

```
taskflow migrate [options]
```

Where the options are as defined above. e.g. `taskflow migrate --user postgres --database my-new-db`

## Hooks

Hooks are defined on a `taskflow` instance using the `hook` method.

Hooks should return promises, and are called _after_ the event is written to the database.

```js
const flow = taskflow();
flow
  .hook('create', () => {
    /* will be called when a new object is created */
  })
  .hook('status:new:old', () => {
    /* will be called when an object's status changes from "new" to "old" */
  })
  .hook('status:*:*', () => {
    /* will be called when an object's status is changed in any way */
  });
```

Hooks can also be set to be triggered _before_ a change is made, by prefixing the event name with `pre-`. This can be useful for performing validation on input data.

```js
const flow = taskflow();
flow
  .hook('pre-create', () => {
    /* will be called before a new object is created */
  })
  .hook('pre-status:new:old', () => {
    /* will be called when an object's status changes from "new" to "old" */
  })
  .hook('pre-status:*:*', () => {
    /* will be called when an object's status is changed in any way */
  });
```

### Events

The following events can have hooks applied:

* `create` - called when a case is created
* `update` - called when the data from a case is modified
* `status:<old>:<new>` - called when a case's status is modified

### Arguments

Hook functions are passed a single argument which contains event details and metadata, and has attached methods for performing actions on the case object.

The event object will always have the following properties:

* `id` - the id of the case object
* `event` - the event that triggered the current hook - e.g. `create`/`update`
* `meta` - any metadata related to the event - e.g. the user that triggered the event or any arguments passed to the event
* `status` - the current status of the case
* `data` - the full case data

#### Case mutation methods

The event object exposes the following methods:

* `setStatus(status)` - updates the status property of the case
* `update(data)` - updates the data of the case
* `patch(data)` - patches the data of the case
* `assign(user)` - assigns the case to the defined user

These methods are only available on post-event hooks, and attempting to call them on a pre-event hook will result in a warning.

Calling these methods will trigger events and related hooks, so care should be taken not to create infinite recursive loops of updating data or statuses.

If hooks cause updates to case statuses or data then any subsequent hooks will be called with the updated values.

#### Side-effects and downstream services

If a hook needs to perform a side-effect, such as calling an external service in response to a hook event, it is recommended to wait for the request to complete so that side-effects are only applied once the database transaction is resolved.

To do this you can wrap the side-effect in an `onSettled` call:

```js
flow.hook('update', event => {
  event.onSettled(() => {
    // this is only called once all updates are complete and the database transaction is commited
  });
});
```

#### Redirecting to another case

If you wan to prevent the creation of a new case, and instead refer the client to a pre-existing case, you can call `event.redirect(id | { id })` in a `pre-create` hook.

## Decorators

Decorator functions can be defined to add additional properties to cases at read time.

Decorators take the case object as an argument, and should return a modifed case with any custom properties applied.

To define a decorator function:

```js
const flow = taskflow();
flow
  .decorate(case => {
    return { ...case, customProperty: 'my custom property' };
  });
```

Decorator functions can be asynchronous, and should return promises (or be `async` functions).

```js
const flow = taskflow();
flow
  .decorate(case => {
    return Database.query()
      .then(result => {
        return { ...case, customProperty: result.propertyFromDatabase };
      });
  });
```

## Running tests

The tests are built to run against a real postgres database, so to run the unit tests you will need a databse running.

The default test configuration can be found in [./knexfile.js](./knexfile.js) and can be overwritten by setting environment variables (or configuring local variables in a `.env` file).
