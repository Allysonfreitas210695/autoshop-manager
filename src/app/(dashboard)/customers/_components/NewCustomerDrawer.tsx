"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createCustomerAction } from "@/_actions/customers";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/_components/ui/sheet";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres."),
  email: z.string().email("E-mail inválido."),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  address: z.string().optional(),
});

type CustomerFormData = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
};

export function NewCustomerDrawer({ open, onClose }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      address: "",
    },
  });

  const { execute, status } = useAction(createCustomerAction, {
    onSuccess: () => {
      toast.success("Cliente cadastrado com sucesso.");
      reset();
      onClose();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao cadastrar cliente.");
    },
  });

  function onSubmit(data: CustomerFormData) {
    execute({
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      cpf: data.cpf || undefined,
      address: data.address || undefined,
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="bg-surface w-full overflow-y-auto sm:max-w-lg"
      >
        <SheetHeader className="border-outline-variant/30 border-b pb-4">
          <SheetTitle className="text-on-surface flex items-center gap-2">
            <User className="text-secondary size-5" />
            Novo Cliente
          </SheetTitle>
          <SheetDescription className="text-on-surface-variant text-label-sm">
            Preencha os dados para cadastrar o cliente
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-1 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-on-surface-variant font-mono">
              Nome *
            </Label>
            <Input
              id="name"
              placeholder="Nome completo"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-label-xs text-error">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-on-surface-variant font-mono"
            >
              E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-label-xs text-error">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="phone"
              className="text-on-surface-variant font-mono"
            >
              Telefone
            </Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              {...register("phone")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cpf" className="text-on-surface-variant font-mono">
              CPF
            </Label>
            <Input id="cpf" placeholder="000.000.000-00" {...register("cpf")} />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="address"
              className="text-on-surface-variant font-mono"
            >
              Endereço
            </Label>
            <Input
              id="address"
              placeholder="Rua, número, bairro, cidade"
              {...register("address")}
            />
          </div>
        </form>

        <SheetFooter className="border-outline-variant/30 gap-2 border-t pt-4">
          <SheetClose
            render={
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            }
          />
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={status === "executing"}
          >
            {status === "executing" ? "Salvando..." : "Cadastrar Cliente"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
