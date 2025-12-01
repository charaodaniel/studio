
import PocketBase from 'pocketbase';
import 'isomorphic-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupPocketBase() {
    const POCKETBASE_URL = process.env.POCKETBASE_URL;
    const POCKETBASE_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
    const POCKETBASE_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!POCKETBASE_URL || !POCKETBASE_ADMIN_EMAIL || !POCKETBASE_ADMIN_PASSWORD) {
        console.error("Please provide POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL, and POCKETBASE_ADMIN_PASSWORD in your environment variables.");
        return;
    }
    
    console.log("Connecting to PocketBase at:", POCKETBASE_URL);
    const pb = new PocketBase(POCKETBASE_URL);

    try {
        console.log("Authenticating as admin...");
        await pb.admins.authWithPassword(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD);
        console.log("Admin authentication successful.");

        const schemaPath = path.resolve(__dirname, '../../pocketbase_schema.json');
        console.log("Reading schema from:", schemaPath);
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

        console.log("Starting schema import...");
        const collections = await pb.collections.list(1, 50);

        for (const collection of schema) {
            const existing = collections.items.find(c => c.name === collection.name);
            if (existing) {
                console.log(`Updating collection: ${collection.name}`);
                await pb.collections.update(existing.id, collection);
            } else {
                console.log(`Creating collection: ${collection.name}`);
                await pb.collections.create(collection);
            }
        }

        console.log("Schema setup complete!");

    } catch (err) {
        console.error("An error occurred during setup:", err);
         if (err.data) {
            console.error("Error details:", JSON.stringify(err.data, null, 2));
        }
    }
}

setupPocketBase();
