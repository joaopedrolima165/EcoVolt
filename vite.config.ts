import { Layout } from "@/components/layout";
import {
  useListAppliances,
  useCreateAppliance,
  useUpdateAppliance,
  useDeleteAppliance,
  getListAppliancesQueryKey,
  useGetAppliance,
  getGetApplianceQueryKey,
  useListReadings,
  getListReadingsQueryKey,
  useCreateReading,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Edit2, Trash2, Zap, Clock, Activity, Wind, Tv,
  UtensilsCrossed, Shirt, Lightbulb, Package, X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKwh, formatCurrency } from "@/lib/format";

const applianceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  category: z.string().min(1, "Selecione uma categoria"),
  wattage: z.coerce.number().min(1, "Potência deve ser maior que 0"),
  avgDailyHours: z.coerce.number().min(0.1, "Horas deve ser maior que 0").max(24),
});

const readingSchema = z.object({
  hoursUsed: z.coerce.number().min(0.1, "Deve ser maior que 0"),
});

const CATEGORIES = [
  { label: "Climatização", value: "Climatização", icon: Wind, color: "#06b6d4" },
  { label: "Cozinha", value: "Cozinha", icon: UtensilsCrossed, color: "#f97316" },
  { label: "Eletrônicos", value: "Eletrônicos", icon: Tv, color: "#a855f7" },
  { label: "Lavanderia", value: "Lavanderia", icon: Shirt, color: "#3b82f6" },
  { label: "Iluminação", value: "Iluminação", icon: Lightbulb, color: "#eab308" },
  { label: "Outros", value: "Outros", icon: Package, color: "#6b7280" },
];

function getCat(category: string) {
  const key = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
  return CATEGORIES.find(c => {
    const ck = c.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
    return ck === key || ck.startsWith(key) || key.startsWith(ck);
  }) || CATEGORIES[CATEGORIES.length - 1];
}

