'use server';
/**
 * PocketBase Setup Script
 * 
 * Como usar:
 * 1. Certifique-se de que o PocketBase esteja rodando.
 * 2. Preencha as variáveis `POCKETBASE_URL`, `POCKETBASE_ADMIN_EMAIL` e `POCKETBASE_ADMIN_PASSWORD` abaixo.
 * 3. Execute o script no seu terminal com: node src/scripts/setup-pocketbase.js
 * 
 * O que o script faz:
 * - Conecta-se ao seu PocketBase como administrador.
 * - Verifica se as coleções necessárias existem.
 * - Cria as coleções (`rides`, `messages`, `driver_documents`, `driver_status_logs`) se elas não existirem.
 * - Adiciona todos os campos a cada coleção.
 * - Define as regras de API corretas para cada coleção.
 * - Adiciona os campos personalizados à coleção `users`.
 */

import PocketBase from 'pocketbase';
import fetch from 'isomorphic-fetch';

// --- CONFIGURAÇÃO ---
const POCKETBASE_URL = 'https://mobmv.shop'; // Substitua pela URL do seu PocketBase
const POCKETBASE_ADMIN_EMAIL = 'seu-super-admin@email.com'; // Substitua pelo seu email de admin
const POCKETBASE_ADMIN_PASSWORD = 'sua-senha-super-admin'; // Substitua pela sua senha de admin
// --------------------

const pb = new PocketBase(POCKETBASE_URL);

const collections = [
  {
    "name": "rides",
    "type": "base",
    "system": false,
    "schema": [
      { "name": "passenger", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "cascadeDelete": false, "minSelect": null, "maxSelect": 1, "displayFields": null } },
      { "name": "driver", "type": "relation", "required": false, "options": { "collectionId": "_pb_users_auth_", "cascadeDelete": false, "minSelect": null, "maxSelect": 1, "displayFields": null } },
      { "name": "origin_address", "type": "text", "required": true, "options": {} },
      { "name": "destination_address", "type": "text", "required": true, "options": {} },
      { "name": "status", "type": "select", "required": true, "options": { "maxSelect": 1, "values": ["requested", "accepted", "in_progress", "completed", "canceled"] } },
      { "name": "fare", "type": "number", "required": true, "options": {} },
      { "name": "is_negotiated", "type": "bool", "required": true, "options": {} },
      { "name": "started_by", "type": "select", "required": true, "options": { "maxSelect": 1, "values": ["passenger", "driver"] } }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != \"\" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = \"Atendente\" || @request.auth.role = \"Admin\")",
    "viewRule": "@request.auth.id != \"\" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = \"Admin\")",
    "createRule": "@request.auth.id != \"\" && (@request.auth.role = \"Passageiro\" || @request.auth.role = \"Admin\")",
    "updateRule": "@request.auth.id != \"\" && (driver = @request.auth.id || passenger = @request.auth.id || @request.auth.role = \"Admin\")",
    "deleteRule": "@request.auth.role = \"Admin\"",
    "options": {}
  },
  {
    "name": "messages",
    "type": "base",
    "system": false,
    "schema": [
      { "name": "ride", "type": "relation", "required": true, "options": { "collectionId": "b1wtu7ah1l75gen", "cascadeDelete": false, "minSelect": null, "maxSelect": 1, "displayFields": null } },
      { "name": "sender", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "cascadeDelete": false, "minSelect": null, "maxSelect": 1, "displayFields": null } },
      { "name": "text", "type": "text", "required": true, "options": {} }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != \"\" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id || @request.auth.role = \"Atendente\" || @request.auth.role = \"Admin\")",
    "viewRule": "@request.auth.id != \"\" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id || @request.auth.role = \"Admin\")",
    "createRule": "@request.auth.id != \"\" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id)",
    "updateRule": "@request.auth.role = \"Admin\"",
    "deleteRule": "@request.auth.role = \"Admin\"",
    "options": {}
  },
  {
    "name": "driver_documents",
    "type": "base",
    "system": false,
    "schema": [
      { "name": "driver", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "cascadeDelete": false, "minSelect": null, "maxSelect": 1, "displayFields": null } },
      { "name": "document_type", "type": "select", "required": true, "options": { "maxSelect": 1, "values": ["CNH", "CRLV"] } },
      { "name": "file", "type": "file", "required": true, "options": { "maxSelect": 1 } },
      { "name": "is_verified", "type": "bool", "options": {} }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != \"\" && (driver = @request.auth.id || @request.auth.role = \"Admin\")",
    "viewRule": "@request.auth.id != \"\" && (driver = @request.auth.id || @request.auth.role = \"Admin\")",
    "createRule": "@request.auth.id != \"\" && driver = @request.auth.id",
    "updateRule": "@request.auth.id != \"\" && (driver = @request.auth.id || @request.auth.role = \"Admin\")",
    "deleteRule": "@request.auth.role = \"Admin\"",
    "options": {}
  },
  {
    "name": "driver_status_logs",
    "type": "base",
    "system": false,
    "schema": [
      { "name": "driver", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "cascadeDelete": false, "minSelect": null, "maxSelect": 1, "displayFields": null } },
      { "name": "status", "type": "text", "required": true, "options": {} }
    ],
    "indexes": [],
    "listRule": "@request.auth.role = \"Admin\"",
    "viewRule": "@request.auth.role = \"Admin\"",
    "createRule": "@request.auth.role = \"Admin\"",
    "updateRule": "\"\"",
    "deleteRule": "\"\"",
    "options": {}
  }
];

