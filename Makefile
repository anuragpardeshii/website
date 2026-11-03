SHELL := /bin/bash
.DEFAULT_GOAL := help
.PHONY: help install db dev up down logs build test migrate migration-status migration-new admin import-legacy
help:
	@printf '%s\n' 'make install       Install all projects' 'make db            Start local MongoDB replica set' 'make dev           Hot reload all apps locally; MongoDB in Docker' 'make up            Run all apps in Docker with Compose Watch' 'make down          Stop containers (preserve data)' 'make build         Build all frontends' 'make test          Test backend against isolated MongoDB database' 'make migrate       Apply pending versioned migrations' 'make migration-new NAME=profile_changes' 'make migration-status   Inspect migration history' 'make import-legacy Import preserved PostgreSQL records into empty MongoDB'
install:
	npm ci
	npm --prefix sleektech-site ci
db:
	docker compose up -d --wait mongo
dev: db
	npm run dev
up:
	docker compose up --build --watch
down:
	docker compose down
logs:
	docker compose logs --follow --tail=100
build:
	npm run build
	npm --prefix sleektech-site run build
test: db
	npm test
migrate: db
	npm run migrate
migration-status: db
	npm run migrate:status
migration-new:
	node scripts/new-migration.mjs "$(NAME)"
admin:
	npm run admin
import-legacy: db
	npm run import:legacy
