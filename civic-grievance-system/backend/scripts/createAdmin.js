import bcrypt from 'bcrypt';
import 'dotenv/config';
import { query, pool } from '../config/db.js';

const adminName = 'Admin User';
const adminEmail = 'shettyhrithik384@gmail.com';
const adminPhone = '0000000000';
const plainTextPassword = process.env.ADMIN_PASSWORD;

try {
	if (!plainTextPassword) {
		throw new Error('set ADMIN_PASSWORD before running this script');
	}

		const passwordHash = await bcrypt.hash(plainTextPassword, 10);
		await query(`
			INSERT INTO users (name, email, phone, password_hash, role)
			VALUES ($1, LOWER($2), $3, $4, 'admin')
			ON CONFLICT (email) DO UPDATE SET
				name = EXCLUDED.name,
				phone = EXCLUDED.phone,
				password_hash = EXCLUDED.password_hash,
				role = 'admin'
		`, [adminName, adminEmail, adminPhone, passwordHash]);

		console.log(`Admin account created successfully for ${adminEmail}.`);
		console.log(`Plain-text password used: ${plainTextPassword}`);
} catch (error) {
	console.error(`Admin creation failed: ${error.message}`);
	process.exitCode = 1;
} finally {
	await pool.end();
}