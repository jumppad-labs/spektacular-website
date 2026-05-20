.PHONY: serve build install

install:
	npm install

serve:
	hugo server

build:
	hugo --minify
