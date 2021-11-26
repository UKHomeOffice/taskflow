
exports.up = function(knex) {
  return knex.schema.table('activity_log', table => {
    table.index('case_id');
  });
};

exports.down = function(knex) {
  return knex.schema.table('activity_log', table => {
    table.dropIndex('case_id');
  });
};
