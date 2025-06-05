"use client";

import { debounce } from "lodash";
import { useRef, useState } from "react";
import { changeName } from "../_actions/change-name";
import { toast } from "sonner";

export function Name({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [originalName] = useState(initialName);

  const debounceSaveName = useRef(
    debounce(async (currentName: string) => {
      if (currentName.trim() === "") {
        setName(originalName);
        return;
      }

      if (currentName !== name) {
        try {
          const response = await changeName({ name: currentName });

          if (response.error) {
            toast.error(response.error);
            setName(originalName);
            return;
          }

          toast.success("nome alterado com sucesso");
        } catch (err) {
          console.error(err);
          setName(originalName);
        }
      }
    }, 500)
  ).current;

  function handleChangeName(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setName(value);
    debounceSaveName(value);
  }

  return (
    <input
      className="text-x1 md:text-2x1 font-bold ng-gray-50 border border-gray-100 rounded-md outline-none 
      p-z w-full max-w-2x1 text-center my-3 "
      value={name}
      onChange={handleChangeName}
    />
  );
}
