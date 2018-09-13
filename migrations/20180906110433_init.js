
exports.up = function(knex) {
  return knex.schema
    .dropTableIfExists('cases')
    .createTable('cases', table => {
      table.uuid('id').primary();
      table.string('status');
      table.jsonb('data');
      table.timestamps(false, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('cases');
};
