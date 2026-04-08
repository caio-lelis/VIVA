"use client"

import { cn } from "@/lib/utils"
import {
  Receipt,
  FileText,
  Landmark,
  ScrollText,
  Wrench,
  ClipboardList,
  FileImage,
  FolderOpen,
} from "lucide-react"

export interface Service {
  id: string
  label: string
  description: string
  icon: React.ElementType
  acceptedTypes: string[]
  folder: string
}

export const SERVICES: Service[] = [
  {
    id: "nota-fiscal",
    label: "Nota Fiscal",
    description: "NFs de fornecedores e prestadores de serviço",
    icon: Receipt,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    folder: "notas-fiscais",
  },
  {
    id: "ata-reuniao",
    label: "Ata de Reunião",
    description: "Atas de assembleias e reuniões de síndico",
    icon: ScrollText,
    acceptedTypes: [".pdf", ".doc", ".docx"],
    folder: "atas",
  },
  {
    id: "boleto",
    label: "Boleto / Financeiro",
    description: "Boletos de cobrança e comprovantes de pagamento",
    icon: Landmark,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    folder: "financeiro",
  },
  {
    id: "contrato",
    label: "Contrato",
    description: "Contratos com fornecedores e prestadores",
    icon: FileText,
    acceptedTypes: [".pdf", ".doc", ".docx"],
    folder: "contratos",
  },
  {
    id: "ordem-servico",
    label: "Ordem de Serviço",
    description: "OS de manutenção e reparos",
    icon: Wrench,
    acceptedTypes: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
    folder: "ordens-servico",
  },
  {
    id: "vistoria",
    label: "Vistoria / Laudo",
    description: "Laudos técnicos e relatórios de vistoria",
    icon: ClipboardList,
    acceptedTypes: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
    folder: "vistorias",
  },
  {
    id: "foto",
    label: "Foto / Imagem",
    description: "Registros fotográficos de obras e áreas comuns",
    icon: FileImage,
    acceptedTypes: [".jpg", ".jpeg", ".png", ".webp"],
    folder: "fotos",
  },
  {
    id: "outros",
    label: "Outros Documentos",
    description: "Documentos gerais não listados acima",
    icon: FolderOpen,
    acceptedTypes: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png"],
    folder: "outros",
  },
]

interface ServiceSelectorProps {
  selected: Service | null
  onSelect: (service: Service) => void
}

export function ServiceSelector({ selected, onSelect }: ServiceSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {SERVICES.map((service) => {
        const Icon = service.icon
        const isSelected = selected?.id === service.id

        return (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className={cn(
              "group flex flex-col gap-3 rounded-xl border p-4 text-left transition-all",
              isSelected
                ? "border-primary/40 bg-secondary text-foreground shadow-sm"
                : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                isSelected
                  ? "border-primary/30 bg-primary"
                  : "border-border bg-secondary group-hover:border-primary/30 group-hover:bg-secondary"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isSelected
                    ? "text-primary-foreground"
                    : "text-foreground group-hover:text-primary"
                )}
              />
            </div>
            <div>
              <p
                className={cn(
                  "text-sm font-semibold leading-tight",
                  isSelected ? "text-foreground" : "text-foreground"
                )}
              >
                {service.label}
              </p>
              <p
                className={cn(
                  "mt-1 text-xs leading-relaxed",
                  isSelected ? "text-muted-foreground" : "text-muted-foreground"
                )}
              >
                {service.description}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
