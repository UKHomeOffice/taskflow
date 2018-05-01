# Design overview

`taskflow` is an proposed API for handling task-based workflow processes. It will be a RESTful, json-over-http API.

## Workflows

Workflows are represented at a high-level by a series of states, through which a data entity (a record) will move, from initial receipt - for example, submission of a webform - to a "completed" state.

It is assumed that all workflows would have one or more "end states". Long-term administration of records in a CRM-type system is considered out of scope here.

### Tasks

Tasks represent a requirement for user input in order to process the record. They are the human touchpoints in the workflow, and will generally include (non-automatable) decision making processes and interactions with other systems and services.

### Hooks

Hooks provide an API for functionality to be bound to the activity on the record through the workflow. Functionality can be triggered in response to state change or the completion of a task.

Hooks would be defined as middleware-type functions, which are called with arguments representing the record, the current event metadata, and an API with which to perform actions on the record.

Hooks could also act as gatekeepers on events - i.e. as validators or permission checking - by enabling a mechanism by which they can return error states.

### Plugins and extensions

It would be expected that most workflows would be expressible as a series of tasks and hooks. However, it would be desirable to be able to express certain common patterns as reusable plugins. These would convert some basic configuration into a set of tasks and hooks.

For example, you might wish to define SLAs simply as a set of start/end points, and the accompanying SLA period rather than defining hooks directly.

Any implementation should provide a simple API for extending functionality.

## Comments and supporting documents

In addition to workflow transitions, it would be expected that users would be able to add comments and attachments to records at any stage of the process.

## Change logs and audit trails

It is expected that all records will have a fully inspectable changelog, and accompanying audit trail that shows all actions performed on the record.

## Authentication

It is expected that authentication would not be in scope for this module, but integrations for some common authentication services should be provided so that implementations can integrate with any authentication provider.

In the first instance, it is expected that a keycloak integration would be provided.

The management of user roles _might_ be included here, in particular to support authentication services which do not also provide management of user roles, or for cases where the user roles might not be directly translatable.

Alternatively, a user-management system might be implemented as a separate deliverable, which could be used as an authentication layer here.

## User interface

It is not expected that UI is in scope for this module. An extensible default UI will likely be provided as a separate module.
