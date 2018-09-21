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

## Running tests

The tests are built to run against a real postgres database, so to run the unit tests you will need a databse running.

The default test configuration can be found in [./knexfile.js](./knexfile.js) and can be overwritten by setting environment variables (or configuring local variables in a `.env` file).
