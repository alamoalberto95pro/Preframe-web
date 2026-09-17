/* Las guías de este idioma (roadmap 17). `lang` lo hereda del directory data
   del padre; aquí solo cambia el layout y se deriva la URL del slug
   (`guide`), que es el mismo en los dos idiomas. */
module.exports = {
  layout: 'layouts/article.njk',
  eleventyComputed: {
    permalink: (data) => {
      const prefix = data.site.languages[data.lang].prefix;
      return `${prefix}/guides/${data.guide}/index.html`;
    },
  },
};
