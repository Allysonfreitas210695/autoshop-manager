"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateCustomerAction } from "@/_actions/customers";
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

type CustomerData = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  address: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  customer: CustomerData;
};

export function EditCustomerDrawer({ open, onClose, customer }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? "",
      cpf: customer.cpf ?? "",
      address: customer.address ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone ?? "",
        cpf: customer.cpf ?? "",
        address: customer.address ?? "",
      });
    }
  }, [open, customer, reset]);

  const { execute, status } = useAction(updateCustomerAction, {
    onSuccess: () => {
      toast.success("Cadastro atualizado com sucesso.");
      onClose();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao atualizar cadastro.");
    },
  });

  function onSubmit(data: CustomerFormData) {
    execute({
      id: customer.id,
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
            Editar Cadastro
          </SheetTitle>
          <SheetDescription className="text-on-surface-variant text-label-sm">
            Atualize os dados do cliente
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-4 py-5">
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-name"
              className="text-on-surface-variant font-mono"
            >
              Nome *
            </Label>
            <Input
              id="edit-name"
              placeholder="Nome completo"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-label-xs text-error">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="edit-email"
              className="text-on-surface-variant font-mono"
            >
              E-mail *
            </Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="email@exemplo.com"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-label-xs text-error">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="edit-phone"
              className="text-on-surface-variant font-mono"
            >
              Telefone
            </Label>
            <Input
              id="edit-phone"
              placeholder="(11) 99999-9999"
              {...register("phone")}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="edit-cpf"
              className="text-on-surface-variant font-mono"
            >
              CPF
            </Label>
            <Input
              id="edit-cpf"
              placeholder="000.000.000-00"
              {...register("cpf")}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="edit-address"
              className="text-on-surface-variant font-mono"
            >
              Endereço
            </Label>
            <Input
              id="edit-address"
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
            {status === "executing" ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
