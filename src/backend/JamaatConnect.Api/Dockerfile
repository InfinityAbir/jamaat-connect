# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /source

# Copy csproj files and restore
COPY JamaatConnect.sln .
COPY src/backend/JamaatConnect.Domain/JamaatConnect.Domain.csproj ./src/backend/JamaatConnect.Domain/
COPY src/backend/JamaatConnect.Application/JamaatConnect.Application.csproj ./src/backend/JamaatConnect.Application/
COPY src/backend/JamaatConnect.Infrastructure/JamaatConnect.Infrastructure.csproj ./src/backend/JamaatConnect.Infrastructure/
COPY src/backend/JamaatConnect.Api/JamaatConnect.Api.csproj ./src/backend/JamaatConnect.Api/
RUN dotnet restore

# Copy source and build
COPY src/backend/ ./src/backend/
WORKDIR /source/src/backend/JamaatConnect.Api
RUN dotnet publish -c Release -o /app --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app

# Create non-root user
RUN addgroup -g 1000 -S appgroup && adduser -u 1000 -S appuser -G appgroup
USER appuser

COPY --from=build /app ./
EXPOSE 8080

ENTRYPOINT ["dotnet", "JamaatConnect.Api.dll"]