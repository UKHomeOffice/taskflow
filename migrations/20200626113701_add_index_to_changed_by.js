
exports.up = function(knex) {
  return knex.schema.table('activity_log', table => {
    table.index('changed_by');
  });
};

exports.down = function(knex) {
  return knex.schema.table('activity_log', table => {
    table.dropIndex('changed_by');
  });
};
