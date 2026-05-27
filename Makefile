.PHONY: install dev build preview check clean

install:
	npm install

dev:
	npm run dev

build:
	npm run build

preview: build
	npm run preview

check:
	npx astro check

clean:
	rm -rf dist .astro
