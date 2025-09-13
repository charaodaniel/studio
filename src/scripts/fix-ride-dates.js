
// IMPORTANTE: Este script é para ser executado manualmente via Node.js
// no seu ambiente de desenvolvimento para corrigir datas inválidas na coleção 'rides'.
// --------------------------------------------------------------------------
//
// COMO EXECUTAR:
// 1. Abra o terminal na pasta raiz do seu projeto.
// 2. Execute o seguinte comando:
//    node src/scripts/fix-ride-dates.js
//
// O QUE ELE FAZ:
// - Conecta-se ao seu backend PocketBase.
// - Autentica-se como administrador (VOCÊ PRECISA INSERIR SUAS CREDENCIAIS ABAIXO).
// - Busca TODAS as corridas no banco de dados.
// - Para cada corrida, ele verifica se o campo 'created' é uma data válida.
// - Se a data for inválida ou nula, ele gera uma data e hora aleatórias
//   entre 20 de Julho de 2024 e a data atual.
// - Atualiza o registro da corrida com a nova data.
// - Exibe o progresso no terminal.
//
// --------------------------------------------------------------------------

import PocketBase from 'pocketbase';
import fetch from 'isomorphic-fetch';

// --- CONFIGURAÇÃO ---
const POCKETBASE_URL = 'https://mobmv.shop'; // Substitua pela URL do seu PocketBase
const ADMIN_EMAIL = 'seu-email-de-admin@exemplo.com'; // <<< INSIRA SEU EMAIL DE ADMIN AQUI
const ADMIN_PASSWORD = 'sua-senha-de-admin';      // <<< INSIRA SUA SENHA DE ADMIN AQUI
// --------------------


// Função para gerar uma data aleatória em um intervalo
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function fixRideDates() {
  console.log('--- Iniciando script de correção de datas ---');

  if (ADMIN_EMAIL === 'seu-email-de-admin@exemplo.com' || ADMIN_PASSWORD === 'sua-senha-de-admin') {
    console.error('\x1b[31m%s\x1b[0m', 'ERRO: Por favor, configure seu ADMIN_EMAIL e ADMIN_PASSWORD no script antes de executar.');
    return;
  }

  const pb = new PocketBase(POCKETBASE_URL);
  
  try {
    // 1. Autenticar como admin
    console.log('Autenticando como administrador...');
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('\x1b[32m%s\x1b[0m', 'Autenticação bem-sucedida.');

    // 2. Buscar todas as corridas
    console.log('Buscando todas as corridas...');
    const allRides = await pb.collection('rides').getFullList({
        sort: '-created',
    });
    console.log(`Encontradas ${allRides.length} corridas.`);

    const startDate = new Date('2024-07-20T00:00:00Z');
    const endDate = new Date();
    let updatedCount = 0;

    // 3. Iterar e corrigir
    for (const ride of allRides) {
      const createdDate = new Date(ride.created);
      // Verifica se a data é inválida ou nula
      if (!ride.created || isNaN(createdDate.getTime())) {
        const newRandomDate = randomDate(startDate, endDate);
        
        try {
          process.stdout.write(`Corrigindo corrida ID ${ride.id}... `);
          await pb.collection('rides').update(ride.id, {
            'created': newRandomDate.toISOString(),
            'updated': newRandomDate.toISOString(), // Também atualiza 'updated' para consistência
          });
          process.stdout.write('\x1b[32mOK\x1b[0m\n');
          updatedCount++;
        } catch (updateError) {
          process.stdout.write('\x1b[31mFALHOU\x1b[0m\n');
          console.error(`  Erro ao atualizar ${ride.id}:`, updateError);
        }
      }
    }

    if (updatedCount > 0) {
      console.log('\x1b[32m%s\x1b[0m', `\nSucesso! ${updatedCount} corridas foram atualizadas com datas aleatórias.`);
    } else {
      console.log('\nNenhuma corrida com data inválida foi encontrada. Nenhuma alteração foi necessária.');
    }

  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '\n--- Ocorreu um erro durante o processo ---');
    console.error('Verifique a URL do PocketBase e suas credenciais de administrador.');
    console.error('Detalhes do erro:', error.data || error.message);
  } finally {
    console.log('--- Script de correção finalizado ---');
    pb.authStore.clear();
  }
}

fixRideDates();
