# Technical implementation

## Tech stack

The first implementation will be written in node, as this is where our team have skills. It is likely that it will make use of the express framework.

## Database

The database implementation will likely be mongodb, as its schemaless nature allows for flexibility of data structure. This is particularly relevant when considering the unknown form of records, and the ability to extend the data structures with plugins and extensions.

Postgres may also be considered as an option, with use of its `JSON` data types for flexible input data structures.

## Example implementation

_Note: the following code examples are purely illustrative of a possible API at this point._

An example (and very basic) workflow would be set up by defining the states through which a record can flow, and the possible transitions out of any given state.


```js
const TaskFlow = require('taskflow');

// create a new taskflow instance with the appropriate database configuration
const flow = new TaskFlow(/* database configuration options */);

// define the workflow states
flow.states({
  received: {
    next: ['inprogress', 'rejected']
  },
  inprogress: {
    next: ['complete', 'rejected']
  },
  complete: {},
  rejected: {}
});

flow.listen(8080, () => {
  // server is now listening
});
```

A set of default states might be defined, so that the state definition step could be omitted.

It would always be expected to be possible to move a record back to an earlier state.

### Hooks

Hooks would bind onto state transitions, either between two states, or into or out of a given state.

```js
// add a hook to the creation of a new record
flow.hook('create', () => { /* */ });

// add a hook to the transition between two states
flow.hook('state:recieved:inprogress', () => { /* */ });

// add a hook to the transition out of a state
flow.hook('state:received:*', () => { /* */ });

// add a hook to the transition into a state
flow.hook('state:*:rejected', () => { /* */ });

// add a hook to any state change
flow.hook('state:*', () => { /* */ });
```

Hooks could also be bound onto task completion, or to comments or attachments.

```js
// add a hook to the addition of a comment
flow.hook('comment', () => { /* */ });

// add a hook to the completion of any task
flow.hook('task', () => { /* */ });

// add a hook to the completion of a task with a particular name
flow.hook('task:*', () => { /* */ });

// add a hook to the creation of an attachment
flow.hook('attachment', () => { /* */ });
```

### Hook arguments

Hook functions would be called with two arguments.

* the metadata from the triggering event
* an object representing the record in question, with helper methods to perform actions on the record

Examples:

```js
const exampleEvent = {
  type: 'create|state|task|comment|attachment',
  user: {
    // the requesting user
  },
  data: {
    // metadata for the event
    // e.g. previous/new state, comment content, etc
  }
};

const exampleRecord = {
  // get the current record data
  data: () => {},
  // update the state of a record
  setState: () => {},
  // create a new task
  task: (task) => {},
  // update the record with new values
  update: (changes) => {},
  // add a comment
  comment: (content) => {},
  // attach a file
  attach: (file) => {}
};
```

It would be expected that hook functions return promises.

### Plugins

In this example, the "SLA" plugin might create a hook on the `create` event, which would set a "due date" property on the record:

```js
const SLA = require('taskflow-plugin-sla');

const sla = SLA({
  'create:complete': '7 days'
});

flow.plugin(sla);
```

Plugins should be able to extend the record object with their own helper methods to perform other tasks:

```js
// reset the timer on a record when it changes state
flow.hook('state:*', (event, record) => record.sla().reset());
```

Plugins should also be able to define new hook events:

```js
flow.hook('sla:expired', () => {
  // do something when a records hits its SLA time
});
```
