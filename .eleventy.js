module.exports = (eleventyConfig) => {
  eleventyConfig.addPassthroughCopy({
    'public': '.'
  });

  eleventyConfig.addFilter('telephoneLink', (formattedTelNumber) => {
    const digitsOnly = formattedTelNumber.replace(/\D/g, '');
    return `tel:+1${digitsOnly}`;
  });
}