const usersFields = [
    { "name": "role", "type": "select", "required": true, "options": { "maxSelect": 1, "values": ["Passageiro", "Motorista", "Admin", "Atendente"] } },
    { "name": "phone", "type": "text", "options": {} },
    { "name": "driver_status", "type": "select", "options": { "maxSelect": 1, "values": ["Online", "Offline", "Em Viagem (Urbano)", "Em Viagem (Interior/Intermunicipal)"] } },
    { "name": "driver_vehicle_model", "type": "text", "options": {} },
    { "name": "driver_vehicle_plate", "type": "text", "options": {} },
    { "name": "driver_vehicle_photo", "type": "file", "options": { "maxSelect": 1, "mimeTypes": ["image/jpeg", "image/png", "image/webp"] } },
    { "name": "driver_cnpj", "type": "text", "options": {} },
    { "name": "driver_pix_key", "type": "text", "options": {} },
    { "name": "driver_fare_type", "type": "select", "options": { "maxSelect": 1, "values": ["fixed", "km"] } },
    { "name": "driver_fixed_rate", "type": "number", "options": {} },
    { "name": "driver_km_rate", "type": "number", "options": {} },
    { "name": "driver_accepts_rural", "type": "bool", "options": {} }
];

async function main() {
    try {
        console.log('Autenticando...');
        await pb.admins.authWithPassword(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD, {
             fetch: fetch
        });
        console.log('Autenticação bem-sucedida!');

        const existingCollections = await pb.collections.getFullList({ fetch: fetch });
        const existingCollectionNames = existingCollections.map(c => c.name);

        for (const collection of collections) {
            if (existingCollectionNames.includes(collection.name)) {
                console.log(`Coleção "${collection.name}" já existe. Pulando criação.`);
            } else {
                console.log(`Criando coleção "${collection.name}"...`);
                // Criar sem as regras primeiro para evitar erro de validação
                const { listRule, viewRule, createRule, updateRule, deleteRule, ...schemaData } = collection;
                const newCollection = await pb.collections.create(schemaData, { fetch: fetch });
                console.log(`Coleção "${collection.name}" criada. Aplicando regras...`);

                // Agora, atualiza com as regras
                await pb.collections.update(newCollection.id, {
                    listRule, viewRule, createRule, updateRule, deleteRule
                }, { fetch: fetch });
                 console.log(`Regras da coleção "${collection.name}" aplicadas.`);
            }
        }
        
        console.log("\nAtualizando coleção 'users'...");
        const usersCollection = await pb.collections.getOne('users', { fetch: fetch });
        const existingUserFields = usersCollection.schema.map(f => f.name);

        const fieldsToAdd = usersFields.filter(f => !existingUserFields.includes(f.name));

        if (fieldsToAdd.length > 0) {
            console.log(`Adicionando ${fieldsToAdd.length} novos campos à coleção "users"...`);
             const updatedSchema = [...usersCollection.schema, ...fieldsToAdd];
             await pb.collections.update(usersCollection.id, { schema: updatedSchema }, { fetch: fetch });
             console.log('Campos adicionados com sucesso à coleção "users".');
        } else {
            console.log('Coleção "users" já está com todos os campos necessários.');
        }

        // Definindo as regras da coleção 'users'
        console.log("Aplicando regras de API na coleção 'users'...");
        await pb.collections.update(usersCollection.id, {
            listRule: "@request.auth.id != \"\" && (@request.auth.id = id || @request.auth.role = \"Admin\" || @request.auth.role = \"Atendente\")",
            viewRule: "@request.auth.id != \"\" && (@request.auth.id = id || @request.auth.role = \"Admin\" || @request.auth.role = \"Atendente\")",
            updateRule: "@request.auth.id != \"\" && (@request.auth.id = id || @request.auth.role = \"Admin\")",
            deleteRule: "@request.auth.role = \"Admin\""
        }, { fetch: fetch });
        console.log("Regras da coleção 'users' aplicadas com sucesso.");


        console.log('\n--- Configuração concluída! ---');
    } catch (error) {
        console.error('\n--- ERRO DURANTE A CONFIGURAÇÃO ---');
        console.error(JSON.stringify(error, null, 2));
    }
}

main();
