
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO; // Ex: 'seu-usuario/seu-repositorio'

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return NextResponse.json(
      { message: 'As variáveis de ambiente GITHUB_TOKEN e GITHUB_REPO não foram configuradas no servidor.' },
      { status: 500 }
    );
  }

  try {
    const { filePath, content } = await request.json();
    
    if (!filePath || typeof content !== 'string') {
        return NextResponse.json({ message: 'Parâmetros "filePath" ou "content" inválidos.' }, { status: 400 });
    }

    const githubApiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;

    // 1. Obter o SHA do arquivo atual para garantir que estamos atualizando a versão mais recente
    let currentSha: string | undefined;
    try {
        const fileResponse = await fetch(githubApiUrl, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            currentSha = fileData.sha;
        } else if (fileResponse.status !== 404) {
            // Se o erro não for "não encontrado", algo deu errado
            const errorData = await fileResponse.json();
            throw new Error(`Falha ao buscar o arquivo no GitHub: ${errorData.message || fileResponse.statusText}`);
        }
        // Se for 404, o arquivo não existe, então não precisamos do SHA (criação).
    } catch (fetchError: any) {
         // Tratar erro de rede ou se o fetch falhar
         return NextResponse.json({ message: `Erro ao contatar a API do GitHub: ${fetchError.message}` }, { status: 500 });
    }
    

    // 2. Enviar o novo conteúdo para o GitHub
    const contentBase64 = Buffer.from(content).toString('base64');

    const payload = {
      message: `CMS: Atualização em ${filePath}`,
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
        throw new Error(`Falha ao atualizar o arquivo no GitHub: ${errorData.message || updateResponse.statusText}`);
    }

    const result = await updateResponse.json();

    return NextResponse.json({ message: 'Arquivo atualizado com sucesso!', data: result });

  } catch (error: any) {
    console.error('Erro na API /api/save-content:', error);
    return NextResponse.json({ message: error.message || 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}
