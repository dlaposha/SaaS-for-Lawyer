echo "Setting up Lawyer CRM environment..."

# Install Docker and Docker Compose if not installed
if ! command -v docker &> /dev/null
then
    echo "Docker could not be found. Installing Docker..."
    sudo apt-get update
    sudo apt-get install -y docker.io
fi

if ! command -v docker-compose &> /dev/null
then
    echo "Docker Compose could not be found. Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Copy example environment file
if [ ! -f ".env" ]; then
    echo "Copying .env.example to .env..."
    cp .env.example .env
fi

# Build and start services
echo "Building and starting services..."
docker-compose -f docker-compose.dev.yml up --build

echo "Setup complete. You can now access the application at http://localhost:3000."