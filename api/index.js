const strapi = require("@strapi/strapi");

module.exports = async (req, res) => {
  const app = await strapi.createServer().initialize();
  return app.server.handle(req, res);
};
