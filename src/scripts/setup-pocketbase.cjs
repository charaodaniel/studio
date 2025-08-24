
// @ts-check
/**
 * PocketBase Admin-Auth-based Setup Script
 *
 * DESCRIÇÃO:
 * Este script automatiza a configuração do schema do banco de dados no PocketBase.
 * Ele garante que todas as coleções, campos e regras de API necessárias para a aplicação
 * estejam corretamente configuradas.
 *
 * FUNCIONAMENTO:
 * 1. Autentica-se como Super Administrador usando as credenciais fornecidas.
 * 2. Busca o schema atual do seu servidor PocketBase.
 * 3. Define o schema "alvo" (o que a aplicação precisa).
 * 4. Compara o schema atual com o alvo e mescla as configurações, adicionando apenas
 *    coleções e campos que estiverem faltando, sem apagar nada.
 * 5. Importa o schema mesclado de volta para o servidor, aplicando todas as
 *    atualizações de uma vez.
 *
 * COMO USAR:
 * 1. Preencha as credenciais de administrador na seção de CONFIGURAÇÃO abaixo.
 * 2. Execute o comando `pnpm run setup:pb` no terminal.
 */

// Usamos require porque este é um script .cjs (CommonJS) para compatibilidade.
const PocketBase = require('pocketbase/cjs');
require('isomorphic-fetch');

// --- CONFIGURAÇÃO ---
// Preencha com os dados do seu painel de Super-Admin do PocketBase.
// IMPORTANTE: Use a URL base do seu servidor, sem "/_/" ou "/api/" no final.
const POCKETBASE_URL = 'https://mobmv.shop';
const POCKETBASE_ADMIN_EMAIL = 'admin@teste.com';
const POCKETBASE_ADMIN_PASSWORD = '12345678';
// --- FIM DA CONFIGURAÇÃO ---

// Definição do schema que a aplicação precisa.
// Este é o "estado ideal" que queremos para o banco de dados.
const TARGET_SCHEMA = [
    {
        "id": "_pb_users_auth_",
        "name": "users",
        "type": "auth",
        "listRule": "@request.auth.id != \"\"",
        "viewRule": "id = @request.auth.id || @request.auth.role = \"Admin\" || @request.auth.role = \"Atendente\"",
        "createRule": "",
        "updateRule": "id = @request.auth.id || @request.auth.role = \"Admin\"",
        "deleteRule": "@request.auth.role = \"Admin\"",
        "schema": [
            // Campos padrão do PocketBase (name, avatar, etc.) já existem.
            // Adicionamos apenas os campos personalizados necessários.
            { "name": "phone", "type": "text", "required": false, "options": {} },
            { "name": "role", "type": "select", "required": true, "options": { "maxSelect": 1, "values": ["Passageiro", "Motorista", "Atendente", "Admin"] } },
            { "name": "driver_status", "type": "select", "required": false, "options": { "maxSelect": 1, "values": ["online", "offline", "urban-trip", "rural-trip"] } },
            { "name": "driver_vehicle_model", "type": "text", "required": false, "options": {} },
            { "name": "driver_vehicle_plate", "type": "text", "required": false, "options": {} },
            { "name": "driver_vehicle_photo", "type": "file", "required": false, "options": { "maxSelect": 1, "mimeTypes": ["image/jpeg", "image/png"] } },
            { "name": "driver_cnpj", "type": "text", "required": false, "options": {} },
            { "name": "driver_pix_key", "type": "text", "required": false, "options": {} },
            { "name": "driver_fare_type", "type": "select", "required": false, "options": { "maxSelect": 1, "values": ["fixed", "km"] } },
            { "name": "driver_fixed_rate", "type": "number", "required": false, "options": {} },
            { "name": "driver_km_rate", "type": "number", "required": false, "options": {} },
            { "name": "driver_accepts_rural", "type": "bool", "required": false, "options": {} }
        ]
    },
    {
        "name": "rides",
        "type": "base",
        "listRule": "@request.auth.id != \"\" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = \"Atendente\" || @request.auth.role = \"Admin\")",
        "viewRule": "@request.auth.id != \"\" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = \"Admin\")",
        "createRule": "@request.auth.id != \"\" && (@request.auth.role = \"Passageiro\" || @request.auth.role = \"Admin\")",
        "updateRule": "@request.auth.id != \"\" && (driver = @request.auth.id || passenger = @request.auth.id || @request.auth.role = \"Admin\")",
        "deleteRule": "@request.auth.role = \"Admin\"",
        "schema": [
            { "name": "passenger", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 } },
            { "name": "driver", "type": "relation", "required": false, "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 } },
            { "name": "origin_address", "type": "text", "required": true, "options": {} },
            { "name": "destination_address", "type": "text", "required": true, "options": {} },
            { "name": "status", "type": "select", "required": true, "options": { "maxSelect": 1, "values": ["requested", "accepted", "in_progress", "completed", "canceled"] } },
            { "name": "fare", "type": "number", "required": true, "options": {} },
            { "name": "is_negotiated", "type": "bool", "required": true, "options": {} },
            { "name": "started_by", "type": "select", "required": true, "options": { "maxSelect": 1, "values": ["passenger", "driver"] } }
        ]
    },
    {
        "name": "messages",
        "type": "base",
        "listRule": "@request.auth.id != \"\" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id || @request.auth.role = \"Atendente\" || @request.auth.role = \"Admin\")",
        "viewRule": "@request.auth.id != \"\" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id || @request.auth.role = \"Admin\")",
        "createRule": "@request.auth.id != \"\" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id)",
        "updateRule": "@request.auth.role = \"Admin\"",
        "deleteRule": "@request.auth.role = \"Admin\"",
        "schema": [
            { "name": "ride", "type": "relation", "required": true, "options": { "collectionId": "b1wtu7ah1l75gen", "maxSelect": 1 } },
            { "name": "sender", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 } },
            { "name": "text", "type": "text", "required": true, "options": {} }
        ]
    },
    {
        "name": "driver_documents",
        "type": "base",
        "listRule": "@request.auth.id != \"\" && (driver = @request.auth.id || @request.auth.role = \"Admin\")",
        "viewRule": "@request.auth.id != \"\" && (driver = @request.auth.id || @request.auth.role = \"Admin\")",
        "createRule": "@request.auth.id != \"\" && driver = @request.auth.id",
        "updateRule": "@request.auth.id != \"\" && (driver = @request.auth.id || @request.auth.role = \"Admin\")",
        "deleteRule": "@request.auth.role = \"Admin\"",
        "schema": [
            { "name": "driver", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 } },
            { "name": "document_type", "type": "select", "required": true, "options": { "maxSelect": 1, "values": ["CNH", "CRLV"] } },
            { "name": "file", "type": "file", "required": true, "options": { "maxSelect": 1 } },
            { "name": "is_verified", "type": "bool", "required": false, "options": {} }
        ]
    },
    {
        "name": "driver_status_logs",
        "type": "base",
        "listRule": "@request.auth.role = \"Admin\"",
        "viewRule": "@request.auth.role = \"Admin\"",
        "createRule": "@request.auth.role = \"Admin\"",
        "updateRule": "\"\"",
        "deleteRule": "\"\"",
        "schema": [
            { "name": "driver", "type": "relation", "required": true, "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 } },
            { "name": "status", "type": "text", "required": true, "options": {} }
        ]
    }
];

