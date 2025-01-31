#!/usr/bin/make -f

include .env

BINDIR ?= $(GOPATH)/bin
ETHERMINT_BINARY = ethermintd
ETHERMINT_DIR = ethermint

# Default version if not provided in .env
KMS_DEV_VERSION ?= v0.7.1
export GO111MODULE = on

CURRENT_FOLDER := $(shell pwd)
KEYS_FULL_PATH := $(CURRENT_FOLDER)/res/keys
NETWORK_KEYS_PUBLIC_PATH := $(CURRENT_FOLDER)/network-fhe-keys
NETWORK_KEYS_PRIVATE_PATH := $(CURRENT_FOLDER)/kms-fhe-keys
DOCKER_IMAGE := ghcr.io/zama-ai/kms-service-dev:$(KMS_DEV_VERSION)

ENV_EXEC := contracts/core/lib/.env.exec
ENV_GATEWAY := contracts/core/gateway/lib/.env.gateway
ENV_ROOT := .env
ENV_DOCKER := docker/.env.docker
COMPOSE_TEMPLATE := docker/docker-compose-full.yml.template
COMPOSE_OUTPUT := docker/docker-compose-full.yml

MANDATORY_KEYS_LIST := \
  PUB/ServerKey/408d8cbaa51dece7f782fe04ba0b1c1d017b1088 \
  PRIV/FhePrivateKey/408d8cbaa51dece7f782fe04ba0b1c1d017b1088 \
  PUB/PublicKey/408d8cbaa51dece7f782fe04ba0b1c1d017b1088

.PHONY: pull-kms-service extract-keys validate-keys copy-keys \
        build-env-docker finalize-docker-compose generate-fhe-keys \
        run-full fund-addresses

pull-kms-service:
	@if [ $$(id -u) -eq 0 ]; then \
	  echo "Please do not run this Makefile as root or sudo."; \
	  exit 1; \
	fi
	@echo "[1/6] Pulling KMS Docker image $(DOCKER_IMAGE)..."
	@docker pull $(DOCKER_IMAGE) 1>/dev/null

extract-keys: pull-kms-service
	@echo "[2/6] Extracting keys from Docker image..."
	@mkdir -p $(KEYS_FULL_PATH)
	@docker create --name temp-container $(DOCKER_IMAGE) 1>/dev/null
	@docker cp temp-container:/app/kms/core/service/keys $(CURRENT_FOLDER)/res
	@docker rm temp-container 1>/dev/null

validate-keys: extract-keys
	@echo "[3/6] Validating required keys..."
	@set -e; \
	for key in $(MANDATORY_KEYS_LIST); do \
	  if [ ! -f "$(KEYS_FULL_PATH)/$$key" ]; then \
	    echo "ERROR: Missing key: $$key in $(KEYS_FULL_PATH)."; \
	    exit 1; \
	  fi; \
	done

copy-keys: validate-keys
	@echo "[4/6] Copying keys to local directories..."
	@mkdir -p $(NETWORK_KEYS_PUBLIC_PATH) $(NETWORK_KEYS_PRIVATE_PATH)
	@cp $(KEYS_FULL_PATH)/PUB/ServerKey/408d8cbaa51dece7f782fe04ba0b1c1d017b1088 \
	    $(NETWORK_KEYS_PUBLIC_PATH)/sks
	@cp $(KEYS_FULL_PATH)/PUB/PublicKey/408d8cbaa51dece7f782fe04ba0b1c1d017b1088 \
	    $(NETWORK_KEYS_PUBLIC_PATH)/pks
	@cp $(KEYS_FULL_PATH)/PRIV/FhePrivateKey/408d8cbaa51dece7f782fe04ba0b1c1d017b1088 \
	    $(NETWORK_KEYS_PRIVATE_PATH)/cks

build-env-docker: copy-keys
	@echo "[5/6] Building docker/.env.docker file..."
	@( \
	  if [ ! -f "$(ENV_DOCKER)" ]; then \
	    touch "$(ENV_DOCKER)"; \
	  fi; \
	  for f in $(ENV_EXEC) $(ENV_GATEWAY) $(ENV_ROOT); do \
	    if [ ! -f "$$f" ]; then \
	      echo "ERROR: Missing $$f"; \
	      exit 1; \
	    fi; \
	  done; \
	  FHEVM_COPROCESSOR_ADDRESS=$$(grep "^FHEVM_COPROCESSOR_ADDRESS=" "$(ENV_EXEC)" \
	    | cut -d'=' -f2); \
	  GATEWAY_CONTRACT_PREDEPLOY_ADDRESS=$$(grep "^GATEWAY_CONTRACT_PREDEPLOY_ADDRESS=" "$(ENV_GATEWAY)" \
	    | cut -d'=' -f2); \
	  GATEWAY_CONTRACT_PREDEPLOY_ADDRESS_NO0X=$${GATEWAY_CONTRACT_PREDEPLOY_ADDRESS#0x}; \
	  PRIVATE_KEY_GATEWAY_RELAYER=7ae52cf0d3011ef7fecbe22d9537aeda1a9e42a0596e8def5d49970eb59e7a40; \
	  echo "TFHE_EXECUTOR_CONTRACT_ADDRESS=$$FHEVM_COPROCESSOR_ADDRESS"        >  $(ENV_DOCKER); \
	  echo "GATEWAY_CONTRACT_PREDEPLOY_ADDRESS=$$GATEWAY_CONTRACT_PREDEPLOY_ADDRESS_NO0X" >> $(ENV_DOCKER); \
	  echo "PRIVATE_KEY_GATEWAY_RELAYER=$$PRIVATE_KEY_GATEWAY_RELAYER"                    >> $(ENV_DOCKER); \
	)

finalize-docker-compose: build-env-docker
	@echo "[6/6] Generating docker-compose-full.yml from template..."
	@cp $(COMPOSE_TEMPLATE) $(COMPOSE_OUTPUT)
	@set -e; \
	while IFS= read -r line; do \
	  case $$line in \
	    ''|\#*) continue ;; \
	  esac; \
	  key=$$(echo "$$line" | cut -d= -f1); \
	  val=$$(echo "$$line" | cut -d= -f2-); \
	  key=$$(echo "$$key" | xargs); \
	  val=$$(echo "$$val" | xargs); \
	  val_escaped=$$(printf '%s\n' "$$val" | sed -e 's/[\/&]/\\&/g'); \
	  sed -i.bak "s|\$${$${key}}|$$val_escaped|g" "$(COMPOSE_OUTPUT)"; \
	done < "$(ENV_DOCKER)"
	@rm -f "$(COMPOSE_OUTPUT).bak"

generate-fhe-keys: finalize-docker-compose
	@echo "All FHE keys are successfully generated and environment is ready."

run-full:
	@$(MAKE) generate-fhe-keys
	@echo "Starting containers..."
	@docker compose --env-file docker/.env.docker -f docker/docker-compose-full.yml up --detach
	@echo "Containers are starting... please wait a moment."
	@rm -rf $(CURRENT_FOLDER)/res
	@sleep 5
	@echo "Containers should now be running."

stop-full:
	@docker compose --env-file docker/.env.docker -f docker/docker-compose-full.yml down
	@rm -rf $(NETWORK_KEYS_PUBLIC_PATH) $(NETWORK_KEYS_PRIVATE_PATH) $(CURRENT_FOLDER)/docker/docker-compose-full.yml $(CURRENT_FOLDER)/docker/.env.docker
