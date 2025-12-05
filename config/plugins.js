const path = require('path');

module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: path.join(__dirname, '..', 'src', 'providers', 'upload-supabase'),
      providerOptions: {
        apiUrl: env('SUPABASE_API_URL'),
        apiKey: env('SUPABASE_API_KEY'),
        bucket: env('SUPABASE_BUCKET'),
        directory: env('SUPABASE_DIRECTORY', ''),
        options: {},
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
