"use client";

import { CheckCircle2, MessageSquare } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { submitFeedbackAction } from "@/_actions/feedbacks";
import { Button } from "@/_components/ui/button";

type Props = {
  orderId: string;
};

export function FeedbackClient({ orderId }: Props) {
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { execute, status } = useAction(submitFeedbackAction, {
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Avaliação enviada com sucesso! Obrigado.");
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao enviar avaliação.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (score === null) {
      toast.error("Por favor, selecione uma nota de 0 a 10.");
      return;
    }
    execute({ orderId, score, comment });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
        <div className="bg-status-completed/10 text-status-completed flex size-16 items-center justify-center rounded-full">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="text-headline-sm text-on-surface font-bold">
          Muito Obrigado!
        </h2>
        <p className="text-body-md text-on-surface-variant max-w-sm">
          Sua avaliação foi registrada com sucesso. Ela é fundamental para
          continuarmos melhorando nossos serviços!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <p className="text-body-lg text-on-surface text-center">
          De 0 a 10, o quanto você recomendaria nossos serviços para um amigo ou
          familiar?
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setScore(num)}
              className={`flex size-10 items-center justify-center rounded-md font-mono text-lg font-bold transition-colors sm:size-12 ${
                score === num
                  ? "bg-secondary text-surface"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-highest border-outline-variant border"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="text-label-sm text-on-surface-variant flex justify-between px-2 font-mono">
          <span>0 - Não recomendaria</span>
          <span>10 - Com certeza recomendaria</span>
        </div>
      </div>

      <div className="space-y-3">
        <label
          htmlFor="comment"
          className="text-label-md text-on-surface flex items-center gap-2 font-mono font-medium"
        >
          <MessageSquare className="text-secondary size-4" />
          Gostaria de deixar um comentário? (Opcional)
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte-nos o que achou do atendimento, prazo, qualidade..."
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 dark:bg-input/30 w-full rounded-lg border bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-3"
        />
      </div>

      <Button
        type="submit"
        className="w-full font-mono text-base font-bold"
        size="lg"
        disabled={status === "executing" || score === null}
      >
        {status === "executing" ? "Enviando..." : "Enviar Avaliação"}
      </Button>
    </form>
  );
}
