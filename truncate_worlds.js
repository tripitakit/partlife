const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./worlds.db', (err) => {
	if (err) {
		console.error('Error opening database', err.message);
		process.exit(1);
	}
});

db.serialize(() => {
	db.run("DELETE FROM worlds", (err) => {
		if (err) {
			console.error("Error deleting worlds:", err.message);
		} else {
			console.log("All rows deleted from worlds table.");
		}
	});

	db.run("DELETE FROM sqlite_sequence WHERE name='worlds'", (err) => {
		if (err) {
			console.error("Error resetting sequence:", err.message);
		} else {
			console.log("Auto-increment sequence reset.");
		}
	});
});

db.close((err) => {
	if (err) {
		console.error(err.message);
	}
	console.log('Database connection closed.');
});
