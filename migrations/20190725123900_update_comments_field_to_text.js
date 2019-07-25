
exports.up = function(knex, Promise) {
  return knex.schema.table('activity_log', table => {
    table.text('comment').alter();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('activity_log', table => {
    table.string('comment').alter();
  });
};
