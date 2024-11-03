.DEFAULT_GOAL := run

NPM := npm
TWISTD_PORT := 9001
TWISTD_HOST := 0.0.0.0

# Targets
install: ## run npm install to install dependencies
	@echo "Installing all dependencies..."
	$(NPM) install

run: ## run dev server
	@echo "Starting the development server..."
	$(NPM) start

prod: clean build ## same as build

build: ## build prod files in dist folder
	@echo "Building the project for production..."
	$(NPM) run build

deps: ## install dependences
	$(NPM) install monaco-editor --save
	$(NPM) install webpack webpack-cli monaco-editor-webpack-plugin style-loader css-loader webpack-dev-server babel-loader @babel/core @babel/preset-env html-webpack-plugin terser-webpack-plugin --save-dev

clean: ## clean
	@echo "Cleaning the dist directory..."
	rm -rf dist

all: clean build twistd ## clean + build + twistd on http://$(TWISTD_HOST):$(TWISTD_PORT)

reinstall: clean install ## clean + build

twistd: ## run twistd on http://$(TWISTD_HOST):$(TWISTD_PORT)
	twistd -n web --path ./dist --port tcp:$(TWISTD_PORT):interface=$(TWISTD_HOST) --display-tracebacks

esm: ## ESM build
	node node_modules/webpack/bin/webpack.js --progress

cf: ## create cloudflare zip in dist
	rm -rf dist/cf-dist.zip && (cd dist && zip --exclude .DS_Store -r cf-dist.zip ./)

deploy: cf
	rsync -arhv dist/ arh:/var/www/html/tools/monaco/
	rsync -arhv dist/ lbn:/var/www/html/tools/monaco/

help: ## show available targets
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} { \
		if (/^[a-zA-Z_-]+:.*?##.*$$/) {printf "    \033[1;37m%-20s\033[1;32m%s\033[0m\n", $$1, $$2} \
		else if (/^## .*$$/) {printf "  \033[1;36m%s\033[0m\n", substr($$1,4)} \
		}' $(MAKEFILE_LIST)

# .PHONY: install start build clean reinstall
