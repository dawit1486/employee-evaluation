module.exports = {
    apps: [
        {
            name: 'employee-tracking-system',
            script: 'server/index.js',
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
                MONGO_URI: 'mongodb://localhost:27017/employee-evaluation' // Update this on the server
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G'
        }
    ]
};
