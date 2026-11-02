.PHONY: dev build test docker
dev:
	npm run dev
build:
	node --check src/server.mjs
test:
	npm test
docker:
	$(MAKE) -C .. up
