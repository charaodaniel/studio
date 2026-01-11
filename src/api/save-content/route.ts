
import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME;
const FILE_PATH = 'src/database/banco.json';

function getRepoPath() {
    if (!GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
        throw new Error('As variáveis de ambiente GITHUB_REPO_OWNER e GITHUB_REPO_NAME não foram configuradas.');
    }
    return `${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`;
}

async function getFileSha(repo: string): Promise<string | undefined> {
    if (!GITHUB_TOKEN) {
        throw new Error('A variável de ambiente GITHUB_TOKEN não foi configurada no servidor.');
    }

    const githubApiUrl = `https://api.github.com/repos/${repo}/contents/${FILE_PATH}`;

    try {
        const fileResponse = await fetch(githubApiUrl, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
            },
            cache: 'no-store' // Always get the latest SHA
        });

        if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            return fileData.sha;
        } else if (fileResponse.status === 404) {
            return undefined; // File doesn't exist, no SHA
        } else {
            const errorData = await fileResponse.json();
            console.error('Falha ao buscar SHA do arquivo no GitHub:', errorData);
            throw new Error(`Falha ao buscar o arquivo no GitHub: ${errorData.message || fileResponse.statusText}`);
        }
    } catch (fetchError: any) {
        console.error('Erro de rede ao buscar SHA:', fetchError);
        throw new Error(`Erro ao contatar a API do GitHub para obter SHA: ${fetchError.message}`);
    }
}

export async function GET(request: Request) {
    try {
        const repo = getRepoPath();
        const githubApiUrl = `https://api.github.com/repos/${repo}/contents/${FILE_PATH}`;

        const fileResponse = await fetch(githubApiUrl, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
            },
            cache: 'no-store'
        });

        if (!fileResponse.ok) {
            const errorText = await fileResponse.text();
            console.error("GitHub GET error:", errorText);
             // If the file doesn't exist, return a default empty structure
            if (fileResponse.status === 404) {
                const defaultContent = { users: [], rides: [], documents: [], chats: [], messages: [], institutional_info: {} };
                return NextResponse.json({ content: JSON.stringify(defaultContent, null, 2) });
            }
            return NextResponse.json({ message: 'Falha ao buscar o arquivo do GitHub.', details: errorText }, { status: fileResponse.status });
        }

        const fileData = await fileResponse.json();
        
        if (fileData.encoding !== 'base64') {
             throw new Error('Codificação de arquivo inesperada recebida do GitHub.');
        }

        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        
        return NextResponse.json({ content });

    } catch (error: any) {
        console.error('Erro na API GET /api/save-content:', error);
        return NextResponse.json({ message: error.message || 'Ocorreu um erro no servidor ao buscar dados.' }, { status: 500 });
    }
}

export async function POST(request: Request) {
  try {
    const repo = getRepoPath();
    const { content } = await request.json();
    
    if (typeof content !== 'string') {
        return NextResponse.json({ message: 'Parâmetro "content" inválido ou ausente.' }, { status: 400 });
    }

    const githubApiUrl = `https://api.github.com/repos/${repo}/contents/${FILE_PATH}`;

    const currentSha = await getFileSha(repo);
    
    const contentBase64 = Buffer.from(content).toString('base64');

    const payload = {
      message: `CMS: Atualização em ${FILE_PATH}`,
      content: contentBase64,
      sha: currentSha,
    };

    const updateResponse = await fetch(githubApiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        if (updateResponse.status === 409) {
            // 409 Conflict: SHA mismatch, indicating the file was updated since we last fetched it.
            return NextResponse.json({ message: 'Conflito de versão. O arquivo foi alterado no servidor. Tente novamente.', error_code: 'CONFLICT' }, { status: 409 });
        }
        // Other errors
        throw new Error(`Falha ao atualizar o arquivo no GitHub: ${errorData.message || updateResponse.statusText}`);
    }

    const result = await updateResponse.json();

    return NextResponse.json({ message: 'Arquivo atualizado com sucesso!', data: result });

  } catch (error: any) {
    console.error('Erro na API POST /api/save-content:', error);
    return NextResponse.json({ message: error.message || 'Ocorreu um erro no servidor ao salvar.' }, { status: 500 });
  }
}
