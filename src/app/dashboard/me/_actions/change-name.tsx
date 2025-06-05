"use server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const changeNameSchema = z.object({
  name: z.string().min(4, "O nome é obrigatório"),
});

type ChangeNameFormData = z.infer<typeof changeNameSchema>;
export async function changeName(data: ChangeNameFormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      data: null,
      error: "Usuário não autenticado",
    };
  }

  const schema = changeNameSchema.safeParse(data);

  if (!schema.success) {
    return {
      data: null,
      error: schema.error.issues[0].message,
    };
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: data.name },
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
