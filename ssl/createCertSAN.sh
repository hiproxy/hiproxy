read -p "Enter your CA name [HiipackCA]:      " CA_NAME
read -p "Enter your domain [www.example.com]: " DOMAIN

DEFAULT_CA_NAME="HiipackCA"
CA_NAME=${CA_NAME:-$DEFAULT_CA_NAME}

DEFAULT_DOMAIN="www.example.com"
DOMAIN=${DOMAIN:-$DEFAULT_DOMAIN}

echo "Create A Certificate ..."
openssl genrsa -out ./cert/$DOMAIN.key 2048

echo "generate the certificate signing request ..."
openssl req -new -key ./cert/$DOMAIN.key -out ./cert/$DOMAIN.csr -config ./create-cert.cnf

openssl req -noout -text -in ./cert/$DOMAIN.csr

echo "sign the CSR, which requires the CA root key ..."
openssl x509 -req -in ./cert/$DOMAIN.csr -CA ./root/$CA_NAME.pem -CAkey ./root/$CA_NAME.key \
-CAcreateserial -out ./cert/$DOMAIN.crt -days 3650 -sha256 \
-extensions v3_req -extfile ./create-cert.cnf