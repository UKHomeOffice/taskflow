
exports.up = function(knex, Promise) {
  return knex.schema.table('cases', table => table.jsonb('meta'));
};

exports.down = function(knex, Promise) {
  return knex.schema.table('cases', table => table.dropColumn('meta'));
};
