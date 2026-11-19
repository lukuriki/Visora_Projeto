
import bcrypt from "bcryptjs";
import { pool } from "./database.js";

const administradores = [
  {
    nome: "Fernanda Matsudo",
    email: "fernandamatsudo@visora.com.br",
    senha: process.env.ADMIN_01_PASSWORD,
  },
  {
    nome: "Luiza Kuriki",
    email: "luizakuriki@visora.com.br",
    senha: process.env.ADMIN_02_PASSWORD,
  },
  {
    nome: "Leonardo Pereira",
    email: "leonardopereira@visora.com.br",
    senha: process.env.ADMIN_03_PASSWORD,
  },
  {
    nome: "Marco Castelani",
    email: "marcocastelani@visora.com.br",
    senha: process.env.ADMIN_04_PASSWORD,
  },
  {
    nome: "Nicolly Medeiros",
    email: "nicollymedeiros@visora.com.br",
    senha: process.env.ADMIN_05_PASSWORD,
  },
  {
    nome: "Raphael Mondim",
    email: "raphaelmondim@visora.com.br",
    senha: process.env.ADMIN_06_PASSWORD,
  },
];

export async function seedAdministradores() {
  for (const admin of administradores) {
    if (!admin.senha || admin.senha.length < 12) {
      throw new Error(
        `Senha inicial não configurada para ${admin.email}`
      );
    }

    const [existentes] = await pool.execute(
      "SELECT id FROM administrador WHERE email = ? LIMIT 1",
      [admin.email]
    );

    if (existentes.length > 0) {
      continue;
    }

    const senhaHash = await bcrypt.hash(admin.senha, 12);

    await pool.execute(
      `INSERT INTO administrador (nome, email, senha)
       VALUES (?, ?, ?)`,
      [admin.nome, admin.email, senhaHash]
    );

    console.log(`Administrador cadastrado: ${admin.email}`);
  }
}
