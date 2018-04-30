# Design overview

`taskflow` is an proposed API for handling task-based workflow processes. It will be a RESTful, json-over-http API.

## Workflows

Workflows are represented at a high-level by a series of states, through which a data entity (a record) will move, from initial receipt - for example, submission of a webform - to a "completed" state.

### Tasks

Tasks represent a requirement for user input in order to process the record. They are the human touchpoints in the workflow, and will generally include (non-automatable) decision making processes and interactions with other systems and services.

### Hooks

Hooks provide an API for functionality to be bound to the activity on the record through the workflow. Functionality can be triggered in response to state change or the completion of a task.

Hooks would be defined as middleware-type functions, which are called with arguments representing the record, the current event metadata, and an API with which to perform actions on the record.

Hooks could also act as gatekeepers on events - i.e. as validators - by enabling a mechanism by which they can return error states.

## Comments and supporting documents

In addition to workflow transitions, it would be expected that users would be able to add comments and attachments to records at any stage of the process.

## Authentication

It is expected that authentication would not be in scope for this module, but integrations for some common authentication services should be provided so that implementations can integrate with any authentication provider.

In the first instance, it is expected that a keycloak integration would be provided.

## User interface

It is not expected that UI is in scope for this module. An extensible default UI will likely be provided as a separate module.
