
require('isomorphic-fetch');
const PocketBase = require('pocketbase/cjs');

// --- CONFIGURAÇÃO ---
// Preencha estas variáveis com os dados do seu painel de Super-Admin do PocketBase
const POCKETBASE_URL = 'https://mobmv.shop';
const POCKETBASE_ADMIN_EMAIL = 'admin@example.com';
const POCKETBASE_ADMIN_PASSWORD = 'password123';
// --- FIM DA CONFIGURAÇÃO ---


// Definição completa do schema desejado para o aplicativo
const collections = [
    {
        name: 'users',
        type: 'auth',
        schema: [
            { name: 'name', type: 'text' },
            { name: 'avatar', type: 'file', options: { maxSelect: 1, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] } },
            { name: 'phone', type: 'text' },
            { name: 'role', type: 'select', options: { values: ['Passageiro', 'Motorista', 'Admin', 'Atendente'], maxSelect: 1 }, required: true },
            { name: 'driver_status', type: 'select', options: { values: ['online', 'offline', 'in_trip'], maxSelect: 1 } },
            { name: 'driver_vehicle_model', type: 'text' },
            { name: 'driver_vehicle_plate', type: 'text' },
            { name: 'driver_vehicle_photo', type: 'file', options: { maxSelect: 1 } },
            { name: 'driver_cnpj', type: 'text' },
            { name: 'driver_pix_key', type: 'text' },
            { name: 'driver_fare_type', type: 'select', options: { values: ['fixed', 'km'], maxSelect: 1 } },
            { name: 'driver_fixed_rate', type: 'number' },
            { name: 'driver_km_rate', type: 'number' },
            { name: 'driver_accepts_rural', type: 'bool' },
        ],
        rules: {
            listRule: '@request.auth.id != ""',
            viewRule: 'id = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente" || @request.auth.role = "Motorista"',
            updateRule: 'id = @request.auth.id || @request.auth.role = "Admin"',
            deleteRule: '@request.auth.role = "Admin"',
        }
    },
    {
        name: 'rides',
        type: 'base',
        schema: [
            { name: 'passenger', type: 'relation', options: { collectionId: '_pb_users_auth_', maxSelect: 1 }, required: true },
            { name: 'driver', type: 'relation', options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
            { name: 'origin_address', type: 'text', required: true },
            { name: 'destination_address', type: 'text', required: true },
            { name: 'status', type: 'select', options: { maxSelect: 1, values: ['requested', 'accepted', 'in_progress', 'completed', 'canceled'] }, required: true },
            { name: 'fare', type: 'number', required: true },
            { name: 'is_negotiated', type: 'bool', required: true },
            { name: 'started_by', type: 'select', options: { maxSelect: 1, values: ['passenger', 'driver'] }, required: true },
        ],
        rules: {
            listRule: '@request.auth.id != "" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = "Atendente" || @request.auth.role = "Admin")',
            viewRule: '@request.auth.id != "" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = "Admin")',
            createRule: '@request.auth.id != "" && (@request.auth.role = "Passageiro" || @request.auth.role = "Admin")',
            updateRule: '@request.auth.id != "" && (driver = @request.auth.id || passenger = @request.auth.id || @request.auth.role = "Admin")',
            deleteRule: '@request.auth.role = "Admin"',
        }
    },
    {
        name: 'messages',
        type: 'base',
        schema: [
            { name: 'ride', type: 'relation', options: { collectionId: 'b1wtu7ah1l75gen' }, required: true },
            { name: 'sender', type: 'relation', options: { collectionId: '_pb_users_auth_' }, required: true },
            { name: 'text', type: 'text', required: true },
        ],
        rules: {
            listRule: '@request.auth.id != "" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id || @request.auth.role = "Atendente" || @request.auth.role = "Admin")',
            viewRule: '@request.auth.id != "" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id || @request.auth.role = "Admin")',
            createRule: '@request.auth.id != "" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id)',
            updateRule: '@request.auth.role = "Admin"',
            deleteRule: '@request.auth.role = "Admin"',
        }
    },
    {
        name: 'driver_documents',
        type: 'base',
        schema: [
            { name: 'driver', type: 'relation', options: { collectionId: '_pb_users_auth_' }, required: true },
            { name: 'document_type', type: 'select', options: { maxSelect: 1, values: ['CNH', 'CRLV'] }, required: true },
            { name: 'file', type: 'file', options: { maxSelect: 1 }, required: true },
            { name: 'is_verified', type: 'bool' },
        ],
        rules: {
            listRule: '@request.auth.id != "" && (driver = @request.auth.id || @request.auth.role = "Admin")',
            viewRule: '@request.auth.id != "" && (driver = @request.auth.id || @request.auth.role = "Admin")',
            createRule: '@request.auth.id != "" && driver = @request.auth.id',
            updateRule: '@request.auth.id != "" && (driver = @request.auth.id || @request.auth.role = "Admin")',
            deleteRule: '@request.auth.role = "Admin"',
        }
    },
    {
        name: 'driver_status_logs',
        type: 'base',
        schema: [
            { name: 'driver', type: 'relation', options: { collectionId: '_pb_users_auth_' }, required: true },
            { name: 'status', type: 'text', required: true },
        ],
        rules: {
            listRule: '@request.auth.role = "Admin"',
            viewRule: '@request.auth.role = "Admin"',
            createRule: '@request.auth.role = "Admin"',
            updateRule: '""',
            deleteRule: '""',
        }
    }
];

