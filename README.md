# Particle Life Simulation

An interactive particle life simulation with customizable interaction rules and physics controls.

## Features

- 4 types of particles (Red, Blue, Yellow, Green) with customizable interaction rules
- Black hole physics with adjustable gravitational constant
- Toroidal universe (particles wrap around edges)
- Real-time control adjustments
- Responsive canvas-based rendering

## Local Development

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run in development mode (with auto-reload)
npm run dev

# Or run in production mode
npm start
```

Visit `http://localhost:3000` to view the simulation.

## Deployment to DigitalOcean

### Step 1: Prepare Your Droplet

1. SSH into your DigitalOcean droplet:
```bash
ssh root@your_droplet_ip
```

2. Update the system:
```bash
apt update && apt upgrade -y
```

3. Install Node.js (using NodeSource):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

4. Install PM2 globally:
```bash
npm install -g pm2
```

5. Install Nginx (optional, for reverse proxy):
```bash
apt install -y nginx
```

### Step 2: Deploy Your Application

1. Create an application directory:
```bash
mkdir -p /var/www/particle-life
cd /var/www/particle-life
```

2. Clone or upload your files to the droplet. You can use git, scp, or rsync:

**Using rsync (from your local machine):**
```bash
rsync -avz --exclude 'node_modules' /home/patrick/projects/livepart/ root@your_droplet_ip:/var/www/particle-life/
```

**Or using git (if you have a repository):**
```bash
git clone your_repository_url .
```

3. Install dependencies on the server:
```bash
cd /var/www/particle-life
npm install --production
```

### Step 3: Start Application with PM2

```bash
# Create logs directory
mkdir -p logs

# Start the application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd
# Follow the command output instructions
```

### Step 4: Configure Nginx (Optional but Recommended)

1. Create Nginx configuration:
```bash
nano /etc/nginx/sites-available/particle-life
```

2. Add the following configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com;  # Replace with your domain or droplet IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. Enable the site:
```bash
ln -s /etc/nginx/sites-available/particle-life /etc/nginx/sites-enabled/
nginx -t  # Test configuration
systemctl restart nginx
```

4. Configure firewall:
```bash
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw enable
```

### Step 5: Setup SSL with Let's Encrypt (Optional)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your_domain.com
```

## PM2 Management Commands

```bash
# View status
pm2 status

# View logs
pm2 logs particle-life

# Restart application
pm2 restart particle-life

# Stop application
pm2 stop particle-life

# Monitor
pm2 monit
```

## Environment Variables

You can set custom port by creating a `.env` file or setting environment variable:

```bash
# In ecosystem.config.js, modify:
env: {
  NODE_ENV: 'production',
  PORT: 3000  # Change to your desired port
}
```

## Troubleshooting

### Application won't start
- Check logs: `pm2 logs particle-life`
- Verify Node.js version: `node --version` (should be 18+)
- Check if port 3000 is available: `lsof -i :3000`

### Can't access from browser
- Check if application is running: `pm2 status`
- Verify firewall rules: `ufw status`
- Test locally on server: `curl http://localhost:3000`
- Check Nginx configuration: `nginx -t`

### Performance issues
- Increase PM2 instances in ecosystem.config.js
- Monitor resources: `pm2 monit`
- Check memory usage: `free -h`

## License

MIT
