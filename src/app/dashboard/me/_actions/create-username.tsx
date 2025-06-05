"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/utils/create-slug";

const createUsernameSchema = z.object({
  username: z
    .string({ message: " o username é obrigatório" })
    .min(4, "o username precisa ter no minimo 4 caracteres"),
});

type CreateUsernameFormData = z.infer<typeof createUsernameSchema>;
export async function createUsername(data: CreateUsernameFormData) {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: "Usuário não autenticado",
    };
  }
  const schema = createUsernameSchema.safeParse(data);

  if (!schema.success) {
    console.log(schema);
    return {
      data: null,
      error: schema.error.issues[0].message,
    };
  }

  try {
    const userId = session.user.id;

    const slug = createSlug(data.username);

    const existingUser = await prisma.user.findUnique({
      where: {
        username: slug,
      },
    });

    if (existingUser) {
      return {
        data: null,
        error: "Username ja cadastrado",
      };
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: slug,
      },
    });

    return {
      data: slug,
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      data: null,
      error: "Erro ao criar username",
    };
  }
}
