// initPocketBase_fixed.js
import PocketBase from "pocketbase";
import 'isomorphic-fetch'; // Polyfill for fetch in Node.js environment

// -------------------------------------------------------------------
// CONFIGURAÇÃO
// -------------------------------------------------------------------
// !! IMPORTANTE !!
// Preencha com as credenciais de um usuário ADMIN que você criou
// manualmente no painel do PocketBase.
const POCKETBASE_URL = "https://mobmv.shop";
const ADMIN_EMAIL = "daniel.kokynhw@gmail.com";
const ADMIN_PASSWORD = "Dcm02061994@@";

// Inicializa a instância do PocketBase
const pb = new PocketBase(POCKETBASE_URL);

// -------------------------------------------------------------------
// DEFINIÇÃO DAS COLEÇÕES E CAMPOS
// -------------------------------------------------------------------

// Definição completa do schema, incluindo as regras da API.
const collectionsDefinition = {
  users: {
    name: "users",
    type: "auth",
    schema: [
      { name: "name", type: "text", required: true },
      { name: "phone", type: "text" },
      { name: "role", type: "select", required: true, options: { values: ["Passageiro", "Motorista", "Admin", "Atendente"] } },
      // Campos de Motorista
      { name: "driver_status", type: "select", options: { values: ["Online", "Offline", "Em Viagem (Urbano)", "Em Viagem (Rural)"] } },
      { name: "driver_vehicle_model", type: "text" },
      { name: "driver_vehicle_plate", type: "text" },
      { name: "driver_vehicle_photo", type: "file", options: { maxSelect: 1 } },
      { name: "driver_cnpj", type: "text" },
      { name: "driver_pix_key", type: "text" },
      { name: "driver_fare_type", type: "select", options: { values: ["fixed", "km"] } },
      { name: "driver_fixed_rate", type: "number" },
      { name: "driver_km_rate", type: "number" },
      { name: "driver_accepts_rural", type: "bool" },
    ],
    options: {
        "emailVisibility": true,
        "allowOAuth2Auth": false,
        "allowUsernameAuth": false,
        "allowEmailAuth": true,
        "exceptEmailDomains": null,
        "onlyEmailDomains": null,
        "requireEmailVerification": false,
    },
    rules: {
      listRule: '@request.auth.id != ""',
      viewRule: 'id = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente" || @request.auth.role = "Motorista"',
      createRule: "", // Permite que qualquer um se registre
      updateRule: 'id = @request.auth.id || @request.auth.role = "Admin"',
      deleteRule: '@request.auth.role = "Admin"',
    }
  },
  // As outras coleções não precisam ser alteradas, pois o problema principal estava na 'users'
  // Adicione aqui as outras coleções se precisar criá-las do zero.
};


// -------------------------------------------------------------------
// FUNÇÃO PRINCIPAL (MAIN)
// -------------------------------------------------------------------
async function main() {
  try {
    // Autentica como superusuário/admin
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("✅ Autenticado no PocketBase como Administrador!");
  } catch (err) {
    console.error("❌ Falha na autenticação do admin. Verifique ADMIN_EMAIL e ADMIN_PASSWORD em initPocketBase_corrigido.js", err.message);
    return; // Encerra o script se a autenticação falhar
  }

  console.log("🔄 Iniciando verificação e atualização da coleção 'users'...");

  try {
    // Busca a coleção 'users' existente
    const usersCollection = await pb.collections.getOne("users");
    console.log("✔️ Coleção 'users' encontrada.");

    const existingFields = new Set(usersCollection.schema.map(field => field.name));
    const fieldsToAdd = collectionsDefinition.users.schema.filter(
      field => !existingFields.has(field.name)
    );

    if (fieldsToAdd.length > 0) {
      console.log(`  - Campos faltando: ${fieldsToAdd.map(f => f.name).join(', ')}`);
      
      // Adiciona os campos que estão faltando ao schema existente
      const updatedSchema = [...usersCollection.schema, ...fieldsToAdd];
      
      // Atualiza a coleção com o novo schema
      await pb.collections.update("users", { schema: updatedSchema });
      console.log("✅ Campos personalizados adicionados com sucesso à coleção 'users'!");
    } else {
      console.log("✔️ A coleção 'users' já possui todos os campos necessários.");
    }
    
    // Atualiza as regras da API
    await pb.collections.update("users", collectionsDefinition.users.rules);
    console.log("✅ Regras da API para a coleção 'users' atualizadas com sucesso!");


  } catch (err) {
    // Erro 404 significa que a coleção 'users' não existe
    if (err.status === 404) {
      console.log("⚠️ Coleção 'users' não encontrada. Tentando criar do zero...");
      try {
        const usersConfig = collectionsDefinition.users;
        await pb.collections.create({
            name: usersConfig.name,
            type: usersConfig.type,
            schema: usersConfig.schema,
            ...usersConfig.rules,
            ...usersConfig.options
        });
        console.log("✅ Coleção 'users' criada com sucesso!");
      } catch (createErr) {
        console.error(`❌ Erro ao criar a coleção 'users':`, createErr?.response?.data || createErr.message);
      }
    } else {
      // Outro erro ao buscar ou atualizar a coleção
      console.error(`❌ Erro ao processar a coleção 'users':`, err?.response?.data || err.message);
    }
  }

  // Você pode adicionar a lógica para outras coleções aqui se necessário

  console.log("\n🎉 Script de inicialização concluído!");
}

// Executa a função principal
main();
