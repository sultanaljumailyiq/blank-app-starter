const net = require('net');

const HOST = 'aws-1-ap-southeast-1.pooler.supabase.com'; // Pooler Host
const PORT = 5432; // Session Mode

const socket = new net.Socket();
socket.setTimeout(5000);

console.log(`Testing connection to ${HOST}:${PORT}...`);

socket.connect(PORT, HOST, () => {
    console.log('✅ Connection established!');
    socket.destroy();
});

socket.on('error', (err) => {
    console.log(`❌ Connection failed: ${err.message}`);
});

socket.on('timeout', () => {
    console.log('❌ Connection timed out');
    socket.destroy();
});
