
exports.up = function(knex, Promise) {
  return knex.schema
    .raw('create extension if not exists "uuid-ossp"')
    .dropTableIfExists('activity_log')
    .createTable('activity_log', table => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('case_id').references('id').inTable('cases').notNullable();
      table.uuid('changed_by');
      table.string('event_name').notNullable();
      table.jsonb('event').notNullable();
      table.string('comment');
      table.timestamps(false, true);
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('activity_log')
    .raw('drop extension if exists "uuid-ossp"');
};
