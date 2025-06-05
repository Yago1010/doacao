"use server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const changeDescriptionSchema = z.object({
  description: z
    .string()
    .min(4, "A descrição precisa ter no minimo 4 caracteres"),
});

type changeDescriptionSchema = z.infer<typeof changeDescriptionSchema>;
export async function changeDescription(data: changeDescriptionSchema) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      data: null,
      error: "Usuário não autenticado",
    };
  }

  const schema = changeDescriptionSchema.safeParse(data);

  if (!schema.success) {
    return {
      data: null,
      error: schema.error.issues[0].message,
    };
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { bio: data.description },
    });

    return {
      data: user.name,
      error: null,
    };
  } catch (error) {
    console.log(error);
    return {
      data: null,
      error: "falha ao salvar alterações",
    };
  }
}
