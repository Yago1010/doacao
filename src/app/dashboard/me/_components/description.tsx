"use client";

import { debounce } from "lodash";
import { ChangeEvent, useRef, useState } from "react";

import { toast } from "sonner";
import { changeDescription } from "../_actions/change-bio";

export function Description({
  inicialDescription,
}: {
  inicialDescription: string;
}) {
  const [description, setDescription] = useState(inicialDescription);
  const [originalDescription] = useState(inicialDescription);

  const debounceSaveName = useRef(
    debounce(async (currentDescription: string) => {
      if (currentDescription.trim() === "") {
        setDescription(originalDescription);
        return;
      }

      if (currentDescription !== description) {
        try {
          const response = await changeDescription({
            description: currentDescription,
          });

          if (response.error) {
            toast.error(response.error);
            setDescription(currentDescription);
            return;
          }

          toast.success("Sua Bio foi atualizada com sucesso!");
        } catch (err) {
          console.error(err);
          setDescription(currentDescription);
        }
      }
    }, 500)
  ).current;

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setDescription(value);
    debounceSaveName(value);
  }

  return (
    <textarea
      className="text-base  bg-gray-50 border border-gray-100 rounded-md 
      outline-none p-z w-full max-w-2x1  my-3 h-40 resize-none text-center "
      value={description}
      onChange={handleChange}
    />
  );
}