const pb = new PocketBase(POCKETBASE_URL);

async function syncCollectionSchema(collectionInfo) {
    try {
        let collection;
        try {
            collection = await pb.collections.getOne(collectionInfo.name);
            console.log(`- Coleção '${collectionInfo.name}' já existe. Verificando campos...`);
        } catch (e) {
            if (e.status === 404) {
                console.log(`- Coleção '${collectionInfo.name}' não encontrada, criando...`);
                await pb.collections.create({
                    name: collectionInfo.name,
                    type: collectionInfo.type,
                    schema: [],
                    ...collectionInfo.rules
                });
                collection = await pb.collections.getOne(collectionInfo.name);
                console.log(`  - Coleção '${collectionInfo.name}' criada.`);
            } else {
                throw e;
            }
        }

        const form = new PocketBase.forms.CollectionForm(pb, collection);
        const existingFieldNames = new Set(form.schema.map(f => f.name));

        for (const field of collectionInfo.schema) {
            if (!existingFieldNames.has(field.name)) {
                console.log(`  - Adicionando campo '${field.name}' à coleção '${collectionInfo.name}'.`);
                form.schema.addField(new PocketBase.models.SchemaField(field));
            }
        }
        
        await form.submit();
        
    } catch (e) {
        console.error(`❌ Erro ao sincronizar schema da coleção '${collectionInfo.name}':`, JSON.stringify(e.data?.data, null, 2) || e.message);
    }
}

async function syncCollectionRules(collectionInfo) {
    if (!collectionInfo.rules) return;
    try {
        const collection = await pb.collections.getOne(collectionInfo.name);
        const form = new PocketBase.forms.CollectionForm(pb, collection);

        Object.assign(form, collectionInfo.rules);
        
        await form.submit();
        console.log(`  - Regras de API da coleção '${collectionInfo.name}' aplicadas.`);
    } catch (e) {
        console.error(`❌ Erro ao atualizar regras da coleção '${collectionInfo.name}':`, JSON.stringify(e.data?.data, null, 2) || e.message);
    }
}

async function main() {
    console.log(`Iniciando configuração no servidor: ${POCKETBASE_URL}`);
    try {
        await pb.admins.authWithPassword(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD);
        console.log('✅ Autenticado no PocketBase como Super Administrador!');
    } catch (e) {
        console.error('❌ Falha na autenticação do Super Administrador. Verifique suas credenciais no topo do arquivo.');
        console.error(e);
        return;
    }

    console.log("\n--- Fase 1: Sincronizando Schemas (Campos) ---");
    for (const collectionInfo of collections) {
        console.log(`\nIniciando sincronização da coleção '${collectionInfo.name}'...`);
        await syncCollectionSchema(collectionInfo);
    }

    console.log("\n--- Fase 2: Aplicando Regras de API ---");
     for (const collectionInfo of collections) {
        await syncCollectionRules(collectionInfo);
    }

    console.log('\n🎉 Script de configuração concluído!');
}

main().catch(err => {
    console.error('Ocorreu um erro inesperado:', err);
});