// Função principal que executa o script.
async function run() {
    console.log(`Iniciando configuração no servidor: ${POCKETBASE_URL}`);

    const pb = new PocketBase(POCKETBASE_URL);

    try {
        await pb.admins.authWithPassword(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD);
        console.log('✅ Autenticado no PocketBase como Super Administrador!');
    } catch (e) {
        console.error('❌ Falha na autenticação do Super Administrador. Verifique as credenciais.');
        console.error(e);
        return;
    }

    try {
        console.log('\nBuscando schema atual do servidor...');
        const currentCollections = await pb.collections.getFullList({$autoCancel: false});
        
        console.log('Mesclando schema atual com o schema alvo...');
        const mergedCollections = [...currentCollections];

        for (const targetCollection of TARGET_SCHEMA) {
            const existingCollection = mergedCollections.find(c => c.name === targetCollection.name);

            if (existingCollection) {
                console.log(`- Atualizando coleção '${targetCollection.name}'...`);
                // Mescla os campos (adiciona apenas os que não existem)
                const existingFieldNames = new Set(existingCollection.schema.map(f => f.name));
                for (const targetField of targetCollection.schema) {
                    if (!existingFieldNames.has(targetField.name)) {
                        console.log(`  - Adicionando campo '${targetField.name}'`);
                        existingCollection.schema.push(targetField);
                    }
                }
                // Atualiza as regras e outras propriedades
                Object.assign(existingCollection, {
                    listRule: targetCollection.listRule,
                    viewRule: targetCollection.viewRule,
                    createRule: targetCollection.createRule,
                    updateRule: targetCollection.updateRule,
                    deleteRule: targetCollection.deleteRule,
                });
            } else {
                console.log(`- Criando nova coleção '${targetCollection.name}'...`);
                mergedCollections.push(targetCollection);
            }
        }
        
        console.log('\nImportando o schema mesclado de volta para o servidor...');
        await pb.collections.import(mergedCollections, false, false); // false = não apagar coleções que não estão na lista

        console.log('\n✅ Schema do PocketBase sincronizado com sucesso!');
        
    } catch(e) {
        console.error('\n❌ Ocorreu um erro durante a sincronização do schema:');
        // A API do PocketBase retorna erros com uma estrutura específica
        if (e.data && e.data.data) {
            console.error(JSON.stringify(e.data.data, null, 2));
        } else {
            console.error(e);
        }
    } finally {
         console.log('\n🎉 Script de configuração concluído!');
    }
}

run();
