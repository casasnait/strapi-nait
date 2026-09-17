'use strict';

/**
 * Renombra los valores viejos de los enums de Property Card para que coincidan
 * con las nuevas opciones definidas en el schema (solicitud del cliente).
 * Strapi la ejecuta automáticamente al arrancar, una sola vez.
 */

const TABLE = 'property_cards';

const RENAMES = {
  tipo: {
    Depa: 'Departamento',
  },
  propiedad: {
    Ilustre: 'Casa Ilustre',
    Araiza: 'Casa Araiza',
    Alhaja: 'Casa Alhaja',
    Zentra: 'Zentral',
    'Nueve Esquinas': 'Casa 9 Esquinas',
  },
};

module.exports = {
  async up(knex) {
    if (!(await knex.schema.hasTable(TABLE))) return;

    for (const [column, mapping] of Object.entries(RENAMES)) {
      for (const [oldValue, newValue] of Object.entries(mapping)) {
        await knex(TABLE).where(column, oldValue).update({ [column]: newValue });
      }
    }
  },

  async down(knex) {
    if (!(await knex.schema.hasTable(TABLE))) return;

    for (const [column, mapping] of Object.entries(RENAMES)) {
      for (const [oldValue, newValue] of Object.entries(mapping)) {
        await knex(TABLE).where(column, newValue).update({ [column]: oldValue });
      }
    }
  },
};