function ApplianceDetailsDialog({ applianceId, open, onOpenChange }: { applianceId: number | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { data: appliance } = useGetAppliance(applianceId as number, { query: { enabled: !!applianceId, queryKey: getGetApplianceQueryKey(applianceId as number) } });
  const { data: readings, isLoading } = useListReadings(
    { applianceId: applianceId as number },
    { query: { enabled: !!applianceId, queryKey: getListReadingsQueryKey({ applianceId: applianceId as number }) } }
  );
  const createReading = useCreateReading();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof readingSchema>>({
    resolver: zodResolver(readingSchema),
    defaultValues: { hoursUsed: 1 },
  });

  const onSubmit = (values: z.infer<typeof readingSchema>) => {
    if (!applianceId) return;
    createReading.mutate({ data: { applianceId, hoursUsed: values.hoursUsed } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReadingsQueryKey({ applianceId: applianceId! }) });
        form.reset();
        toast({ title: "Leitura adicionada!" });
      },
    });
  };

  const cat = appliance ? getCat(appliance.category) : CATEGORIES[0];
  const Icon = cat.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border-white/10" style={{ background: "hsl(222 22% 10%)" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${cat.color}20` }}>
              <Icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
            </div>
            Histórico de Uso
          </DialogTitle>
          <DialogDescription>
            {appliance?.name} · {appliance?.wattage}W
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2 mt-2">
            <FormField control={form.control} name="hoursUsed" render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-muted-foreground">Adicionar horas de uso</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" className="border-white/10 bg-white/5 focus:border-primary/50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" disabled={createReading.isPending} size="sm" className="mb-0.5">
              <Plus className="w-4 h-4" />
            </Button>
          </form>
        </Form>

        <div className="space-y-2 max-h-[240px] overflow-y-auto mt-2">
          {isLoading ? (
            <Skeleton className="h-12 w-full bg-white/5" />
          ) : readings?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhuma leitura registrada.</p>
          ) : (
            readings?.map(r => (
              <div key={r.id} className="flex justify-between items-center rounded-lg px-3 py-2.5 border border-white/5" style={{ background: "hsl(222 25% 7%)" }}>
                <div>
                  <span className="text-sm font-medium">{new Date(r.date).toLocaleDateString("pt-BR")}</span>
                  <span className="text-xs text-muted-foreground ml-2">{r.hoursUsed}h</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-primary">{formatKwh(r.kwh)}</span>
                  <span className="block text-xs text-muted-foreground">{formatCurrency(r.cost)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Appliances() {
  const { data: appliances, isLoading } = useListAppliances();
  const createMutation = useCreateAppliance();
  const updateMutation = useUpdateAppliance();
  const deleteMutation = useDeleteAppliance();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof applianceSchema>>({
    resolver: zodResolver(applianceSchema),
    defaultValues: { name: "", category: "", wattage: 0, avgDailyHours: 1 },
  });

  const onSubmit = (values: z.infer<typeof applianceSchema>) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: values }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAppliancesQueryKey() });
          setIsAddOpen(false);
          setEditingId(null);
          form.reset();
          toast({ title: "Aparelho atualizado!" });
        },
      });
    } else {
      createMutation.mutate({ data: values }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAppliancesQueryKey() });
          setIsAddOpen(false);
          form.reset();
          toast({ title: "Aparelho adicionado!" });
        },
      });
    }
  };

  const openEdit = (appliance: any) => {
    setEditingId(appliance.id);
    form.reset({ name: appliance.name, category: appliance.category, wattage: appliance.wattage, avgDailyHours: appliance.avgDailyHours });
    setIsAddOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Excluir este aparelho?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAppliancesQueryKey() });
          toast({ title: "Aparelho excluído" });
        },
      });
    }
  };

  const totalMonthlyKwh = appliances?.reduce((s, a) => s + (a.wattage * a.avgDailyHours * 30) / 1000, 0) || 0;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Meus <span className="text-primary">Aparelhos</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Gerencie e monitore seus eletrodomésticos</p>
          </div>
          <div className="flex items-center gap-3">
            {appliances && appliances.length > 0 && (
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">Total mensal estimado</p>
                <p className="text-base font-bold text-primary">{totalMonthlyKwh.toFixed(1)} kWh</p>
              </div>
            )}
            <Dialog open={isAddOpen} onOpenChange={(open) => {
              setIsAddOpen(open);
              if (!open) { setEditingId(null); form.reset({ name: "", category: "", wattage: 0, avgDailyHours: 1 }); }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[440px] border-white/10" style={{ background: "hsl(222 22% 10%)" }}>
                <DialogHeader>
                  <DialogTitle>{editingId ? "Editar Aparelho" : "Novo Aparelho"}</DialogTitle>
                  <DialogDescription>Preencha os dados do eletrodoméstico.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Ar-condicionado Sala" className="border-white/10 bg-white/5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-white/10 bg-white/5">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-white/10" style={{ background: "hsl(222 22% 10%)" }}>
                            {CATEGORIES.map(c => (
                              <SelectItem key={c.value} value={c.value}>
                                <div className="flex items-center gap-2">
                                  <c.icon className="w-3.5 h-3.5" style={{ color: c.color }} />
                                  {c.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={form.control} name="wattage" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Potência (W)</FormLabel>
                          <FormControl>
                            <Input type="number" className="border-white/10 bg-white/5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="avgDailyHours" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Uso Diário (h)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" className="border-white/10 bg-white/5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <DialogFooter className="pt-2">
                      <Button type="button" variant="outline" className="border-white/10" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingId ? "Salvar" : "Adicionar"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-44 rounded-2xl bg-white/5" />)}
          </div>
        ) : appliances?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-white/10">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Nenhum aparelho ainda</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-5">
              Adicione seus eletrodomésticos para começar a monitorar o consumo da sua casa.
            </p>
            <Button onClick={() => setIsAddOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Adicionar Primeiro Aparelho
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {appliances?.map((appliance) => {
              const cat = getCat(appliance.category);
              const Icon = cat.icon;
              const monthKwh = (appliance.wattage * appliance.avgDailyHours * 30) / 1000;
              const pct = totalMonthlyKwh > 0 ? (monthKwh / totalMonthlyKwh) * 100 : 0;
              return (
                <div
                  key={appliance.id}
                  className="group rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-200 flex flex-col overflow-hidden"
                  style={{ background: "hsl(222 22% 10%)" }}
                >
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}30` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: cat.color }} />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewingId(appliance.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(appliance)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(appliance.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-foreground leading-tight mb-0.5">{appliance.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{appliance.category}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Zap className="w-3 h-3" style={{ color: cat.color }} />
                        <span>{appliance.wattage}W</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{appliance.avgDailyHours}h/dia</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-1 pt-0">
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${cat.color}80, ${cat.color})`,
                          boxShadow: `0 0 6px ${cat.color}60`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Consumo mensal</span>
                    <span className="text-sm font-bold" style={{ color: cat.color }}>
                      {monthKwh.toFixed(1)} kWh
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <ApplianceDetailsDialog
          applianceId={viewingId}
          open={viewingId !== null}
          onOpenChange={(open) => !open && setViewingId(null)}
        />
      </div>
    </Layout>
  );
}
