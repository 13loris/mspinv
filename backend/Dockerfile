# builder
FROM golang:1.21 AS builder
WORKDIR /src
COPY go.mod .
RUN go mod download || true
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /app/inventory ./cmd/server

# runtime
FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/inventory /inventory
EXPOSE 8080
ENTRYPOINT ["/inventory"]
