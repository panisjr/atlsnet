#!/bin/bash

# Stop on errors
set -e

# Define project directory and virtual environment directory
PROJECT_DIR="server"

# Change to project directory
cd $PROJECT_DIR

# Pulling latest changes from the dev branch
echo "Pulling latest changes from the dev branch..."
# Use SSH for authentication
#git remote set-url origin git@github.com:panisjr/atlsnet.git
git checkout main
git pull origin main
#git push origin main
#git reset --hard origin/dev

# Activate the virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Installing Python dependencies
# echo "Installing backend dependencies..."
# pip install --no-cache-dir -r requirements.txt

# Restarting application and web services
echo "Restarting application and web services..."
sudo systemctl restart atlsnet
sudo systemctl reload nginx
sudo systemctl restart nginx

echo "Deployment complete!"
