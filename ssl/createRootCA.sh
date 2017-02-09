#!/usr/bin/env bash

read -p "Enter your file name [HiipackCA]: " CA_NAME

DEFAULT_CA_NAME="HiipackCA"
CA_NAME=${CA_NAME:-$DEFAULT_CA_NAME}

echo "Create the Root Key ..."
openssl genrsa -out ./root/$CA_NAME.key 2048

echo "self-sign this certificate ..."
# SUBJECT="/C=CN/ST=BeiJing/L=HaiDian/O=$CA_NAME/OU=MASTER/CN=$CA_NAME/emailAddress=zdying@live.com"
# openssl req -x509 -new -subj $SUBJECT -nodes -key ./root/$CA_NAME.key -sha256 -days 3650 -out ./root/$CA_NAME.pem
openssl req -x509 -new -nodes -key ./root/$CA_NAME.key -sha256 -days 3650 -out ./root/$CA_NAME.pem