// Import 'node-fetch' to provide the 'fetch' global that PocketBase SDK needs.
require('isomorphic-fetch');
const PocketBase = require('pocketbase/cjs');

// ====================================================================
// CONFIGURAÇÃO - PREENCHA SEUS DADOS AQUI
// ====================================================================
const POCKETBASE_URL = 'https://mobmv.shop';
// IMPORTANTE: Use as credenciais de um SUPER-ADMINISTRADOR do seu painel PocketBase.
// Este script não funcionará com credenciais de usuários normais.
const POCKETBASE_ADMIN_EMAIL = 'admin@example.com';
const POCKETBASE_ADMIN_PASSWORD = 'your_super_admin_password';
// ====================================================================

const pb = new PocketBase(POCKETBASE_URL);

/**
 * Representa a configuração de uma coleção no PocketBase.
 * @typedef {object} CollectionConfig
 * @property {string} name - O nome da coleção.
 * @property {string} type - O tipo da coleção ('base' ou 'auth').
 * @property {Array<object>} schema - O schema de campos da coleção.
 * @property {string} [listRule] - Regra de API para listar registros.
 * @property {string} [viewRule] - Regra de API para visualizar um registro.
 * @property {string} [createRule] - Regra de API para criar um registro.
 * @property {string} [updateRule] - Regra de API para atualizar um registro.
 * @property {string} [deleteRule] - Regra de API para deletar um registro.
 */

/**
 * @type {CollectionConfig}
 */
const usersConfig = {
    name: 'users',
    type: 'auth',
    schema: [
        // Campos que queremos garantir que existam.
        // O script não remove campos, apenas adiciona os que faltam.
        { "name": "name", "type": "text", "required": false },
        { "name": "avatar", "type": "file", "options": { "maxSelect": 1, "maxSize": 5242880, "mimeTypes": ["image/jpeg", "image/png", "image/webp"] } },
        { "name": "phone", "type": "text" },
        { "name": "role", "type": "select", "required": true, "options": { "values": ["Passageiro", "Motorista", "Admin", "Atendente"] } },
        { "name": "driver_status", "type": "select", "options": { "values": ["Online", "Offline", "Em Viagem"] } },
        { "name": "driver_vehicle_model", "type": "text" },
        { "name": "driver_vehicle_plate", "type": "text" },
        { "name": "driver_vehicle_photo", "type": "file", "options": { "maxSelect": 1 } },
        { "name": "driver_cnpj", "type": "text" },
        { "name": "driver_pix_key", "type": "text" },
        { "name": "driver_fare_type", "type": "select", "options": { "values": ["fixed", "km"] } },
        { "name": "driver_fixed_rate", "type": "number" },
        { "name": "driver_km_rate", "type": "number" },
        { "name": "driver_accepts_rural", "type": "bool" },
    ],
    listRule: "@request.auth.id != \"\"",
    viewRule: "id = @request.auth.id || @request.auth.role = \"Admin\" || @request.auth.role = \"Atendente\"",
    updateRule: "id = @request.auth.id || @request.auth.role = \"Admin\"",
    deleteRule: '@request.auth.role = "Admin"',
};

/**
 * @type {Array<CollectionConfig>}
 */
const collections = [
    {
        name: "rides",
        type: "base",
        schema: [
            { "name": "passenger", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 } },
            { "name": "driver", "type": "relation", "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 } },
            { "name": "origin_address", "type": "text", "required": true },
            { "name": "destination_address", "type": "text", "required": true },
            { "name": "status", "type": "select", "required": true, "options": { "maxSelect": 1, "values": ["requested", "accepted", "in_progress", "completed", "canceled"] } },
            { "name": "fare", "type": "number", "required": true },
            { "name": "is_negotiated", "type": "bool", "required": true },
            { "name": "started_by", "type": "select", "required": true, "options": { "maxSelect": 1, "values": ["passenger", "driver"] } },
        ],
        listRule: "@request.auth.id != \"\" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = \"Atendente\" || @request.auth.role = \"Admin\")",
        viewRule: "@request.auth.id != \"\" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = \"Admin\")",
        createRule: "@request.auth.id != \"\" && (@request.auth.role = \"Passageiro\" || @request.auth.role = \"Admin\")",
        updateRule: "@request.auth.id != \"\" && (driver = @request.auth.id || passenger = @request.auth.id || @request.auth.role = \"Admin\")",
        deleteRule: "@request.auth.role = \"Admin\"",
    },
    {
        name: "messages",
        type: "base",
        schema: [
            { "name": "ride", "type": "relation", "required": true, "options": { "collectionId": "rides", "maxSelect": 1 } },
            { "name": "sender", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 } },
            { "name": "text", "type": "text", "required": true },
        ],
        listRule: "@request.auth.id != \"\" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id || @request.auth.role = \"Atendente\" || @request.auth.role = \"Admin\")",
        viewRule: "@request.auth.id != \"\" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id || @request.auth.role = \"Admin\")",
        createRule: "@request.auth.id != \"\" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id)",
        updateRule: "@request.auth.role = \"Admin\"",
        deleteRule: "@request.auth.role = \"Admin\"",
    },
    {
        name: "driver_documents",
        type: "base",
        schema: [
            { "name": "driver", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 } },
            { "name": "document_type", "type": "select", "required": true, "options": { "maxSelect": 1, "values": ["CNH", "CRLV"] } },
            { "name": "file", "type": "file", "required": true, "options": { "maxSelect": 1, "maxSize": 5242880, "mimeTypes": ["image/jpeg", "image/png", "image/webp", "application/pdf"] } },
            { "name": "is_verified", "type": "bool" },
        ],
        listRule: "@request.auth.id != \"\" && (driver = @request.auth.id || @request.auth.role = \"Admin\")",
        viewRule: "@request.auth.id != \"\" && (driver = @request.auth.id || @request.auth.role = \"Admin\")",
        createRule: "@request.auth.id != \"\" && driver = @request.auth.id",
        updateRule: "@request.auth.id != \"\" && (driver = @request.auth.id || @request.auth.role = \"Admin\")",
        deleteRule: "@request.auth.role = \"Admin\"",
    },
    {
        name: "driver_status_logs",
        type: "base",
        schema: [
            { "name": "driver", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 } },
            { "name": "status", "type": "text", "required": true },
        ],
        listRule: "@request.auth.role = \"Admin\"",
        viewRule: "@request.auth.role = \"Admin\"",
        createRule: "@request.auth.role = \"Admin\"",
        updateRule: "\"\"", // Ninguém deve atualizar logs
        deleteRule: "\"\"", // Ninguém deve apagar logs
    },
];

