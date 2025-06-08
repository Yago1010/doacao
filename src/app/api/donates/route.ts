import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const Get = auth(async function GET(request) {
  if (!request.auth) {
    return NextResponse.json(
      { error: "Usuário nao autenticado" },
      { status: 401 }
    );
  }

  try {
    const donates = await prisma.donation.findMany({
      where: {
        userId: request.auth.user?.id,
        status: "PAID",
      },
      orderBy: {
        createdAt: "desc",
      },

    });

    return NextResponse.json({ data: donates });
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao buscar donates" },
      { status: 400 }
    );
  }
});
