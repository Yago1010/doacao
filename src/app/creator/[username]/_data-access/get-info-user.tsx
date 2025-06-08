"use server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const getInfoUsernameSchema = z.object({
  username: z.string({ message: "O username é obrigatório" }),
});

type CreateInfoUserSchema = z.infer<typeof getInfoUsernameSchema>;

export async function getInfoUser(data: CreateInfoUserSchema) {
  const schema = getInfoUsernameSchema.safeParse(data);

  if (!schema.success) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: data.username,
      },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
      },
    });

    return user;
  } catch (err) {
    return null;
  }
}