async function syncCollection(config) {
    let existingCollection;
    try {
        existingCollection = await pb.collections.getOne(config.name);
        console.log(`- Coleção '${config.name}' já existe. Verificando campos...`);
    } catch (err) {
        if (err.status === 404) {
            console.log(`- Coleção '${config.name}' não encontrada. Criando...`);
            try {
                const newCollection = await pb.collections.create({
                    name: config.name,
                    type: config.type,
                    schema: config.schema,
                    // Deixar regras em branco na criação para evitar erros de validação
                    listRule: null,
                    viewRule: null,
                    createRule: null,
                    updateRule: null,
                    deleteRule: null,
                });
                console.log(`✅ Coleção '${config.name}' criada.`);
                existingCollection = newCollection; // Usar a recém-criada para aplicar regras depois
            } catch (createErr) {
                console.error(`❌ Erro ao criar a coleção '${config.name}':`, createErr?.response?.data || createErr.message);
                return;
            }
        } else {
             console.error(`❌ Erro ao buscar a coleção '${config.name}':`, err?.response?.data || err.message);
            return;
        }
    }

    // Com a coleção em mãos (existente ou nova), vamos atualizar o schema e as regras
    try {
        const existingSchema = existingCollection.schema || [];
        const newSchema = [...existingSchema];
        const existingFieldNames = new Set(existingSchema.map(field => field.name));

        // Adiciona apenas os campos que não existem
        for (const field of config.schema) {
            if (!existingFieldNames.has(field.name)) {
                newSchema.push(field);
                console.log(`  - Adicionando campo '${field.name}' à coleção '${config.name}'.`);
            }
        }

        await pb.collections.update(existingCollection.id, {
            schema: newSchema,
            listRule: config.listRule,
            viewRule: config.viewRule,
            createRule: config.createRule,
            updateRule: config.updateRule,
            deleteRule: config.deleteRule,
        });
        console.log(`✅ Coleção '${config.name}' sincronizada com sucesso.`);
    } catch (updateErr) {
         console.error(`❌ Erro ao atualizar a coleção '${config.name}':`, updateErr?.response?.data || updateErr.message);
    }
}

async function main() {
    console.log(`Iniciando configuração no servidor: ${POCKETBASE_URL}`);

    if (!POCKETBASE_ADMIN_EMAIL || !POCKETBASE_ADMIN_PASSWORD || POCKETBASE_ADMIN_EMAIL === 'admin@example.com') {
        console.error("❌ ERRO: Por favor, configure as variáveis POCKETBASE_ADMIN_EMAIL e POCKETBASE_ADMIN_PASSWORD no topo do script.");
        return;
    }

    try {
        await pb.admins.authWithPassword(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD);
        console.log("✅ Autenticado no PocketBase como Super Administrador!");
    } catch (err) {
        console.error("❌ Falha na autenticação. Verifique suas credenciais de SUPER-ADMIN e a URL do PocketBase.", err.message);
        return;
    }

    console.log("\nIniciando sincronização da coleção 'users'...");
    await syncCollection(usersConfig);
    
    console.log("\nIniciando sincronização das outras coleções...");
    for (const config of collections) {
        await syncCollection(config);
    }

    console.log("\n🎉 Script de configuração concluído!");
}

main().catch(err => {
    console.error("Ocorreu um erro inesperado durante a execução do script:", err);
});
