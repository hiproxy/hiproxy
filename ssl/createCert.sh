read -p "Enter your CA name [rootCA]:         " CA_NAME
read -p "Enter your domain [www.example.com]: " DOMAIN

DEFAULT_CA_NAME="rootCA"
CA_NAME=${CA_NAME:-$DEFAULT_CA_NAME}

DEFAULT_DOMAIN="www.example.com"
DOMAIN=${DOMAIN:-$DEFAULT_DOMAIN}

echo "Create A Certificate ..."
openssl genrsa -out ./cert/$DOMAIN.key 2048

echo "generate the certificate signing request ..."
#SUBJECT="/C=CN/ST=BeiJing/L=/O=hiipack/OU=DEV/CN=hiipack/emailAddress=zdying@live.com"
openssl req -new -key ./cert/$DOMAIN.key -out ./cert/$DOMAIN.csr

echo "sign the CSR, which requires the CA root key ..."
openssl x509 -req -in ./cert/$DOMAIN.csr -CA ./cert/$CA_NAME.pem -CAkey ./cert/$CA_NAME.key -CAcreateserial -out ./cert/$DOMAIN.crt -days 500 -sha256