"use strict";

const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");
const { Readable } = require("stream");

// Convertir stream a buffer
const streamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
};

// Sanitizar nombre de archivo para Supabase Storage
const sanitizeFileName = (name) => {
  if (!name) return name;
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

const getKey = ({ directory, file }) => {
  const sanitizedName = sanitizeFileName(file.name);
  return `${directory}/${sanitizedName}-${file.hash}${file.ext}`.replace(/^\//g, "");
};

module.exports = {
  init: (config) => {
    const apiUrl = config.apiUrl;
    const apiKey = config.apiKey;
    const bucket = config.bucket || "strapi-uploads";
    const directory = (config.directory || "").replace(/(^\/)|(\/$)/g, "");
    const options = config.options || undefined;

    const supabase = createClient(apiUrl, apiKey, options);

    return {
      upload: (file, customParams = {}) =>
        new Promise((resolve, reject) => {
          file.hash = crypto.createHash("md5").update(file.hash).digest("hex");

          const key = getKey({ directory, file });

          supabase.storage
            .from(bucket)
            .upload(key, Buffer.from(file.buffer, "binary"), {
              cacheControl: "public, max-age=31536000, immutable",
              upsert: true,
              contentType: file.mime,
            })
            .then(({ data, error: error1 }) => {
              if (error1) {
                return reject(error1);
              }

              const { data: publicUrlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(key);

              // publicURL con mayúsculas en versiones antiguas del SDK
              const publicUrl = publicUrlData?.publicUrl || publicUrlData?.publicURL ||
                `${apiUrl}/storage/v1/object/public/${bucket}/${key}`;

              file.url = publicUrl;
              resolve();
            });
        }),

      uploadStream: (file, customParams = {}) =>
        new Promise(async (resolve, reject) => {
          try {
            file.hash = crypto.createHash("md5").update(file.hash).digest("hex");
            const key = getKey({ directory, file });

            // Convertir stream a buffer
            const buffer = await streamToBuffer(file.stream);

            const { data, error: error1 } = await supabase.storage
              .from(bucket)
              .upload(key, buffer, {
                cacheControl: "public, max-age=31536000, immutable",
                upsert: true,
                contentType: file.mime,
              });

            if (error1) return reject(error1);

            const { data: publicUrlData } = supabase.storage
              .from(bucket)
              .getPublicUrl(key);

            const publicUrl = publicUrlData?.publicUrl || publicUrlData?.publicURL ||
              `${apiUrl}/storage/v1/object/public/${bucket}/${key}`;

            file.url = publicUrl;
            resolve();
          } catch (error) {
            reject(error);
          }
        }),

      delete: (file, customParams = {}) =>
        new Promise((resolve, reject) => {
          supabase.storage
            .from(bucket)
            .remove([getKey({ directory, file })])
            .then(({ data, error }) => {
              if (error) return reject(error);
              resolve();
            });
        }),
    };
  },
};
