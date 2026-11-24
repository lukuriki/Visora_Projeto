
import "dotenv/config";
import bcrypt from "bcryptjs";

import { pool } from "../config/database.js";
import { administradores } from "../data/administradores.js";

async function cadastrarAdministradores() {
  try {
    console.log("Iniciando cadastro dos administradores...");

    for (const admin of administradores) {

      const [existentes] = await pool.execute(
        `SELECT id
         FROM administrador
         WHERE email = ?
         LIMIT 1`,
        [admin.email]
      );

      if (existentes.length > 0) {
        console.log(`Administrador já cadastrado: ${admin.email}`);

        continue;
      }

      const senhaCriptografada = await bcrypt.hash(admin.senha, 12);

      await pool.execute(
        `INSERT INTO administrador (
          nome,
          email,
          senha
        )
        VALUES (?, ?, ?)`,
        [
          admin.nome,
          admin.email.toLowerCase(),
          senhaCriptografada,
        ]
      );

      console.log(`Administrador cadastrado: ${admin.email}`);
    }

    console.log("Cadastro dos administradores finalizado!");
  } catch (error) {
    console.error("Erro ao cadastrar administradores:", error);

    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

cadastrarAdministradores();