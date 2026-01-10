
import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // Ex: 'seu-usuario/seu-repositorio'
const FILE_PATH = 'src/database/banco.json'; // Hardcoded file path

// Cache para o SHA do arquivo
let fileShaCache: string | undefined = undefined;

async function getFileSha(): Promise<string | undefined> {
    if (fileShaCache) {
        return fileShaCache;
    }

    if (!GITHUB_TOKEN || !GITHUB_REPO) {
        throw new Error('Variáveis de ambiente do GitHub não configuradas.');
    }

    const githubApiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;

    try {
        const fileResponse = await fetch(githubApiUrl, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
            },
            // Revalidate cache every 5 seconds
            next: { revalidate: 5 }
        });

        if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            fileShaCache = fileData.sha;
            return fileData.sha;
        } else if (fileResponse.status === 404) {
            // File doesn't exist, no SHA to return
            return undefined;
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
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
        return NextResponse.json(
            { message: 'As variáveis de ambiente do GitHub não foram configuradas no servidor.' },
            { status: 500 }
        );
    }
    
    const githubApiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;

    try {
         const fileResponse = await fetch(githubApiUrl, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3.raw', // Obter o conteúdo bruto
            },
            // Revalidate cache to get the latest content
            cache: 'no-store'
        });

        if (!fileResponse.ok) {
            const errorText = await fileResponse.text();
            console.error("GitHub GET error:", errorText);
            return NextResponse.json({ message: 'Falha ao buscar o arquivo do GitHub.', details: errorText }, { status: fileResponse.status });
        }

        const content = await fileResponse.text();
        return NextResponse.json({ content });

    } catch (error: any) {
        console.error('Erro na API GET /api/save-content:', error);
        return NextResponse.json({ message: error.message || 'Ocorreu um erro no servidor.' }, { status: 500 });
    }
}


export async function POST(request: Request) {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return NextResponse.json(
      { message: 'As variáveis de ambiente GITHUB_TOKEN e GITHUB_REPO não foram configuradas no servidor.' },
      { status: 500 }
    );
  }

  try {
    const { content } = await request.json();
    
    if (typeof content !== 'string') {
        return NextResponse.json({ message: 'Parâmetro "content" inválido ou ausente.' }, { status: 400 });
    }

    const githubApiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;

    // 1. Obter o SHA do arquivo atual para garantir que estamos atualizando a versão mais recente
    const currentSha = await getFileSha();
    
    // 2. Enviar o novo conteúdo para o GitHub
    const contentBase64 = Buffer.from(content).toString('base64');

    const payload = {
      message: `CMS: Atualização em ${FILE_PATH}`,
      content: contentBase64,
      sha: currentSha, // Se currentSha for undefined, a API criará um novo arquivo
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
        // Se houver um conflito de SHA, invalide o cache e peça para o cliente tentar novamente
        if (updateResponse.status === 409) {
            fileShaCache = undefined; // Invalidate cache
            return NextResponse.json({ message: 'Conflito de versão. Tente salvar novamente.', error_code: 'CONFLICT' }, { status: 409 });
        }
        throw new Error(`Falha ao atualizar o arquivo no GitHub: ${errorData.message || updateResponse.statusText}`);
    }

    const result = await updateResponse.json();

    // Invalida o cache do SHA após uma escrita bem-sucedida para forçar a busca na próxima vez
    fileShaCache = result.content.sha;

    return NextResponse.json({ message: 'Arquivo atualizado com sucesso!', data: result });

  } catch (error: any) {
    console.error('Erro na API POST /api/save-content:', error);
    return NextResponse.json({ message: error.message || 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}
