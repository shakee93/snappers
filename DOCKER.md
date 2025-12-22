# Docker Setup

This project includes a Dockerfile for containerized deployment.

## Building the Docker Image

```bash
docker build -t gq-mobile .
```

## Running the Container

### Basic Run

```bash
docker run -p 3002:3002 gq-mobile
```

### With Environment Variables

```bash
docker run -p 3002:3002 \
  -e NEXT_PUBLIC_WP_GRAPHQL=https://api.gqmobiles.lk/graphql \
  -e NEXT_PUBLIC_TYPESENSE_HOST=api.gqmobiles.lk \
  -e NEXT_PUBLIC_TYPESENSE_PORT=80 \
  -e NEXT_PUBLIC_TYPESENSE_PROTOCOL=https \
  -e NEXT_PUBLIC_MERCHANT_ID=your_merchant_id \
  -e NEXT_PUBLIC_PAYHERE_IS_TESTING=false \
  gq-mobile
```

### Using Environment File

Create a `.env` file with your environment variables:

```env
NEXT_PUBLIC_WP_GRAPHQL=https://api.gqmobiles.lk/graphql
NEXT_PUBLIC_TYPESENSE_HOST=api.gqmobiles.lk
NEXT_PUBLIC_TYPESENSE_PORT=80
NEXT_PUBLIC_TYPESENSE_PATH=
NEXT_PUBLIC_TYPESENSE_PROTOCOL=https
NEXT_PUBLIC_MERCHANT_ID=your_merchant_id
NEXT_PUBLIC_PAYHERE_IS_TESTING=false
```

Then run:

```bash
docker run -p 3002:3002 --env-file .env gq-mobile
```

## Environment Variables

The following environment variables can be set (all have default placeholders):

- `NEXT_PUBLIC_WP_GRAPHQL` - WordPress GraphQL API endpoint
- `NEXT_PUBLIC_TYPESENSE_HOST` - Typesense server host
- `NEXT_PUBLIC_TYPESENSE_PORT` - Typesense server port
- `NEXT_PUBLIC_TYPESENSE_PATH` - Typesense server path (optional)
- `NEXT_PUBLIC_TYPESENSE_PROTOCOL` - Typesense protocol (http/https)
- `NEXT_PUBLIC_MERCHANT_ID` - PayHere merchant ID
- `NEXT_PUBLIC_PAYHERE_IS_TESTING` - PayHere testing mode (true/false)

## Port

The application exposes port **3002** by default.

## Notes

- The Dockerfile uses a multi-stage build for optimal image size
- The final image runs as a non-root user for security
- Next.js standalone output is used for minimal runtime dependencies

