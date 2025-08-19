// initPocketBase_modified_auth.js
import PocketBase from "pocketbase";

// -------------------------------------------------------------------
// CONFIGURAÇÃO
// -------------------------------------------------------------------
const POCKETBASE_URL = "http://62.72.9.108:8090";
const ADMIN_EMAIL = "admin@teste.com";
const ADMIN_PASSWORD = "12345678";

// Inicializa a instância do PocketBase
const pb = new PocketBase(POCKETBASE_URL);

// -------------------------------------------------------------------
// DEFINIÇÃO DAS COLEÇÕES
// -------------------------------------------------------------------
// As definições das coleções com as regras da API corrigidas.
// A sintaxe correta para verificar permissões em campos de relacionamento
// é usar o operador = para comparar com @request.auth.id
const collections = [
  {
    name: "users",
    type: "auth",
    schema: [
      { name: "name", type: "text", required: true },
      { name: "avatar", type: "file", options: { maxSelect: 1, maxSize: 1048576 } },
      { name: "phone", type: "text" },
      { name: "role", type: "select", required: true, options: { values: ["Passageiro", "Motorista", "Admin", "Atendente"] } },
      { name: "driver_status", type: "select", options: { values: ["Online", "Offline", "Em Viagem (Urbano)", "Em Viagem (Rural)"] } },
      { name: "driver_vehicle_model", type: "text" },
      { name: "driver_vehicle_plate", type: "text" },
      { name: "driver_vehicle_photo", type: "file", options: { maxSelect: 1 } },
      { name: "driver_pix_key", type: "text" },
      { name: "driver_fare_type", type: "select", options: { values: ["fixed", "km"] } },
      { name: "driver_fixed_rate", type: "number" },
      { name: "driver_km_rate", type: "number" },
      { name: "driver_accepts_rural", type: "bool" },
    ],
    listRule: '@request.auth.id != ""',
    viewRule: 'id = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente" || @request.auth.role = "Motorista"',
    createRule: "",
    updateRule: 'id = @request.auth.id || @request.auth.role = "Admin"',
    deleteRule: '@request.auth.role = "Admin"',
  },
  {
    name: "rides",
    type: "base",
    schema: [
      { name: "passenger", type: "relation", required: true, options: { collectionId: "_pb_users_auth_", maxSelect: 1 } },
      { name: "driver", type: "relation", options: { collectionId: "_pb_users_auth_", maxSelect: 1 } },
      { name: "origin_address", type: "text", required: true },
      { name: "destination_address", type: "text", required: true },
      { name: "status", type: "select", required: true, options: { values: ["requested", "accepted", "in_progress", "completed", "canceled"] } },
      { name: "fare", type: "number", required: true },
      { name: "is_negotiated", type: "bool", required: true },
      { name: "started_by", type: "select", required: true, options: { values: ["passenger", "driver"] } },
    ],
    createRule: '@request.auth.role = "Passageiro" || @request.auth.role = "Admin"',
    listRule: '(passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = "Atendente") || @request.auth.role = "Admin"',
    viewRule: '(passenger = @request.auth.id || driver = @request.auth.id) || @request.auth.role = "Admin"',
    updateRule: 'driver = @request.auth.id || passenger = @request.auth.id || @request.auth.role = "Admin"',
    deleteRule: '@request.auth.role = "Admin"',
  },
  {
    name: "messages",
    type: "base",
    schema: [
      { name: "ride", type: "relation", required: true, options: { collectionId: "rides", maxSelect: 1 } },
      { name: "sender", type: "relation", required: true, options: { collectionId: "_pb_users_auth_", maxSelect: 1 } },
      { name: "text", type: "text", required: true },
    ],
    createRule: 'ride.passenger = @request.auth.id || ride.driver = @request.auth.id',
    listRule: '(ride.passenger = @request.auth.id || ride.driver = @request.auth.id || @request.auth.role = "Atendente") || @request.auth.role = "Admin"',
    viewRule: '(ride.passenger = @request.auth.id || ride.driver = @request.auth.id) || @request.auth.role = "Admin"',
    updateRule: '@request.auth.role = "Admin"',
    deleteRule: '@request.auth.role = "Admin"',
  },
  {
    name: "driver_documents",
    type: "base",
    schema: [
      { name: "driver", type: "relation", required: true, options: { collectionId: "_pb_users_auth_", maxSelect: 1 } },
      { name: "document_type", type: "select", required: true, options: { values: ["CNH", "CRLV"] } },
      { name: "file", type: "file", required: true, options: { maxSelect: 1 } },
      { name: "is_verified", type: "bool" },
    ],
    createRule: 'driver = @request.auth.id',
    listRule: 'driver = @request.auth.id || @request.auth.role = "Admin"',
    viewRule: 'driver = @request.auth.id || @request.auth.role = "Admin"',
    updateRule: 'driver = @request.auth.id || @request.auth.role = "Admin"',
    deleteRule: '@request.auth.role = "Admin"',
  },
  {
    name: "driver_status_logs",
    type: "base",
    schema: [
      { name: "driver", type: "relation", required: true, options: { collectionId: "_pb_users_auth_", maxSelect: 1 } },
      { name: "status", type: "text", required: true },
    ],
    createRule: '@request.auth.role = "Admin"',
    listRule: '@request.auth.role = "Admin"',
    viewRule: '@request.auth.role = "Admin"',
    updateRule: '@request.auth.role = "Admin"',
    deleteRule: '@request.auth.role = "Admin"',
  },
];

// -------------------------------------------------------------------
// FUNÇÃO PRINCIPAL (MAIN)
// -------------------------------------------------------------------
async function main() {
  try {
    // ATENÇÃO: O PocketBase recomenda o uso de pb.admins.authWithPassword() para autenticação de administradores.
    // O uso de pb.collection("_superusers").authWithPassword() é uma abordagem não padrão e pode não funcionar
    // dependendo da sua configuração do PocketBase.
    await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("✅ Autenticado no PocketBase como Administrador (via _superusers)! ");
  } catch (err) {
    console.error("❌ Falha na autenticação. Verifique ADMIN_EMAIL e ADMIN_PASSWORD. Se o erro persistir, considere usar pb.admins.authWithPassword().", err.message);
    return; // Encerra o script se a autenticação falhar
  }

  // 2. Loop para criar cada coleção
  for (const config of collections) {
    try {
      // Tenta encontrar a coleção
      await pb.collections.getOne(config.name);
      console.log(`⚠️ Coleção '${config.name}' já existe. Pulando...`);
    } catch (err) {
      // Se der erro 404, a coleção não existe, então a criamos
      if (err.status === 404) {
        try {
          // A collectionId para relacionamentos com a tabela de usuários
          // precisa ser o ID real da coleção (`_pb_users_auth_`) e não o nome (`users`).
          const schemaWithCorrectedRelations = config.schema.map(field => {
            if (field.type === 'relation' && field.options.collectionId === 'users') {
              return { ...field, options: { ...field.options, collectionId: '_pb_users_auth_' } };
            }
            return field;
          });
          
          const finalConfig = { ...config, schema: schemaWithCorrectedRelations };

          await pb.collections.create(finalConfig);
          console.log(`✅ Coleção '${config.name}' criada com sucesso!`);
        } catch (createErr) {
          console.error(`❌ Erro ao criar a coleção '${config.name}':`, createErr?.response?.data || createErr.message);
        }
      } else {
        // Outro erro ao verificar a coleção
        console.error(`❌ Erro ao verificar a coleção '${config.name}':`, err.message);
      }
    }
  }

  console.log("🎉 Script de inicialização concluído!");
}

// Executa a função principal
main();

