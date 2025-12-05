const { createStrapi } = require("@strapi/strapi");

let strapiInstance;

const getStrapi = async () => {
  if (!strapiInstance) {
    strapiInstance = await createStrapi({
      distDir: "./build",
      autoReload: false,
      serveAdminPanel: true,
    }).load();
    await strapiInstance.start();
  }
  return strapiInstance;
};

module.exports = async (req, res) => {
  try {
    const strapi = await getStrapi();
    await strapi.server.app.callback()(req, res);
  } catch (error) {
    console.error("Strapi error:", error);
    res.status(500).json({ error: error.message });
  }
};
