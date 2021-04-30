
exports.up = function(knex) {
  return knex.schema.table('cases', table => {
    table.string('assigned_to');
  });
};

exports.down = function(knex) {
  return knex.schema.table('cases', table => {
    table.dropColumn('assigned_to');
  });
};
