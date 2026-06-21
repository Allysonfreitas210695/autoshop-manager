import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  type AddOrderItemInput,
  addOrderItemSchema,
} from "@/_schemas/service-order";

export function useAddOrderItemForm(orderId: string) {
  return useForm<AddOrderItemInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(addOrderItemSchema) as any,
    defaultValues: {
      orderId,
      itemType: "part",
      quantity: 1,
      unitPrice: 0,
    },
  });
}
