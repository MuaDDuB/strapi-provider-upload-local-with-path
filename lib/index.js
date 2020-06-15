"use strict";

/**
 * Module dependencies
 */

// Public node modules.
const fs = require("fs");
const path = require("path");

module.exports = {
  init({ sizeLimit = 1000000 } = {}) {
    const verifySize = (file) => {
      if (file.size > sizeLimit) {
        throw strapi.errors.badRequest("FileToBig", {
          errors: [
            {
              id: "Upload.status.sizeLimit",
              message: `${file.name} file is bigger than limit size!`,
              values: { file: file.name },
            },
          ],
        });
      }
    };

    const formatPath = (path) => {
      if (!path || path.length === 0 || path[path.length - 1] === "/") {
        return path;
      }

      return path + "/";
    };

    return {
      upload(file) {
        verifySize(file);

        return new Promise(async (resolve, reject) => {
          const parentPath = path.join(
            strapi.config.paths.static,
            `uploads`,
            file.path
          );

          if (!(await fs.existsSync(parentPath))) {
            await fs.mkdirSync(parentPath, { recursive: true });
          }

          const filePath = `/uploads/${formatPath(file.path)}${file.hash}${
            file.ext
          }`;
          // write file in public/assets folder
          fs.writeFile(
            path.join(strapi.config.paths.static, filePath),
            file.buffer,
            (err) => {
              if (err) {
                return reject(err);
              }
              file.url = filePath;

              resolve();
            }
          );
        });
      },
      delete(file) {
        return new Promise((resolve, reject) => {
          const filePath = path.join(strapi.config.paths.static, file.url);

          if (!fs.existsSync(filePath)) {
            return resolve("File doesn't exist");
          }

          // remove file from public/assets folder
          fs.unlink(filePath, (err) => {
            if (err) {
              return reject(err);
            }

            resolve();
          });
        });
      },
    };
  },
};
