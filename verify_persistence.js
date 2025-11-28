const http = require('http');

const PORT = 4000;
const BASE_URL = `http://localhost:${PORT}`;

async function testPersistence() {
	console.log('Starting persistence verification...');

	// 1. Save a world
	const dummyConfig = {
		rules: { 0: { 0: 0.5 } },
		totNumOfParticles: 100,
		width: 800,
		height: 800
	};

	console.log('Testing POST /api/worlds...');
	const saveResponse = await fetch(`${BASE_URL}/api/worlds`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ config: dummyConfig })
	});

	if (!saveResponse.ok) {
		throw new Error(`Failed to save world: ${saveResponse.status} ${saveResponse.statusText}`);
	}

	const saveData = await saveResponse.json();
	console.log('Save response:', saveData);
	const worldId = saveData.id;

	if (!worldId) {
		throw new Error('No world ID returned');
	}

	// 2. List worlds
	console.log('Testing GET /api/worlds...');
	const listResponse = await fetch(`${BASE_URL}/api/worlds`);

	if (!listResponse.ok) {
		throw new Error(`Failed to list worlds: ${listResponse.status} ${listResponse.statusText}`);
	}

	const listData = await listResponse.json();
	console.log(`Found ${listData.worlds.length} worlds.`);

	const savedWorld = listData.worlds.find(w => w.id === worldId);
	if (!savedWorld) {
		throw new Error('Saved world not found in list');
	}
	console.log('Saved world found in list.');

	// 3. Load world
	console.log(`Testing GET /api/worlds/${worldId}...`);
	const loadResponse = await fetch(`${BASE_URL}/api/worlds/${worldId}`);

	if (!loadResponse.ok) {
		throw new Error(`Failed to load world: ${loadResponse.status} ${loadResponse.statusText}`);
	}

	const loadData = await loadResponse.json();
	console.log('Loaded config:', loadData.config);

	// Verify content
	if (JSON.stringify(loadData.config) !== JSON.stringify(dummyConfig)) {
		throw new Error('Loaded config does not match saved config');
	}

	console.log('Verification SUCCESS!');
}

// Wait for server to be ready (simple delay for this script, assuming server is started separately)
// Actually, I'll assume the user/agent starts the server.
// But I can try to ping health check first.

async function waitForServer() {
	let retries = 5;
	while (retries > 0) {
		try {
			const res = await fetch(`${BASE_URL}/health`);
			if (res.ok) return;
		} catch (e) {
			console.log('Waiting for server...');
		}
		await new Promise(r => setTimeout(r, 1000));
		retries--;
	}
	throw new Error('Server not reachable');
}

(async () => {
	try {
		await waitForServer();
		await testPersistence();
	} catch (err) {
		console.error('Verification FAILED:', err);
		process.exit(1);
	}
})();
