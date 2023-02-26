'use strict';

const pug = require('pug');
const inlineCss = require('inline-css');

const signup = pug.compileFile(`${__dirname}/templates/signup.pug`);

const emails = {
  signup,
};

async function generate(name, data) {
  if (!typeof emails[name] === 'function') {
    throw new Error(`Email ${name} does not exist`);
  }
  const html = emails[name](data);
  const inlineCessHtml = await inlineCss(html, {
    url: __dirname,
  });
  return inlineCessHtml;
}

module.exports = {
  generate,
};
