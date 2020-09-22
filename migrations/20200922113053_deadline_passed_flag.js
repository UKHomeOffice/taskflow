
exports.up = function(knex) {
  return knex.schema.table('cases', table => {
    table.boolean('deadline_passed').defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.table('cases', table => {
    table.dropColumn('deadline_passed');
  });
};
