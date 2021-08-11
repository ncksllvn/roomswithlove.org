# Minimal 11ty + Tailwind starter kit
This project is a starting point for an Eleventy + Tailwind project. It does not overinvest into a single technology or overly scaffold. It is designed for a dev to clone and then become productive with minimal overhead - without having to learn much about how the project is setup or to clean out sample files.

1. [Eleventy](https://www.11ty.dev/) static site generator
1. [TailwindCSS](https://tailwindcss.com/) utility-first CSS framework

Additionally, the project is setup to easily deploy to GitHub Pages. See the `deploy` task below.

Currently, there is no module bundler for packaging client-side JavaScript. At the moment, the idea is to leave it to the end-developer whether that is necessary for their project or not.

## Tasks
These are the primary tasks intended for devs to run, but there are additional tasks listed under `scripts` in the `package.json`.

```bash
# Build and output a development build of the website.
npm run build
```

``` bash
# Build and output the production-ready build of the website into the _site dir.
# The built CSS is pruned and minifed using Tailwind CLI.
# Important - Update or remove the "pathprefix` value in the package.json for this command.
# This is useful for deploying to GitHub Pages. For more info, see https://www.11ty.dev/docs/filters/url/.
build:production
```

```bash
# Run a production build of the website, then push the _site directory to the "gh-pages" branch.
# Running this task is intended to be a simple way to update your project on GitHub Pages.
deploy
```

```bash
# Starts the 11ty dev server in watch mode while also watching the Tailwind style directory for changes.
watch
```

## Considerations
- [ ] Add a JavaScript linter
- [ ] Minify HTML during production builds
