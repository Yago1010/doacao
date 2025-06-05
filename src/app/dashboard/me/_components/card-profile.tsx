import Image from "next/image";
import { Name } from "./name";
import { Description } from "./description";

interface CardProfileProps {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    bio: string | null;
    image: string | null;
  };
}

export function CardProfile({ user }: CardProfileProps) {
  return (
    <section className="w-full flex flex-col items-center mx-auto px-4">
      <div className="">
        <Image
          src={user.image ?? "https://github.com/devfraga.png"}
          alt="Foto do perfil"
          width={100}
          height={100}
          className="rounded-x1 bg-gray-50 object-cover border-4 border-white hover:shadow-x1 duration-300"
          priority
          quality={100}
        />
      </div>

      <div>
        <Name initialName={user.name || "Digite seu nome..."} />
        <Description
          inicialDescription={user.bio ?? "Digite sua biografia..."}
        />
      </div>
    </section>
  );
}
