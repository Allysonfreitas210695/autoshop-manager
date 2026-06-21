import { CheckCircle2, XCircle } from "lucide-react";
import { notFound } from "next/navigation";

import { getOrderForFeedback, hasFeedback } from "@/_data-access/feedbacks";

import { FeedbackClient } from "./_components/FeedbackClient";

type Props = { params: Promise<{ orderId: string }> };

export async function generateMetadata({ params }: Props) {
  const { orderId } = await params;
  return { title: `Pesquisa de Satisfação · O.S. ${orderId}` };
}

export default async function FeedbackPage({ params }: Props) {
  const { orderId } = await params;

  if (!orderId) {
    notFound();
  }

  const order = await getOrderForFeedback(orderId);

  if (!order) {
    notFound();
  }

  if (order.status !== "completed") {
    return (
      <div className="bg-surface min-h-screen p-6 pt-12 md:p-12 md:pt-24">
        <div className="bg-surface-container mx-auto max-w-xl rounded-2xl p-6 text-center shadow-sm md:p-10">
          <div className="bg-tertiary/10 text-tertiary mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
            <XCircle className="size-8" />
          </div>
          <h1 className="text-headline-sm text-on-surface mb-2 font-bold">
            Ordem de Serviço em Andamento
          </h1>
          <p className="text-body-md text-on-surface-variant">
            A O.S. #{order.orderNumber} ainda não foi finalizada. A pesquisa de
            satisfação estará disponível após a conclusão dos serviços.
          </p>
        </div>
      </div>
    );
  }

  const alreadySubmitted = await hasFeedback(orderId);

  if (alreadySubmitted) {
    return (
      <div className="bg-surface min-h-screen p-6 pt-12 md:p-12 md:pt-24">
        <div className="bg-surface-container mx-auto max-w-xl rounded-2xl p-6 text-center shadow-sm md:p-10">
          <div className="bg-status-completed/10 text-status-completed mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="text-headline-sm text-on-surface mb-2 font-bold">
            Avaliação já recebida!
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Identificamos que você já enviou uma avaliação para a O.S. #
            {order.orderNumber}. Agradecemos o seu feedback!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen p-6 pt-12 md:p-12 md:pt-24">
      <div className="bg-surface-container mx-auto max-w-xl rounded-2xl p-6 shadow-sm md:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-headline-sm text-on-surface font-bold">
            Pesquisa de Satisfação
          </h1>
          <p className="text-body-md text-on-surface-variant mt-2">
            Como foi o serviço realizado na O.S. #{order.orderNumber}?
            <br />
            <span className="font-mono text-sm opacity-80">
              {order.vehicleMake} {order.vehicleModel} · {order.plate}
            </span>
          </p>
        </div>

        <FeedbackClient orderId={orderId} />
      </div>
    </div>
  );
}
