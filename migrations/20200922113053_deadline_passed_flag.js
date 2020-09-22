
exports.up = function(knex) {
  return knex.schema.table('cases', table => {
    table.boolean('deadline_passed').defaultTo(false);
    table.index('deadline_passed');
  });
};

exports.down = function(knex) {
  return knex.schema.table('cases', table => {
    table.dropColumn('deadline_passed');
  });
};
