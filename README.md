# koa-mustache
Mustache template rendering for Koa 2+

## Installation

`npm i --save @commander-lol/koa-mustache`

## Example

```js
const path = require('path')
const Koa = require('koa')
const mustache = require('@commander-lol/koa-mustache')

const app = new Koa()

const templatePath = path.join(__dirname, 'views')
app.use(mustache(templatePath))

// Respond to all requests with the template at `./views/index.mustache`
app.use(async ctx => {
  await ctx.render('index')
})

```

## Usage
- Require the module `const mustache = require('@commander-lol/koa-middleware')`
- Call the function to configure the middleware `const middleware = mustache(myTemplateDirectoryPath, myOpts)`
- Mount the middleware on your app `app.use(middleware)`
- The `ctx.render` function has been added to all subsequent middleware (including routes when using routers). 
`await` this function to render the specified params to the ctx body. If the template is not found, the status
will be set to 404. If the template path is not a regular file, the status will be set to 500. 

## Types

These are the types that you need to be aware of to use `koa-mustache`. The export of this module
(the object imported by `require('@commander-lol/koa-mustache')`) is of the type `ConfigureMiddleware`.

**Configuration Options**
```jsx
type Options = {
  debug(...args: any[]): void,
  useCache?: boolean,
  extension?: string,
  partials?: string,
}
```

**Module Export**
```jsx
type ConfigureMiddleware = (root: string, opts?: Options): KoaMiddleware
```

**Render Function**
```jsx
type RenderTemplate = (template: string, data: Object): Promise<void>
```

## Options

name | type | default | notes
-----|------|---------|------
debug|`Function`|noop|Will receive debug information. Typically printed with `console.log`, but could be sent elsewhere
useCache|`boolean`|if `NODE_ENV` is equal to `production`, true otherwise false|Will load templates on server boot, and exclusively use the in-memory cache for retrieving templates to render. Partials will always be loaded on boot
extension|`string`|`.mustache`|The file extension to use when loading templates (Must include leading dot)
partials|`string`|`partials`|The path, relative to the middleware root, where partials are located

