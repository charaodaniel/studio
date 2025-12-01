// @ts-nocheck
'use server';

import { Octokit } from 'octokit';

// Helper function to initialize Octokit
function getOctokit() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('Variável de ambiente GITHUB_TOKEN não está definida.');
  }
  return new Octokit({ auth: token });
}

// Helper function to get repo details from environment variables
function getRepoDetails() {
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  if (!owner || !repo) {
    throw new Error('Variáveis de ambiente GITHUB_REPO_OWNER e GITHUB_REPO_NAME são obrigatórias.');
  }
  return { owner, repo };
}

/**
 * Lê o conteúdo de um arquivo do repositório do GitHub.
 * @param {string} path - O caminho para o arquivo no repositório (ex: 'db.json').
 * @returns {Promise<{content: object, sha: string}>} O conteúdo do arquivo parseado como JSON e o SHA do arquivo.
 */
export async function readFileFromRepo(path: string) {
  const octokit = getOctokit();
  const { owner, repo } = getRepoDetails();

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      mediaType: {
        format: 'raw',
      },
    });

    // We need the SHA for updates, so we make a separate call
    const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
    });

    // @ts-ignore
    const content = JSON.parse(data);
    // @ts-ignore
    const sha = fileData.sha;

    return { content, sha };
  } catch (error) {
    // @ts-ignore
    if (error.status === 404) {
      console.warn(`Arquivo não encontrado em ${path}. Retornando nulo.`);
      return { content: null, sha: null };
    }
    console.error('Erro ao ler arquivo do repositório:', error);
    throw new Error('Não foi possível ler os dados do repositório.');
  }
}

/**
 * Salva (cria ou atualiza) um arquivo no repositório do GitHub.
 * @param {string} path - O caminho para o arquivo no repositório (ex: 'db.json').
 * @param {object} content - O conteúdo do objeto a ser salvo como JSON.
 * @param {string} message - A mensagem de commit.
 * @param {string | null} sha - O SHA do arquivo, necessário para atualizações. Se for null, cria um novo arquivo.
 * @returns {Promise<void>}
 */
export async function saveFileToRepo(path: string, content: object, message: string, sha: string | null) {
  const octokit = getOctokit();
  const { owner, repo } = getRepoDetails();
  
  const contentString = JSON.stringify(content, null, 2);
  const contentBuffer = Buffer.from(contentString).toString('base64');

  try {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: contentBuffer,
      sha: sha || undefined, // sha é nulo se for um novo arquivo
    });
  } catch (error) {
    console.error('Erro ao salvar arquivo no repositório:', error);
    throw new Error('Não foi possível salvar os dados no repositório.');
  }
}
