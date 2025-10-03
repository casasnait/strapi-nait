'use strict';

/**
 * Script para crear automáticamente un usuario admin en desarrollo local
 * Credenciales por defecto:
 * Email: gerardopaginanait@gmail.com
 * Password: Casas25!
 */

async function createDefaultAdmin() {
  const params = {
    username: 'gerardo',
    email: 'gerardopaginanait@gmail.com',
    firstname: 'Gerardo',
    lastname: 'Admin',
    password: 'Casas25!',
    blocked: false,
    isActive: true,
  };

  try {
    // Verificar si ya existe un admin
    const admins = await strapi.query('admin::user').findMany();

    if (admins.length === 0) {
      console.log('⚙️  Creando usuario admin por defecto...');

      // Crear el usuario admin
      const admin = await strapi.service('admin::user').create({
        ...params,
      });

      // Asignar rol de Super Admin
      const superAdminRole = await strapi.query('admin::role').findOne({
        where: { code: 'strapi-super-admin' },
      });

      if (superAdminRole) {
        await strapi.query('admin::user').update({
          where: { id: admin.id },
          data: { roles: [superAdminRole.id] },
        });
      }

      console.log('✅ Usuario admin creado exitosamente');
      console.log('📧 Email: gerardopaginanait@gmail.com');
      console.log('🔑 Password: Casas25!');
    }
  } catch (error) {
    console.error('Error al crear usuario admin:', error);
  }
}

module.exports = createDefaultAdmin;
