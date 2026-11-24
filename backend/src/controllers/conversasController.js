import { criarConversa, listarConversas, buscarConversaPorId, listarMensagens, listarConversasPorUsuario, criarMensagemCliente, responderConversa, atualizarStatus } from "../services/conversasService.js";

export async function criarConversaController(req, res) {
  try {
    const { nome, sobrenome, email, empresa, assunto, mensagem } = req.body;

    if (!nome || !sobrenome || !email || !assunto || !mensagem) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos obrigatórios."
      });
    }

    const resultado = await criarConversa({
      usuarioId: req.usuario?.id || null,
      nome,
      sobrenome,
      email,
      empresa,
      assunto,
      mensagem,
    });

    return res.status(201).json(resultado);
  } catch (erro) {
    console.error("Erro ao criar conversa:", erro);

    return res.status(500).json({
      mensagem: "Não foi possível enviar sua mensagem.",
    });
  }
}

export async function listarConversasController(req, res) {
  try {
    const conversas = await listarConversas();
    return res.status(200).json(conversas);
  } catch (erro) {
    console.error("Erro ao listar conversas:", erro);
    return res.status(500).json({
      mensagem: "Não foi possível listar as conversas."
    });
  }
}

export async function buscarConversaController(req, res) {
  try {
    const { id } = req.params;
    const conversa = await buscarConversaPorId(id);

    if (!conversa) {
      return res.status(404).json({
        mensagem: "Conversa não encontrada."
      });
    }

    return res.status(200).json(conversa);
  } catch (erro) {
    console.error("Erro ao buscar conversa:", erro);

    return res.status(500).json({
      mensagem: "Não foi possível buscar a conversa."
    });
  }
}

export async function listarMensagensController(req, res) {
  try {
    const { id } = req.params;
    const conversa = await buscarConversaPorId(id);

    if (!conversa) {
      return res.status(404).json({
        mensagem: "Conversa não encontrada.",
      });
    }

    const mensagens = await listarMensagens(id);

    return res.status(200).json(mensagens);
  } catch (erro) {
    console.error("Erro ao listar mensagens:", erro);

    return res.status(500).json({
      mensagem: "Não foi possível carregar as mensagens."
    });
  }
}

export async function listarConversasUsuarioController(req, res) {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado."
      });
    }

    const conversas = await listarConversasPorUsuario(usuarioId);

    return res.status(200).json(conversas);
  } catch (erro) {
    console.error("Erro ao listar conversas do usuário:", erro);

    return res.status(500).json({
      mensagem: "Não foi possível carregar suas conversas."
    });
  }
}

export async function criarMensagemClienteController(req, res) {
  try {
    const { id } = req.params;
    const { mensagem } = req.body;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado."
      });
    }

    if (!mensagem || !mensagem.trim()) {
      return res.status(400).json({
        mensagem: "Digite uma mensagem."
      });
    }

    const conversa = await buscarConversaPorId(id);

    if (!conversa) {
      return res.status(404).json({
        mensagem: "Conversa não encontrada."
      });
    }

    if (Number(conversa.usuario_id) !== Number(usuarioId)) {
      return res.status(403).json({
        mensagem: "Você não tem permissão para acessar esta conversa."
      });
    }

    const resultado = await criarMensagemCliente(id, mensagem.trim());

    return res.status(201).json(resultado);
  } catch (erro) {
    console.error("Erro ao enviar mensagem:", erro);

    return res.status(500).json({
      mensagem: "Não foi possível enviar sua mensagem."
    });
  }
}

export async function responderConversaController(req, res) {
  try {
    const conversaId = Number(req.params.id);
    const { mensagem } = req.body;

    if (!Number.isSafeInteger(conversaId) || conversaId <= 0) {
      return res.status(400).json({
        mensagem: "ID da conversa inválido.",
      });
    }

    if (typeof mensagem !== "string" || !mensagem.trim()) {
      return res.status(400).json({
        mensagem: "Digite uma resposta válida.",
      });
    }

    const resultado = await responderConversa(conversaId, mensagem.trim()
);

    return res.status(resultado.emailEnviado ? 200 : 502).json(resultado);

  } catch (erro) {
    console.error("Erro ao responder conversa:", erro);

    if (erro.message === "Conversa não encontrada.") {
      return res.status(404).json({
        mensagem: erro.message,
      });
    }

    if (erro.message === "Não é possível responder uma conversa encerrada.") {
      return res.status(409).json({
        mensagem: erro.message,
      });
    }

    return res.status(500).json({
      mensagem: "Não foi possível responder à conversa.",
    });
  }
}

export async function atualizarStatusConversaController(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const resultado = await atualizarStatus(id, status);

    if (!resultado) {
      return res.status(404).json({
        mensagem: "Conversa não encontrada."
      });
    }

    return res.status(200).json({
      mensagem: "Status atualizado com sucesso."
    });
  } catch (erro) {
    console.error("Erro ao atualizar status:", erro);

    return res.status(400).json({
      mensagem: erro.message || "Não foi possível atualizar o status."
    });
  }
}