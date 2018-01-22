const path = require('path')
const fs = require('fs-jetpack')
const Mustache = require('mustache')

function createPathsFromContext(context = '', filename) {
	const { name } = path.parse(filename)
	return [
		path.join(context, filename),
		path.join(context, name),
	]
}

function createFileMap(dir, root, ext, debug) {
	const cache = {}
	const tree = dir.inspectTree(root)
	if (tree.type !== 'dir') {
		throw new TypeError(`[koa-mustache] viewDir must be an actual directory, found ${ tree.type }`)
	}

	const processing = tree.children
	while (processing.length > 0) {
		const current = processing.shift()

		if (current.type === 'dir') {
			for (const child of current.children) {
				child.context = current.context ? path.join(current.context, current.name) : current.name
				processing.push(child)
			}
		} else if (current.type === 'file') {
			if (path.extname(current.name) === ext) {
				const [pathWithExt, pathWithoutExt] = createPathsFromContext(current.context, current.name)
				const content = dir.read(dir.path(root, pathWithExt), 'utf8')

				debug(`[koa-mustache] Loading file ${ pathWithExt }`)

				Mustache.parse(content)
				cache[pathWithExt] = content
				cache[pathWithoutExt] = content
			}
		}
	}
	return cache
}

module.exports = function createMustacheMiddleware(viewDir, opts = {}) {
	const useCache = opts.hasOwnProperty('cache') ? opts.cache : process.env.NODE_ENV === 'production'
	const extension = opts.hasOwnProperty('extension') ? opts.extension : '.mustache'
	const partialDir = opts.hasOwnProperty('partials') ? opts.partials : 'partials'
	const debug = opts.debug || (() => {}) // eslint-disable-line no-empty-function

	const viewRoot = fs.cwd(viewDir)

	const cache = useCache ? createFileMap(viewRoot, '.', extension, debug) : {}
	const partials = createFileMap(viewRoot, partialDir, extension, debug)

	return function attachRenderFunc(ctx, next) {
		ctx.render = async function renderTemplateData(template, data = {}) {
			if (useCache) {
				const templateContent = cache[template]
				if (templateContent == null) {
					this.status = 404
				} else {
					this.status = 200
					this.body = Mustache.render(templateContent, data, partials)
				}
			} else {
				let fileData = await viewRoot.inspectAsync(template)
				if (fileData == null) {
					template += extension
					fileData = await viewRoot.inspectAsync(template)
					if (fileData == null) {
						this.status = 404
						return
					}
				}

				if (fileData.type === 'file') {
					const contents = await viewRoot.readAsync(template, 'utf8')
					this.status = 200
					this.body = Mustache.render(contents, data, partials)
				} else {
					this.status = 500
				}
			}
		}.bind(ctx)

		return next()
	}
}
